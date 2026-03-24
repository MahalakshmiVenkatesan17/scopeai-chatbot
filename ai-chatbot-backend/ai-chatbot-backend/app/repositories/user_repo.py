from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserSession
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get_by_email(self, email: str, tenant_id: Optional[int] = None) -> Optional[User]:
        query = select(User).where(User.email == email)
        if tenant_id is not None:
            query = query.where(User.tenant_id == tenant_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_tenant(
        self, tenant_id: int, skip: int = 0, limit: int = 20
    ) -> list[User]:
        return await self.get_all(
            skip=skip,
            limit=limit,
            filters=[User.tenant_id == tenant_id],
        )

    async def count_by_tenant(self, tenant_id: int) -> int:
        return await self.count(filters=[User.tenant_id == tenant_id])

    async def update_last_login(self, user_id: int) -> None:
        await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(last_login=datetime.now(timezone.utc), login_attempts=0)
        )
        await self.db.commit()

    async def increment_login_attempts(self, user_id: int) -> None:
        await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(login_attempts=User.login_attempts + 1)
        )
        await self.db.commit()

    async def get_by_reset_token(self, token: str) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(
                User.password_reset_token == token,
                User.password_reset_expires > datetime.utcnow(),
            )
        )
        return result.scalar_one_or_none()

    async def get_by_verification_token(self, token: str) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.email_verification_token == token)
        )
        return result.scalar_one_or_none()


class UserSessionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, session_data: dict) -> UserSession:
        session = UserSession(**session_data)
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        return session

    async def get_by_user(self, user_id: int) -> list[UserSession]:
        result = await self.db.execute(
            select(UserSession)
            .where(UserSession.user_id == user_id)
            .order_by(UserSession.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, session_id: str) -> Optional[UserSession]:
        result = await self.db.execute(
            select(UserSession).where(UserSession.id == session_id)
        )
        return result.scalar_one_or_none()

    async def delete_by_id(self, session_id: str) -> bool:
        result = await self.db.execute(
            delete(UserSession).where(UserSession.id == session_id)
        )
        await self.db.commit()
        return result.rowcount > 0

    async def delete_all_by_user(self, user_id: int) -> int:
        result = await self.db.execute(
            delete(UserSession).where(UserSession.user_id == user_id)
        )
        await self.db.commit()
        return result.rowcount

    async def delete_expired(self) -> int:
        result = await self.db.execute(
            delete(UserSession).where(
                UserSession.expires_at < datetime.utcnow()
            )
        )
        await self.db.commit()
        return result.rowcount
