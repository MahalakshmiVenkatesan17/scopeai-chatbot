from datetime import datetime
from decimal import Decimal
from typing import Any, Optional

from pydantic import BaseModel, Field


class SessionCreateRequest(BaseModel):
    session_name: Optional[str] = Field(default=None, alias="sessionName")
    context_documents: Optional[list[int]] = Field(default=None, alias="contextDocuments")

    model_config = {"populate_by_name": True}


class SessionUpdateRequest(BaseModel):
    session_name: Optional[str] = Field(default=None, alias="sessionName")
    status: Optional[str] = None

    model_config = {"populate_by_name": True}


class SessionResponse(BaseModel):
    id: str
    tenant_id: int = Field(alias="tenantId")
    user_id: Optional[int] = Field(default=None, alias="userId")
    session_name: Optional[str] = Field(default=None, alias="sessionName")
    status: str
    context_documents: Optional[Any] = Field(default=None, alias="contextDocuments")
    started_at: datetime = Field(alias="startedAt")
    last_activity: datetime = Field(alias="lastActivity")

    model_config = {"populate_by_name": True, "by_alias": True, "from_attributes": True}


class MessageRequest(BaseModel):
    content: str = Field(min_length=1)
    use_documents: bool = Field(default=True, alias="useDocuments")
    model: Optional[str] = None

    model_config = {"populate_by_name": True}


class MessageResponse(BaseModel):
    id: int
    session_id: str = Field(alias="sessionId")
    message_type: str = Field(alias="messageType")
    content: str
    token_count: Optional[int] = Field(default=None, alias="tokenCount")
    model_used: Optional[str] = Field(default=None, alias="modelUsed")
    context_chunks: Optional[Any] = Field(default=None, alias="contextChunks")
    processing_time_ms: Optional[int] = Field(default=None, alias="processingTimeMs")
    cost_estimate: Optional[Decimal] = Field(default=None, alias="costEstimate")
    created_at: datetime = Field(alias="createdAt")

    model_config = {"populate_by_name": True, "by_alias": True, "from_attributes": True}


class PublicChatInitRequest(BaseModel):
    visitor_name: Optional[str] = Field(default=None, alias="visitorName")
    visitor_email: Optional[str] = Field(default=None, alias="visitorEmail")
    metadata: Optional[dict] = None

    model_config = {"populate_by_name": True}


class PublicChatMessageRequest(BaseModel):
    content: str = Field(min_length=1)

    model_config = {"populate_by_name": True}


class ChatExportResponse(BaseModel):
    session_id: str = Field(alias="sessionId")
    session_name: Optional[str] = Field(default=None, alias="sessionName")
    messages: list[MessageResponse]
    exported_at: datetime = Field(alias="exportedAt")

    model_config = {"populate_by_name": True, "by_alias": True}
