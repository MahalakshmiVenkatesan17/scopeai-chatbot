from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.billing import Invoice
from app.repositories.base import BaseRepository


class InvoiceRepository(BaseRepository[Invoice]):
    def __init__(self, db: AsyncSession):
        super().__init__(Invoice, db)

    async def get_by_tenant(self, tenant_id: int, skip: int = 0, limit: int = 20) -> list[Invoice]:
        return await self.get_all(
            skip=skip,
            limit=limit,
            filters=[Invoice.tenant_id == tenant_id],
            order_by=Invoice.created_at.desc(),
        )

    async def get_by_subscription(self, subscription_id: int) -> list[Invoice]:
        result = await self.db.execute(
            select(Invoice)
            .where(Invoice.subscription_id == subscription_id)
            .order_by(Invoice.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_invoice_number(self, invoice_number: str) -> Optional[Invoice]:
        result = await self.db.execute(
            select(Invoice).where(Invoice.invoice_number == invoice_number)
        )
        return result.scalar_one_or_none()

    async def get_by_user_and_subscription(
        self, tenant_id: int, subscription_id: int
    ) -> list[Invoice]:
        result = await self.db.execute(
            select(Invoice)
            .where(
                Invoice.tenant_id == tenant_id,
                Invoice.subscription_id == subscription_id,
            )
            .order_by(Invoice.created_at.desc())
        )
        return list(result.scalars().all())
