from typing import Any, Generic, Optional, Type, TypeVar

from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Generic CRUD repository — mirrors Node.js BaseRepository pattern."""

    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db

    async def get_by_id(self, id: Any) -> Optional[ModelType]:
        result = await self.db.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 20,
        filters: Optional[list] = None,
        order_by: Optional[Any] = None,
    ) -> list[ModelType]:
        query = select(self.model)
        if filters:
            for f in filters:
                query = query.where(f)
        if order_by is not None:
            query = query.order_by(order_by)
        else:
            query = query.order_by(self.model.id.desc())
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count(self, filters: Optional[list] = None) -> int:
        query = select(func.count()).select_from(self.model)
        if filters:
            for f in filters:
                query = query.where(f)
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def create(self, obj_data: dict[str, Any]) -> ModelType:
        obj = self.model(**obj_data)
        self.db.add(obj)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def update_by_id(self, id: Any, obj_data: dict[str, Any]) -> Optional[ModelType]:
        # Filter out None values
        update_data = {k: v for k, v in obj_data.items() if v is not None}
        if not update_data:
            return await self.get_by_id(id)

        await self.db.execute(
            update(self.model).where(self.model.id == id).values(**update_data)
        )
        await self.db.commit()
        return await self.get_by_id(id)

    async def delete_by_id(self, id: Any) -> bool:
        result = await self.db.execute(
            delete(self.model).where(self.model.id == id)
        )
        await self.db.commit()
        return result.rowcount > 0

    async def exists(self, filters: list) -> bool:
        query = select(func.count()).select_from(self.model)
        for f in filters:
            query = query.where(f)
        result = await self.db.execute(query)
        return (result.scalar() or 0) > 0
