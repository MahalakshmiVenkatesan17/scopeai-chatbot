from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Standard API response matching Node.js format."""
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None


class ApiErrorDetail(BaseModel):
    code: str
    message: str
    details: dict[str, Any] = Field(default_factory=dict)


class ApiErrorResponse(BaseModel):
    success: bool = False
    error: ApiErrorDetail


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    totalPages: int


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response matching Node.js format."""
    success: bool = True
    data: list[T] = Field(default_factory=list)
    pagination: PaginationMeta
