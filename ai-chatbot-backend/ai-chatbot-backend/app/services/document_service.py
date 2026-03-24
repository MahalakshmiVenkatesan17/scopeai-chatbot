"""
Document processing service – extraction, chunking, embedding, storage.

Mirrors Node.js DocumentProcessingService.ts.
"""

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

            # Insert chunks into DB
            chunk_ids = await self._insert_chunks(document_id, tenant_id, chunks)

            # Update document stats
            await self._update_document_stats(document_id, len(chunks), 0)

            # Mark as processed
            await self._update_document_status(document_id, "processed", "completed")

            # Fire-and-forget: generate embeddings in background
            asyncio.create_task(
                self._generate_embeddings_async(chunk_ids, document_id, tenant_id)
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

    # ------------------------------------------------------------------
    # Reprocess
    # ------------------------------------------------------------------
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
    # Background embedding generation
    # ------------------------------------------------------------------
    async def _generate_embeddings_async(
        self, chunk_ids: list[int], document_id: int, tenant_id: int
    ) -> None:
        """Generate embeddings for all chunks and store in Weaviate."""
        try:
            for chunk_id in chunk_ids:
                try:
                    # Read chunk content from DB
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

                        # Mark as processing
                        await session.execute(
                            text(
                                "UPDATE document_chunks SET embedding_status = 'processing', "
                                "updated_at = NOW() WHERE id = :cid"
                            ),
                            {"cid": chunk_id},
                        )
                        await session.commit()

                    content = str(chunk_row["content"])

                    # Generate embedding
                    emb_response = await self.openai_service.generate_embedding(content, tenant_id)

                    # Store in Weaviate (sync call via thread)
                    weaviate_id = await asyncio.to_thread(
                        self.weaviate_service.store_document_chunk,
                        chunk_id,
                        document_id,
                        tenant_id,
                        content,
                        emb_response.embedding,
                        int(chunk_row["chunk_index"]),
                        "",  # document_title
                        "",  # document_filename
                        "",  # category_name
                        int(chunk_row["token_count"] or 0),
                        None,
                    )

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

        except Exception as e:
            logger.error("Embedding generation process failed", error=str(e))

    # ------------------------------------------------------------------
    # DB helpers
    # ------------------------------------------------------------------
    async def _insert_chunks(
        self, document_id: int, tenant_id: int, chunks: list[str]
    ) -> list[int]:
        """Insert text chunks into document_chunks table, return list of IDs."""
        chunk_ids: list[int] = []

        async with async_session_factory() as session:
            for i, chunk_text in enumerate(chunks):
                content_hash = hashlib.md5(chunk_text.encode()).hexdigest()
                token_count = estimate_token_count(chunk_text)

                result = await session.execute(
                    text("""
                        INSERT INTO document_chunks
                            (document_id, tenant_id, chunk_index, content, content_hash,
                             token_count, embedding_status, metadata, created_at, updated_at)
                        VALUES
                            (:doc_id, :tid, :idx, :content, :hash,
                             :tokens, 'pending', :meta, NOW(), NOW())
                    """),
                    {
                        "doc_id": document_id,
                        "tid": tenant_id,
                        "idx": i,
                        "content": chunk_text,
                        "hash": content_hash,
                        "tokens": token_count,
                        "meta": '{"chunk_type": "text"}',
                    },
                )
                chunk_ids.append(result.lastrowid)  # type: ignore[arg-type]

            await session.commit()

        return chunk_ids

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
            logger.warning("Failed to delete chunks from Weaviate", error=str(e))

        # Delete from DB
        async with async_session_factory() as session:
            await session.execute(
                text("DELETE FROM document_chunks WHERE document_id = :did"),
                {"did": document_id},
            )
            await session.commit()
