from typing import Optional

from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat import ChatSession
from app.repositories.base import BaseRepository


class ChatSessionRepository(BaseRepository[ChatSession]):
    def __init__(self, db: AsyncSession):
        super().__init__(ChatSession, db)

    async def get_by_tenant(
        self,
        tenant_id: int,
        user_id: Optional[int] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> list[ChatSession]:
        filters = [ChatSession.tenant_id == tenant_id]
        if user_id is not None:
            filters.append(ChatSession.user_id == user_id)
        if status:
            filters.append(ChatSession.status == status)
        return await self.get_all(
            skip=skip,
            limit=limit,
            filters=filters,
            order_by=ChatSession.last_activity.desc(),
        )

    async def count_by_tenant(
        self, tenant_id: int, user_id: Optional[int] = None, status: Optional[str] = None
    ) -> int:
        filters = [ChatSession.tenant_id == tenant_id]
        if user_id is not None:
            filters.append(ChatSession.user_id == user_id)
        if status:
            filters.append(ChatSession.status == status)
        return await self.count(filters=filters)

    async def update_last_activity(self, session_id: str) -> None:
        from datetime import datetime, timezone
        await self.db.execute(
            update(ChatSession)
            .where(ChatSession.id == session_id)
            .values(last_activity=datetime.now(timezone.utc))
        )
        await self.db.commit()

    async def end_session(self, session_id: str) -> None:
        from datetime import datetime, timezone
        await self.db.execute(
            update(ChatSession)
            .where(ChatSession.id == session_id)
            .values(
                status="ended",
                ended_at=datetime.now(timezone.utc),
            )
        )
        await self.db.commit()

    async def get_by_user(self, user_id: int, tenant_id: int) -> list[ChatSession]:
        return await self.get_by_tenant(tenant_id=tenant_id, user_id=user_id)
