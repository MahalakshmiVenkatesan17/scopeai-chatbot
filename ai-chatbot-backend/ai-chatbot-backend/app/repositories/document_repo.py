from typing import Optional

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document, DocumentChunk, DocumentVersion
from app.repositories.base import BaseRepository


class DocumentRepository(BaseRepository[Document]):
    def __init__(self, db: AsyncSession):
        super().__init__(Document, db)

    async def get_by_tenant(
        self,
        tenant_id: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
        category_id: Optional[int] = None,
    ) -> list[Document]:
        filters = [Document.tenant_id == tenant_id]
        if status:
            filters.append(Document.status == status)
        if category_id:
            filters.append(Document.category_id == category_id)
        return await self.get_all(
            skip=skip,
            limit=limit,
            filters=filters,
            order_by=Document.created_at.desc(),
        )

    async def count_by_tenant(
        self, tenant_id: int, status: Optional[str] = None
    ) -> int:
        filters = [Document.tenant_id == tenant_id]
        if status:
            filters.append(Document.status == status)
        return await self.count(filters=filters)

    async def get_by_hash(self, file_hash: str, tenant_id: int) -> Optional[Document]:
        result = await self.db.execute(
            select(Document).where(
                Document.file_hash == file_hash,
                Document.tenant_id == tenant_id,
            )
        )
        return result.scalar_one_or_none()

    async def update_processing_status(
        self, doc_id: int, status: str, processing_status: str, error_message: Optional[str] = None,
        chunk_count: Optional[int] = None, embedding_count: Optional[int] = None,
    ) -> None:
        values: dict = {"status": status, "processing_status": processing_status}
        if error_message is not None:
            values["error_message"] = error_message
        if chunk_count is not None:
            values["chunk_count"] = chunk_count
        if embedding_count is not None:
            values["embedding_count"] = embedding_count
        await self.db.execute(
            update(Document).where(Document.id == doc_id).values(**values)
        )
        await self.db.commit()

    async def get_pending_documents(self, limit: int = 10) -> list[Document]:
        result = await self.db.execute(
            select(Document)
            .where(Document.processing_status == "pending")
            .order_by(Document.created_at.asc())
            .limit(limit)
        )
        return list(result.scalars().all())


class ChunkRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, chunk_data: dict) -> DocumentChunk:
        chunk = DocumentChunk(**chunk_data)
        self.db.add(chunk)
        await self.db.commit()
        await self.db.refresh(chunk)
        return chunk

    async def create_many(self, chunks: list[dict]) -> list[DocumentChunk]:
        objs = [DocumentChunk(**c) for c in chunks]
        self.db.add_all(objs)
        await self.db.commit()
        return objs

    async def get_by_document(self, document_id: int) -> list[DocumentChunk]:
        result = await self.db.execute(
            select(DocumentChunk)
            .where(DocumentChunk.document_id == document_id)
            .order_by(DocumentChunk.chunk_index)
        )
        return list(result.scalars().all())

    async def get_by_ids(self, chunk_ids: list[int]) -> list[DocumentChunk]:
        result = await self.db.execute(
            select(DocumentChunk).where(DocumentChunk.id.in_(chunk_ids))
        )
        return list(result.scalars().all())

    async def update_embedding_status(
        self, chunk_id: int, status: str, weaviate_id: Optional[str] = None
    ) -> None:
        values: dict = {"embedding_status": status}
        if weaviate_id:
            values["weaviate_id"] = weaviate_id
        await self.db.execute(
            update(DocumentChunk).where(DocumentChunk.id == chunk_id).values(**values)
        )
        await self.db.commit()

    async def delete_by_document(self, document_id: int) -> int:
        from sqlalchemy import delete
        result = await self.db.execute(
            delete(DocumentChunk).where(DocumentChunk.document_id == document_id)
        )
        await self.db.commit()
        return result.rowcount

    async def count_by_tenant(self, tenant_id: int) -> int:
        result = await self.db.execute(
            select(func.count())
            .select_from(DocumentChunk)
            .where(DocumentChunk.tenant_id == tenant_id)
        )
        return result.scalar() or 0


class DocumentVersionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, version_data: dict) -> DocumentVersion:
        version = DocumentVersion(**version_data)
        self.db.add(version)
        await self.db.commit()
        await self.db.refresh(version)
        return version

    async def get_by_document(self, document_id: int) -> list[DocumentVersion]:
        result = await self.db.execute(
            select(DocumentVersion)
            .where(DocumentVersion.document_id == document_id)
            .order_by(DocumentVersion.version_number.desc())
        )
        return list(result.scalars().all())
