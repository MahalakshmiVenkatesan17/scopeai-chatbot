from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import DocumentCategory
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[DocumentCategory]):
    def __init__(self, db: AsyncSession):
        super().__init__(DocumentCategory, db)

    async def get_by_tenant(
        self, tenant_id: int, status: Optional[str] = "active"
    ) -> list[DocumentCategory]:
        filters = [DocumentCategory.tenant_id == tenant_id]
        if status:
            filters.append(DocumentCategory.status == status)
        return await self.get_all(
            filters=filters,
            order_by=DocumentCategory.sort_order.asc(),
            limit=100,
        )

    async def get_by_name(self, tenant_id: int, name: str) -> Optional[DocumentCategory]:
        result = await self.db.execute(
            select(DocumentCategory).where(
                DocumentCategory.tenant_id == tenant_id,
                DocumentCategory.name == name,
            )
        )
        return result.scalar_one_or_none()
