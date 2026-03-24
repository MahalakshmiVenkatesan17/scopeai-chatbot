from datetime import date, datetime, timezone
from typing import Any, Optional

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analytics import ApiUsageLog, TenantAnalytics
from app.models.chat import ChatMessage, ChatSession
from app.models.document import Document, DocumentChunk
from app.models.user import User


class AnalyticsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_dashboard_stats(self, tenant_id: int) -> dict[str, Any]:
        users = await self.db.execute(
            select(func.count()).select_from(User).where(User.tenant_id == tenant_id)
        )
        sessions = await self.db.execute(
            select(func.count()).select_from(ChatSession).where(ChatSession.tenant_id == tenant_id)
        )
        messages = await self.db.execute(
            select(func.count()).select_from(ChatMessage).where(ChatMessage.tenant_id == tenant_id)
        )
        token_cost = await self.db.execute(
            select(
                func.coalesce(func.sum(ChatMessage.token_count), 0).label("total_tokens"),
                func.coalesce(func.sum(ChatMessage.cost_estimate), 0).label("total_cost"),
            )
            .select_from(ChatMessage)
            .where(ChatMessage.tenant_id == tenant_id)
        )
        avg_response = await self.db.execute(
            select(func.coalesce(func.avg(ChatMessage.processing_time_ms), 0))
            .select_from(ChatMessage)
            .where(
                ChatMessage.tenant_id == tenant_id,
                ChatMessage.message_type == "assistant",
            )
        )

        tc_row = token_cost.one()
        return {
            "totalUsers": users.scalar() or 0,
            "totalSessions": sessions.scalar() or 0,
            "totalMessages": messages.scalar() or 0,
            "totalTokens": tc_row.total_tokens or 0,
            "totalCost": float(tc_row.total_cost or 0),
            "averageResponseTime": round(float(avg_response.scalar() or 0), 2),
            "period": "30d",
        }

    async def get_usage_stats(
        self, tenant_id: int, days: int = 30
    ) -> dict[str, Any]:
        interval = text(f"NOW() - INTERVAL {days} DAY")

        sessions = await self.db.execute(
            select(func.count()).select_from(ChatSession).where(
                ChatSession.tenant_id == tenant_id,
                ChatSession.started_at >= interval,
            )
        )
        messages = await self.db.execute(
            select(func.count()).select_from(ChatMessage).where(
                ChatMessage.tenant_id == tenant_id,
                ChatMessage.created_at >= interval,
            )
        )
        token_cost = await self.db.execute(
            select(
                func.coalesce(func.sum(ChatMessage.token_count), 0).label("total_tokens"),
                func.coalesce(func.sum(ChatMessage.cost_estimate), 0).label("total_cost"),
            )
            .select_from(ChatMessage)
            .where(
                ChatMessage.tenant_id == tenant_id,
                ChatMessage.created_at >= interval,
            )
        )

        total_sessions = sessions.scalar() or 0
        total_msgs = messages.scalar() or 0
        tc_row = token_cost.one()
        total_tokens = tc_row.total_tokens or 0
        total_cost = float(tc_row.total_cost or 0)

        return {
            "baseMetrics": {
                "totalSessions": total_sessions,
                "totalMessages": total_msgs,
                "totalTokens": total_tokens if total_tokens else None,
                "totalCost": total_cost if total_cost else None,
                "avgTokensPerMessage": round(total_tokens / max(total_msgs, 1), 2) if total_tokens else None,
            },
            "breakdown": None,
            "breakdownType": "total",
            "period": f"{days}d",
            "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        }

    async def get_cost_stats(self, tenant_id: int, days: int = 30) -> dict[str, Any]:
        result = await self.db.execute(
            select(
                func.coalesce(func.sum(ChatMessage.cost_estimate), 0).label("total_cost"),
                func.count().label("total_messages"),
            )
            .select_from(ChatMessage)
            .where(
                ChatMessage.tenant_id == tenant_id,
                ChatMessage.message_type == "assistant",
                ChatMessage.created_at >= text(f"NOW() - INTERVAL {days} DAY"),
            )
        )
        row = result.one()
        total_messages = row.total_messages or 1
        total_cost = float(row.total_cost or 0)

        # Cost by model
        model_results = await self.db.execute(
            select(
                ChatMessage.model_used,
                func.coalesce(func.sum(ChatMessage.cost_estimate), 0).label("cost"),
            )
            .select_from(ChatMessage)
            .where(
                ChatMessage.tenant_id == tenant_id,
                ChatMessage.message_type == "assistant",
                ChatMessage.created_at >= text(f"NOW() - INTERVAL {days} DAY"),
            )
            .group_by(ChatMessage.model_used)
        )
        cost_by_model = {}
        for r in model_results.all():
            if r.model_used:
                cost_by_model[r.model_used] = float(r.cost or 0)

        return {
            "totalCost": total_cost,
            "averageCostPerMessage": round(total_cost / total_messages, 6),
            "costByModel": cost_by_model,
            "costByTenant": {},
        }

    async def get_chat_analytics(self, tenant_id: int) -> dict[str, Any]:
        total = await self.db.execute(
            select(func.count()).select_from(ChatSession).where(ChatSession.tenant_id == tenant_id)
        )
        messages = await self.db.execute(
            select(func.count()).select_from(ChatMessage).where(ChatMessage.tenant_id == tenant_id)
        )

        # Sessions over time (last 30 days)
        sessions_over_time = await self.db.execute(
            select(
                func.date(ChatSession.started_at).label("session_date"),
                func.count().label("count"),
            )
            .select_from(ChatSession)
            .where(
                ChatSession.tenant_id == tenant_id,
                ChatSession.started_at >= text("NOW() - INTERVAL 30 DAY"),
            )
            .group_by(func.date(ChatSession.started_at))
            .order_by(func.date(ChatSession.started_at))
        )

        total_sessions = total.scalar() or 0
        total_msgs = messages.scalar() or 0

        sessions_time_data = [
            {"timestamp": str(row.session_date), "count": row.count}
            for row in sessions_over_time.all()
        ]

        return {
            "totalSessions": total_sessions,
            "totalMessages": total_msgs,
            "averageMessagesPerSession": round(total_msgs / max(total_sessions, 1), 2),
            "sessionsOverTime": sessions_time_data,
        }

    async def get_document_analytics(self, tenant_id: int) -> dict[str, Any]:
        total = await self.db.execute(
            select(func.count()).select_from(Document).where(Document.tenant_id == tenant_id)
        )
        processed = await self.db.execute(
            select(func.count()).select_from(Document).where(
                Document.tenant_id == tenant_id, Document.status == "processed"
            )
        )

        # Documents by category
        categories = await self.db.execute(
            select(
                Document.category_id,
                func.count().label("count"),
            )
            .select_from(Document)
            .where(Document.tenant_id == tenant_id)
            .group_by(Document.category_id)
        )
        category_data = {}
        for row in categories.all():
            key = str(row.category_id) if row.category_id else "uncategorized"
            category_data[key] = row.count

        return {
            "totalDocuments": total.scalar() or 0,
            "documentsProcessed": processed.scalar() or 0,
            "averageProcessingTime": 0,
            "documentsByCategory": category_data,
        }

    async def log_api_usage(self, log_data: dict) -> None:
        log = ApiUsageLog(**log_data)
        self.db.add(log)
        await self.db.commit()

    async def increment_tenant_metric(
        self, tenant_id: int, metric: str, amount: int = 1
    ) -> None:
        """
        Increment a specific metric in TenantAnalytics for the current date.
        Uses UPSERT logic (insert if not exists, else update).
        """
        today = date.today()
        
        # MySQL-specific UPSERT (ON DUPLICATE KEY UPDATE)
        # Using text() for execution to handle the specific syntax easily
        query = text(f"""
            INSERT INTO tenant_analytics (tenant_id, metric_date, {metric}, created_at)
            VALUES (:tid, :mdate, :amt, NOW())
            ON DUPLICATE KEY UPDATE {metric} = {metric} + :amt
        """)
        
        await self.db.execute(
            query, 
            {"tid": tenant_id, "mdate": today, "amt": amount}
        )
        await self.db.commit()
