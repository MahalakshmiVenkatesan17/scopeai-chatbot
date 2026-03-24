from typing import Any, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document
from app.models.chat import ChatSession
from app.models.tenant import Tenant, TenantConfiguration
from app.models.user import User
from app.repositories.base import BaseRepository


class TenantRepository(BaseRepository[Tenant]):
    def __init__(self, db: AsyncSession):
        super().__init__(Tenant, db)

    async def get_by_slug(self, slug: str) -> Optional[Tenant]:
        result = await self.db.execute(select(Tenant).where(Tenant.slug == slug))
        return result.scalar_one_or_none()

    async def get_by_domain(self, domain: str) -> Optional[Tenant]:
        result = await self.db.execute(select(Tenant).where(Tenant.domain == domain))
        return result.scalar_one_or_none()

    async def get_active_tenants(self, skip: int = 0, limit: int = 20) -> list[Tenant]:
        return await self.get_all(
            skip=skip, limit=limit, filters=[Tenant.status == "active"]
        )

    async def get_current_usage(self, tenant_id: int) -> dict[str, Any]:
        """Get current usage counts for a tenant."""
        user_count = await self.db.execute(
            select(func.count()).select_from(User).where(
                User.tenant_id == tenant_id, User.status == "active"
            )
        )
        session_count = await self.db.execute(
            select(func.count()).select_from(ChatSession).where(
                ChatSession.tenant_id == tenant_id, ChatSession.status == "active"
            )
        )
        doc_result = await self.db.execute(
            select(
                func.count().label("count"),
                func.coalesce(func.sum(Document.file_size), 0).label("total_size"),
            )
            .select_from(Document)
            .where(Document.tenant_id == tenant_id)
        )
        doc_row = doc_result.one()

        return {
            "users": user_count.scalar() or 0,
            "chatSessions": session_count.scalar() or 0,
            "documents": doc_row.count or 0,
            "storageUsedMb": round((doc_row.total_size or 0) / (1024 * 1024), 2),
        }


class TenantConfigRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_configs(self, tenant_id: int) -> list[TenantConfiguration]:
        result = await self.db.execute(
            select(TenantConfiguration).where(TenantConfiguration.tenant_id == tenant_id)
        )
        return list(result.scalars().all())

    async def get_config(self, tenant_id: int, key: str) -> Optional[TenantConfiguration]:
        result = await self.db.execute(
            select(TenantConfiguration).where(
                TenantConfiguration.tenant_id == tenant_id,
                TenantConfiguration.config_key == key,
            )
        )
        return result.scalar_one_or_none()

    async def set_config(
        self, tenant_id: int, key: str, value: str, config_type: str = "string", updated_by: Optional[int] = None
    ) -> TenantConfiguration:
        existing = await self.get_config(tenant_id, key)
        if existing:
            existing.config_value = value
            existing.config_type = config_type
            existing.updated_by = updated_by
            await self.db.commit()
            await self.db.refresh(existing)
            return existing
        else:
            config = TenantConfiguration(
                tenant_id=tenant_id,
                config_key=key,
                config_value=value,
                config_type=config_type,
                updated_by=updated_by,
            )
            self.db.add(config)
            await self.db.commit()
            await self.db.refresh(config)
            return config

    async def delete_config(self, tenant_id: int, key: str) -> bool:
        config = await self.get_config(tenant_id, key)
        if config:
            await self.db.delete(config)
            await self.db.commit()
            return True
        return False

    async def get_configs_as_dict(self, tenant_id: int) -> dict[str, Any]:
        configs = await self.get_all_configs(tenant_id)
        return {c.config_key: c.config_value for c in configs}
