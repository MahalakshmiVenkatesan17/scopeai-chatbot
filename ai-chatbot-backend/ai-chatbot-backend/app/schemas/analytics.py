from datetime import date, datetime
from decimal import Decimal
from typing import Any, Optional

from pydantic import BaseModel, Field


class DashboardStatsResponse(BaseModel):
    total_users: int = Field(alias="totalUsers")
    active_users: int = Field(alias="activeUsers")
    total_sessions: int = Field(alias="totalSessions")
    total_messages: int = Field(alias="totalMessages")
    total_documents: int = Field(alias="totalDocuments")
    total_cost: Decimal = Field(alias="totalCost")

    model_config = {"populate_by_name": True, "by_alias": True}


class UsageStatsResponse(BaseModel):
    total_api_calls: int = Field(alias="totalApiCalls")
    avg_response_time_ms: float = Field(alias="avgResponseTimeMs")
    error_rate: float = Field(alias="errorRate")
    daily_stats: list[dict[str, Any]] = Field(alias="dailyStats")

    model_config = {"populate_by_name": True, "by_alias": True}


class CostStatsResponse(BaseModel):
    total_cost: Decimal = Field(alias="totalCost")
    total_tokens: int = Field(alias="totalTokens")
    avg_cost_per_request: Decimal = Field(alias="avgCostPerRequest")
    daily_costs: list[dict[str, Any]] = Field(alias="dailyCosts")

    model_config = {"populate_by_name": True, "by_alias": True}


class ChatAnalyticsResponse(BaseModel):
    total_sessions: int = Field(alias="totalSessions")
    active_sessions: int = Field(alias="activeSessions")
    total_messages: int = Field(alias="totalMessages")
    avg_messages_per_session: float = Field(alias="avgMessagesPerSession")
    avg_response_time_ms: float = Field(alias="avgResponseTimeMs")

    model_config = {"populate_by_name": True, "by_alias": True}


class DocumentAnalyticsResponse(BaseModel):
    total_documents: int = Field(alias="totalDocuments")
    processed_documents: int = Field(alias="processedDocuments")
    failed_documents: int = Field(alias="failedDocuments")
    total_chunks: int = Field(alias="totalChunks")
    storage_used_mb: float = Field(alias="storageUsedMb")

    model_config = {"populate_by_name": True, "by_alias": True}


class TopUserResponse(BaseModel):
    user_id: int = Field(alias="userId")
    email: str
    first_name: Optional[str] = Field(default=None, alias="firstName")
    last_name: Optional[str] = Field(default=None, alias="lastName")
    message_count: int = Field(alias="messageCount")
    session_count: int = Field(alias="sessionCount")

    model_config = {"populate_by_name": True, "by_alias": True}


class PopularDocumentResponse(BaseModel):
    document_id: int = Field(alias="documentId")
    title: Optional[str] = None
    original_filename: str = Field(alias="originalFilename")
    reference_count: int = Field(alias="referenceCount")

    model_config = {"populate_by_name": True, "by_alias": True}


class AnalyticsExportRequest(BaseModel):
    start_date: date = Field(alias="startDate")
    end_date: date = Field(alias="endDate")
    metrics: list[str] = Field(default_factory=lambda: ["all"])
    format: str = Field(default="json")

    model_config = {"populate_by_name": True}
