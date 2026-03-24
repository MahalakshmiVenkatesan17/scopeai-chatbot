from typing import Optional

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat import ChatMessage


class MessageRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, message_data: dict) -> ChatMessage:
        message = ChatMessage(**message_data)
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        return message

    async def get_by_session(
        self,
        session_id: str,
        skip: int = 0,
        limit: int = 50,
    ) -> list[ChatMessage]:
        result = await self.db.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.asc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def count_by_session(self, session_id: str) -> int:
        result = await self.db.execute(
            select(func.count())
            .select_from(ChatMessage)
            .where(ChatMessage.session_id == session_id)
        )
        return result.scalar() or 0

    async def get_by_id(self, message_id: int) -> Optional[ChatMessage]:
        result = await self.db.execute(
            select(ChatMessage).where(ChatMessage.id == message_id)
        )
        return result.scalar_one_or_none()

    async def delete_by_id(self, message_id: int) -> bool:
        result = await self.db.execute(
            delete(ChatMessage).where(ChatMessage.id == message_id)
        )
        await self.db.commit()
        return result.rowcount > 0

    async def get_recent_history(self, session_id: str, limit: int = 10) -> list[ChatMessage]:
        """Get last N messages for context building."""
        result = await self.db.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.desc())
            .limit(limit)
        )
        messages = list(result.scalars().all())
        messages.reverse()  # Return in chronological order
        return messages

    async def get_last_assistant_message(self, session_id: str) -> Optional[ChatMessage]:
        result = await self.db.execute(
            select(ChatMessage)
            .where(
                ChatMessage.session_id == session_id,
                ChatMessage.message_type == "assistant",
            )
            .order_by(ChatMessage.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def count_by_tenant(self, tenant_id: int) -> int:
        result = await self.db.execute(
            select(func.count())
            .select_from(ChatMessage)
            .where(ChatMessage.tenant_id == tenant_id)
        )
        return result.scalar() or 0
