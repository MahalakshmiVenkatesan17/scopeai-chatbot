from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class DocumentResponse(BaseModel):
    id: int
    tenant_id: int = Field(alias="tenantId")
    category_id: Optional[int] = Field(default=None, alias="categoryId")
    uploaded_by: int = Field(alias="uploadedBy")
    original_filename: str = Field(alias="originalFilename")
    file_size: int = Field(alias="fileSize")
    mime_type: Optional[str] = Field(default=None, alias="mimeType")
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None
    status: str
    processing_status: str = Field(alias="processingStatus")
    chunk_count: int = Field(alias="chunkCount")
    embedding_count: int = Field(alias="embeddingCount")
    version: int
    is_public: bool = Field(alias="isPublic")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = {"populate_by_name": True, "by_alias": True, "from_attributes": True}


class DocumentUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None
    category_id: Optional[int] = Field(default=None, alias="categoryId")
    is_public: Optional[bool] = Field(default=None, alias="isPublic")

    model_config = {"populate_by_name": True}


class CategoryResponse(BaseModel):
    id: int
    tenant_id: int = Field(alias="tenantId")
    name: str
    description: Optional[str] = None
    parent_id: Optional[int] = Field(default=None, alias="parentId")
    sort_order: int = Field(alias="sortOrder")
    status: str
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = {"populate_by_name": True, "by_alias": True, "from_attributes": True}


class CategoryCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    description: Optional[str] = None
    parent_id: Optional[int] = Field(default=None, alias="parentId")
    sort_order: int = Field(default=0, alias="sortOrder")
    tenant_slug: Optional[str] = Field(default=None, alias="tenantSlug")

    model_config = {"populate_by_name": True}

class CategoryUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[int] = Field(default=None, alias="parentId")
    sort_order: Optional[int] = Field(default=None, alias="sortOrder")
    status: Optional[str] = None
    tenant_slug: Optional[str] = Field(None, alias="tenantSlug")

    model_config = {"populate_by_name": True}


class SearchRequest(BaseModel):
    query: str = Field(min_length=1)
    category_ids: Optional[list[int]] = Field(default=None, alias="categoryIds")
    document_ids: Optional[list[int]] = Field(default=None, alias="documentIds")
    limit: int = Field(default=10, ge=1, le=50)
    threshold: float = Field(default=0.5, ge=0.0, le=1.0)

    model_config = {"populate_by_name": True}


class SearchResult(BaseModel):
    chunk_id: int = Field(alias="chunkId")
    document_id: int = Field(alias="documentId")
    document_title: Optional[str] = Field(default=None, alias="documentTitle")
    content: str
    score: float
    metadata: Optional[dict[str, Any]] = None

    model_config = {"populate_by_name": True, "by_alias": True}


class ChunkResponse(BaseModel):
    id: int
    document_id: int = Field(alias="documentId")
    chunk_index: int = Field(alias="chunkIndex")
    content: str
    token_count: Optional[int] = Field(default=None, alias="tokenCount")
    embedding_status: str = Field(alias="embeddingStatus")
    metadata: Optional[dict[str, Any]] = None
    created_at: datetime = Field(alias="createdAt")

    model_config = {"populate_by_name": True, "by_alias": True, "from_attributes": True}
