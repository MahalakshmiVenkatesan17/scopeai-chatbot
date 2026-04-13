"""
Document processing service – extraction, chunking, embedding, storage.

Mirrors Node.js DocumentProcessingService.ts.
"""

import os
import asyncio
import hashlib
from dataclasses import dataclass

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory
from app.core.logging import logger
from app.services.openai_service import OpenAIService
from app.services.pdf_service import PDFPreprocessor, estimate_token_count, extract_text_from_file
from app.services.weaviate_service import WeaviateService

# Limit concurrent background embedding jobs to prevent CPU/thread explosion
_embedding_semaphore = asyncio.Semaphore(2)
_EMBEDDING_BATCH_SIZE = 5
_EMBEDDING_BATCH_DELAY = 0.5  # seconds between batches


@dataclass
class ProcessingResult:
    success: bool
    document_id: int
    chunks_created: int
    embeddings_created: int
    error: str | None = None


class DocumentProcessingService:
    def __init__(self) -> None:
        self.openai_service = OpenAIService()
        self.weaviate_service = WeaviateService.get_instance()
        self.preprocessor = PDFPreprocessor()

    # ------------------------------------------------------------------
    # Main processing entry-point
    # ------------------------------------------------------------------
    async def process_document(self, document_id: int, tenant_id: int, file_path: str) -> ProcessingResult:
        """Extract text from file, chunk, store chunks in DB, kick off async embeddings."""
        try:
            # Mark as processing
            await self._update_document_status(document_id, "processing", "in_progress")

            # Extract text
            raw_text = await asyncio.to_thread(extract_text_from_file, file_path)
            if not raw_text or len(raw_text.strip()) < 10:
                raise ValueError("Document contains no readable text")

            # Chunk
            chunks = self.preprocessor.process_text(raw_text)
            if not chunks:
                raise ValueError("Failed to create text chunks from document")

            # Keywords are now extracted per-chunk during the embedding phase for better STT context.

            # Insert chunks into DB
            chunk_ids = await self._insert_chunks(document_id, tenant_id, chunks)

            # Update document stats
            await self._update_document_stats(document_id, len(chunks), 0)

            # Mark as processed
            await self._update_document_status(document_id, "processed", "completed")

            # Fire-and-forget: generate embeddings in background (rate-limited)
            asyncio.create_task(
                self._rate_limited_embeddings(chunk_ids, document_id, tenant_id)
            )

            return ProcessingResult(
                success=True,
                document_id=document_id,
                chunks_created=len(chunks),
                embeddings_created=0,  # Updated async
            )

        except Exception as e:
            error_msg = str(e)
            logger.error(
                "Document processing failed",
                document_id=document_id,
                error=error_msg,
            )
            await self._update_document_status(document_id, "failed", "failed", error_msg)
            return ProcessingResult(
                success=False,
                document_id=document_id,
                chunks_created=0,
                embeddings_created=0,
                error=error_msg,
            )

    async def _extract_chunk_keywords(self, tenant_id: int, content: str) -> str:
        """Extract 5-10 technical keywords from a single chunk for STT context."""
        try:
            prompt = (
                "Extract 5-10 technical keywords, proper nouns, or jargon from the text below. "
                "These will be used to prime a Speech-to-Text engine. "
                "Return ONLY a comma-separated list. No prose.\n\n"
                f"TEXT:\n{content[:2000]}"
            )
            
            from app.services.openai_service import ChatCompletionRequest
            response = await self.openai_service.generate_chat_completion(
                ChatCompletionRequest(
                    messages=[{"role": "user", "content": prompt}],
                    tenant_id=tenant_id,
                    model="gpt-4o-mini",
                    max_tokens=50,
                    temperature=0.0,
                )
            )
            return response.content.strip().strip(",")
        except Exception as e:
            logger.warning(f"Failed to extract keywords for chunk: {e}")
            return ""

    async def _update_tenant_whisper_vocab(self, tenant_id: int, new_keywords: list[str]) -> None:
        """Aggregate and upsert unique technical keywords into tenant's STT vocabulary."""
        try:
            async with async_session_factory() as session:
                # 1. Fetch current vocab
                res = await session.execute(
                    text("SELECT config_value FROM tenant_configurations WHERE tenant_id = :tid AND config_key = 'whisper_vocab'"),
                    {"tid": tenant_id}
                )
                row = res.mappings().first()
                current_vocab = str(row["config_value"]) if row and row["config_value"] else ""
                
                # 2. Merge and deduplicate
                vocab_set = set(k.strip().lower() for k in current_vocab.split(",") if k.strip())
                added_any = False
                for kw in new_keywords:
                    k_clean = kw.strip().lower()
                    if k_clean and k_clean not in vocab_set:
                        vocab_set.add(k_clean)
                        added_any = True
                
                if not added_any:
                    return

                # 3. Save back (Upsert)
                new_vocab_str = ", ".join(sorted(vocab_set))
                await session.execute(
                    text("""
                        INSERT INTO tenant_configurations (tenant_id, config_key, config_value)
                        VALUES (:tid, 'whisper_vocab', :v)
                        ON DUPLICATE KEY UPDATE config_value = :v, updated_at = NOW()
                    """),
                    {"tid": tenant_id, "v": new_vocab_str}
                )
                await session.commit()
                logger.info(f"Updated STT vocabulary for tenant {tenant_id} with {len(new_keywords)} new terms")
        except Exception as e:
            logger.error(f"Failed to update tenant STT vocabulary: {e}")

    async def refresh_tenant_stt_vocab(self, tenant_id: int) -> None:
        """
        Full rebuild of the tenant's transcription vocabulary by querying Weaviate.
        Ensures the list only contains terms from active documents.
        """
        try:
            # 1. Fetch all unique keywords from Weaviate
            keywords = await asyncio.to_thread(self.weaviate_service.get_all_tenant_keywords, tenant_id)
            
            if not keywords:
                # If no keywords remain, optionally clear or set to empty
                new_vocab_str = ""
            else:
                new_vocab_str = ", ".join(keywords)

            # 2. Update config
            async with async_session_factory() as session:
                await session.execute(
                    text("""
                        INSERT INTO tenant_configurations (tenant_id, config_key, config_value)
                        VALUES (:tid, 'whisper_vocab', :v)
                        ON DUPLICATE KEY UPDATE config_value = :v, updated_at = NOW()
                    """),
                    {"tid": tenant_id, "v": new_vocab_str}
                )
                await session.commit()
                logger.info(f"Refreshed STT vocabulary for tenant {tenant_id}. Total terms: {len(keywords)}")
        except Exception as e:
            logger.error(f"Failed to refresh tenant STT vocabulary: {e}")

    # ------------------------------------------------------------------
    # Reprocess
    # ------------------------------------------------------------------
    # ------------------------------------------------------------------
    # Deletion & Reprocess
    # ------------------------------------------------------------------
    async def delete_document(self, document_id: int, tenant_id: int) -> bool:
        """Centralized deletion: Weaviate, File System, and Database."""
        try:
            # 1. Fetch document info
            async with async_session_factory() as session:
                result = await session.execute(
                    text("SELECT file_path FROM documents WHERE id = :did AND tenant_id = :tid"),
                    {"did": document_id, "tid": tenant_id},
                )
                row = result.mappings().first()
                if not row:
                    logger.warning(f"Document {document_id} not found for deletion")
                    return False
                file_path = str(row["file_path"])

            # 2. Delete from Weaviate (vector store)
            try:
                await asyncio.to_thread(
                    self.weaviate_service.delete_document_chunks, document_id, tenant_id
                )
            except Exception as e:
                logger.error(f"Failed to delete Weaviate chunks for doc {document_id}: {e}")
                return False

            # 3. Delete from File System
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                logger.warning(f"Failed to delete file {file_path}: {e}")

            # 4. Delete from DB (cascades to chunks)
            from app.repositories.document_repo import DocumentRepository
            async with async_session_factory() as session:
                repo = DocumentRepository(session)
                result = await repo.delete_by_id(document_id)
                if not result:
                    logger.warning(f"Document {document_id} was not found in DB during final deletion step")
                await session.commit()

            logger.info(f"Document {document_id} deleted successfully from all areas")
            
            # Sync STT vocabulary (remove stale jargon)
            await self.refresh_tenant_stt_vocab(tenant_id)
            
            return True

        except Exception as e:
            logger.error(f"Error during document deletion {document_id}: {e}")
            return False

    async def sync_document_metadata(
        self, document_id: int, tenant_id: int, title: str | None = None, category_name: str | None = None
    ) -> None:
        """Sync metadata changes to Weaviate."""
        props = {}
        if title is not None:
            props["documentTitle"] = title
        if category_name is not None:
            props["categoryName"] = category_name

        if not props:
            return

        try:
            await asyncio.to_thread(
                self.weaviate_service.update_document_metadata, document_id, tenant_id, props
            )
        except Exception as e:
            logger.error(f"Failed to sync metadata to Weaviate for doc {document_id}: {e}")

    async def reprocess_document(self, document_id: int, tenant_id: int) -> ProcessingResult:
        """Delete existing chunks and reprocess."""
        async with async_session_factory() as session:
            result = await session.execute(
                text("SELECT file_path FROM documents WHERE id = :did AND tenant_id = :tid"),
                {"did": document_id, "tid": tenant_id},
            )
            row = result.mappings().first()
            if not row:
                return ProcessingResult(
                    success=False, document_id=document_id, chunks_created=0, embeddings_created=0, error="Document not found"
                )
            file_path = str(row["file_path"])

        # Delete existing chunks from DB and Weaviate
        await self._delete_document_chunks(document_id, tenant_id)

        return await self.process_document(document_id, tenant_id, file_path)

    # ------------------------------------------------------------------
    # Processing status
    # ------------------------------------------------------------------
    async def get_processing_status(self, document_id: int) -> dict:
        async with async_session_factory() as session:
            doc_result = await session.execute(
                text(
                    "SELECT processing_status, chunk_count, error_message "
                    "FROM documents WHERE id = :did"
                ),
                {"did": document_id},
            )
            doc_row = doc_result.mappings().first()
            if not doc_row:
                return {"error": "Document not found"}

            stats_result = await session.execute(
                text("""
                    SELECT
                        COUNT(*) as total,
                        SUM(CASE WHEN embedding_status = 'completed' THEN 1 ELSE 0 END) as completed,
                        SUM(CASE WHEN embedding_status = 'failed' THEN 1 ELSE 0 END) as failed
                    FROM document_chunks WHERE document_id = :did
                """),
                {"did": document_id},
            )
            stats = stats_result.mappings().first()

            total = int(stats["total"]) if stats else 0
            completed = int(stats["completed"]) if stats else 0
            progress = round((completed / total) * 100) if total > 0 else 0

            result = {
                "status": str(doc_row["processing_status"]),
                "progress": progress,
                "chunksTotal": int(doc_row["chunk_count"]),
                "chunksProcessed": int(doc_row["chunk_count"]),
                "embeddingsTotal": total,
                "embeddingsCompleted": completed,
            }
            if doc_row["error_message"]:
                result["error"] = str(doc_row["error_message"])
            return result

    # ------------------------------------------------------------------
    # Background embedding generation (rate-limited)
    # ------------------------------------------------------------------
    async def _rate_limited_embeddings(
        self, chunk_ids: list[int], document_id: int, tenant_id: int
    ) -> None:
        """Acquire semaphore before running embeddings to limit concurrency."""
        async with _embedding_semaphore:
            await self._generate_embeddings_async(chunk_ids, document_id, tenant_id)

    async def _generate_embeddings_async(
        self, chunk_ids: list[int], document_id: int, tenant_id: int
    ) -> None:
        """Generate embeddings for all chunks in batches and store in Weaviate."""
        try:
            document_all_keywords = []
            # Fetch document metadata for embedding chunks
            doc_title = ""
            doc_filename = ""
            category_name = ""
            
            async with async_session_factory() as session:
                doc_res = await session.execute(
                    text("""
                        SELECT d.title, d.original_filename, c.name as category_name
                        FROM documents d
                        LEFT JOIN document_categories c ON d.category_id = c.id
                        WHERE d.id = :did
                    """),
                    {"did": document_id}
                )
                doc_row = doc_res.mappings().first()
                if doc_row:
                    doc_title = doc_row["title"] or ""
                    doc_filename = doc_row["original_filename"] or ""
                    category_name = doc_row["category_name"] or ""

            # Process in batches to avoid thread/connection explosion
            for batch_start in range(0, len(chunk_ids), _EMBEDDING_BATCH_SIZE):
                batch = chunk_ids[batch_start:batch_start + _EMBEDDING_BATCH_SIZE]

                # Read all chunks in batch with a single session
                async with async_session_factory() as session:
                    for chunk_id in batch:
                        await session.execute(
                            text(
                                "UPDATE document_chunks SET embedding_status = 'processing', "
                                "updated_at = NOW() WHERE id = :cid"
                            ),
                            {"cid": chunk_id},
                        )
                    await session.commit()

                for chunk_id in batch:
                    try:
                        # Read chunk content
                        async with async_session_factory() as session:
                            result = await session.execute(
                                text(
                                    "SELECT id, content, chunk_index, token_count, metadata "
                                    "FROM document_chunks WHERE id = :cid"
                                ),
                                {"cid": chunk_id},
                            )
                            chunk_row = result.mappings().first()
                            if not chunk_row:
                                continue

                        content = str(chunk_row["content"])

                        # Generate embedding and keywords in parallel
                        emb_task = self.openai_service.generate_embedding(content, tenant_id)
                        kw_task = self._extract_chunk_keywords(tenant_id, content)
                        
                        emb_response, keywords = await asyncio.gather(emb_task, kw_task)

                        # Store in Weaviate (sync call via thread)
                        weaviate_id = await asyncio.to_thread(
                            self.weaviate_service.store_document_chunk,
                            chunk_id,
                            document_id,
                            tenant_id,
                            content,
                            emb_response.embedding,
                            int(chunk_row["chunk_index"]),
                            doc_title,       # document_title
                            doc_filename,    # document_filename
                            category_name,   # category_name
                            int(chunk_row["token_count"] or 0),
                            keywords,        # keywords
                            None,            # metadata
                        )

                        # Collect keywords for global vocab
                        if keywords:
                            kws = [k.strip() for k in keywords.split(",") if k.strip()]
                            document_all_keywords.extend(kws)

                        # Update chunk with weaviate_id
                        async with async_session_factory() as session:
                            await session.execute(
                                text(
                                    "UPDATE document_chunks SET weaviate_id = :wid, "
                                    "embedding_status = 'completed', updated_at = NOW() "
                                    "WHERE id = :cid"
                                ),
                                {"wid": weaviate_id, "cid": chunk_id},
                            )
                            await session.commit()

                        logger.info(
                            "Embedding generated",
                            chunk_id=chunk_id,
                            document_id=document_id,
                        )

                    except Exception as e:
                        logger.error(
                            "Failed to generate embedding for chunk",
                            chunk_id=chunk_id,
                            document_id=document_id,
                            error=str(e),
                        )
                        async with async_session_factory() as session:
                            await session.execute(
                                text(
                                    "UPDATE document_chunks SET embedding_status = 'failed', "
                                    "updated_at = NOW() WHERE id = :cid"
                                ),
                                {"cid": chunk_id},
                            )
                            await session.commit()

                # Delay between batches to prevent CPU spikes
                if batch_start + _EMBEDDING_BATCH_SIZE < len(chunk_ids):
                    await asyncio.sleep(_EMBEDDING_BATCH_DELAY)

            # Update document embedding count
            async with async_session_factory() as session:
                count_result = await session.execute(
                    text(
                        "SELECT COUNT(*) as cnt FROM document_chunks "
                        "WHERE document_id = :did AND embedding_status = 'completed'"
                    ),
                    {"did": document_id},
                )
                cnt_row = count_result.mappings().first()
                completed_count = int(cnt_row["cnt"]) if cnt_row else 0

                await session.execute(
                    text(
                        "UPDATE documents SET embedding_count = :cnt, updated_at = NOW() "
                        "WHERE id = :did"
                    ),
                    {"cnt": completed_count, "did": document_id},
                )
                await session.commit()

            # Final step: Update tenant-level STT vocabulary with all keywords from this document
            if document_all_keywords:
                await self._update_tenant_whisper_vocab(tenant_id, document_all_keywords)

        except Exception as e:
            logger.error("Embedding generation process failed", error=str(e))

    # ------------------------------------------------------------------
    # DB helpers
    # ------------------------------------------------------------------
    async def _insert_chunks(
        self, document_id: int, tenant_id: int, chunks: list[str]
    ) -> list[int]:
        """Insert text chunks into document_chunks table using ORM for robustness."""
        from app.repositories.document_repo import ChunkRepository
        
        chunk_data = []
        for i, chunk_text in enumerate(chunks):
            chunk_data.append({
                "document_id": document_id,
                "tenant_id": tenant_id,
                "chunk_index": i,
                "content": chunk_text,
                "content_hash": hashlib.md5(chunk_text.encode()).hexdigest(),
                "token_count": estimate_token_count(chunk_text),
                "embedding_status": 'pending',
                "chunk_metadata": {"chunk_type": "text"},
            })

        async with async_session_factory() as session:
            repo = ChunkRepository(session)
            created_objs = await repo.create_many(chunk_data)
            return [c.id for c in created_objs]
        
        return []

    async def _update_document_status(
        self,
        document_id: int,
        status: str,
        processing_status: str,
        error_message: str | None = None,
    ) -> None:
        async with async_session_factory() as session:
            if error_message:
                await session.execute(
                    text(
                        "UPDATE documents SET status = :s, processing_status = :ps, "
                        "error_message = :err, updated_at = NOW() WHERE id = :did"
                    ),
                    {"s": status, "ps": processing_status, "err": error_message, "did": document_id},
                )
            else:
                await session.execute(
                    text(
                        "UPDATE documents SET status = :s, processing_status = :ps, "
                        "updated_at = NOW() WHERE id = :did"
                    ),
                    {"s": status, "ps": processing_status, "did": document_id},
                )
            await session.commit()

    async def _update_document_stats(
        self, document_id: int, chunk_count: int, embedding_count: int
    ) -> None:
        async with async_session_factory() as session:
            await session.execute(
                text(
                    "UPDATE documents SET chunk_count = :cc, embedding_count = :ec, "
                    "updated_at = NOW() WHERE id = :did"
                ),
                {"cc": chunk_count, "ec": embedding_count, "did": document_id},
            )
            await session.commit()

    async def _delete_document_chunks(self, document_id: int, tenant_id: int) -> None:
        """Delete chunks from DB and Weaviate."""
        # Delete from Weaviate
        try:
            await asyncio.to_thread(
                self.weaviate_service.delete_document_chunks, document_id, tenant_id
            )
        except Exception as e:
            logger.error(f"Failed to delete chunks from Weaviate: {e}")
            raise e

        # Delete from DB
        async with async_session_factory() as session:
            await session.execute(
                text("DELETE FROM document_chunks WHERE document_id = :did"),
                {"did": document_id},
            )
            await session.commit()
