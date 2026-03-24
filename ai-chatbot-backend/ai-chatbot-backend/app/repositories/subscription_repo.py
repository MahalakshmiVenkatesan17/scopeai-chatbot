from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.billing import Subscription, SubscriptionPlan
from app.repositories.base import BaseRepository


class SubscriptionRepository(BaseRepository[Subscription]):
    def __init__(self, db: AsyncSession):
        super().__init__(Subscription, db)

    async def get_active_by_tenant(self, tenant_id: int) -> Optional[Subscription]:
        result = await self.db.execute(
            select(Subscription).where(
                Subscription.tenant_id == tenant_id,
                Subscription.subscription_status == "active",
            )
        )
        return result.scalar_one_or_none()

    async def get_by_subscription_id(self, subscription_id: str) -> Optional[Subscription]:
        result = await self.db.execute(
            select(Subscription).where(Subscription.subscription_id == subscription_id)
        )
        return result.scalar_one_or_none()

    async def get_by_tenant(self, tenant_id: int) -> list[Subscription]:
        result = await self.db.execute(
            select(Subscription)
            .where(Subscription.tenant_id == tenant_id)
            .order_by(Subscription.created_at.desc())
        )
        return list(result.scalars().all())


class SubscriptionPlanRepository(BaseRepository[SubscriptionPlan]):
    def __init__(self, db: AsyncSession):
        super().__init__(SubscriptionPlan, db)

    async def get_by_name(self, plan_name: str) -> Optional[SubscriptionPlan]:
        result = await self.db.execute(
            select(SubscriptionPlan).where(
                SubscriptionPlan.plan_name == plan_name,
                SubscriptionPlan.is_active == True,
            )
        )
        return result.scalar_one_or_none()

    async def get_all_active(self) -> list[SubscriptionPlan]:
        result = await self.db.execute(
            select(SubscriptionPlan)
            .where(SubscriptionPlan.is_active == True)
            .order_by(SubscriptionPlan.price)
        )
        return list(result.scalars().all())

    async def get_by_razorpay_id(self, razorpay_id: str) -> Optional[SubscriptionPlan]:
        result = await self.db.execute(
            select(SubscriptionPlan).where(SubscriptionPlan.razorpay_plan_id == razorpay_id)
        )
        return result.scalar_one_or_none()

    async def get_by_stripe_price_id(self, stripe_price_id: str) -> Optional[SubscriptionPlan]:
        result = await self.db.execute(
            select(SubscriptionPlan).where(SubscriptionPlan.stripe_price_id == stripe_price_id)
        )
        return result.scalar_one_or_none()

