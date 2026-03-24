import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_current_user
from app.core.database import get_db
from app.core.exceptions import BadRequestError, NotFoundError
from app.core.logging import logger
from app.repositories.message_repo import MessageRepository
from app.repositories.session_repo import ChatSessionRepository
from app.repositories.analytics_repo import AnalyticsRepository
from app.schemas.chat import MessageRequest, SessionCreateRequest, SessionUpdateRequest

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/sessions")
async def create_session(
    body: SessionCreateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = ChatSessionRepository(db)
    session_id = str(uuid.uuid4())
    session = await repo.create({
        "id": session_id,
        "tenant_id": current_user.tenant_id,
        "user_id": current_user.id,
        "session_name": body.session_name or f"Chat {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}",
        "context_documents": body.context_documents,
        "status": "active",
    })
    
    # Increment analytics: chat_sessions
    analytics_repo = AnalyticsRepository(db)
    await analytics_repo.increment_tenant_metric(current_user.tenant_id, "chat_sessions")

    return {
        "success": True,
        "data": {
            "id": session.id, "sessionName": session.session_name,
            "status": session.status,
            "startedAt": session.started_at.isoformat() if session.started_at else None,
        },
        "message": "Session created",
    }


@router.get("/sessions")
async def list_sessions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = None,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = ChatSessionRepository(db)
    offset = (page - 1) * limit
    sessions = await repo.get_by_tenant(
        current_user.tenant_id, user_id=current_user.id,
        status=status, skip=offset, limit=limit,
    )
    total = await repo.count_by_tenant(
        current_user.tenant_id, user_id=current_user.id, status=status,
    )
    return {
        "success": True,
        "data": [
            {
                "id": s.id, "sessionName": s.session_name, "status": s.status,
                "startedAt": s.started_at.isoformat() if s.started_at else None,
                "lastActivity": s.last_activity.isoformat() if s.last_activity else None,
            }
            for s in sessions
        ],
        "pagination": {"page": page, "limit": limit, "total": total, "totalPages": -(-total // limit)},
    }


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = ChatSessionRepository(db)
    session = await repo.get_by_id(session_id)
    if not session or session.tenant_id != current_user.tenant_id:
        raise NotFoundError("Session not found")
    return {
        "success": True,
        "data": {
            "id": session.id, "sessionName": session.session_name,
            "status": session.status, "contextDocuments": session.context_documents,
            "startedAt": session.started_at.isoformat() if session.started_at else None,
            "lastActivity": session.last_activity.isoformat() if session.last_activity else None,
        },
    }


@router.put("/sessions/{session_id}")
async def update_session(
    session_id: str,
    body: SessionUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = ChatSessionRepository(db)
    session = await repo.get_by_id(session_id)
    if not session or session.tenant_id != current_user.tenant_id:
        raise NotFoundError("Session not found")
    update_data = body.model_dump(exclude_none=True)
    await repo.update_by_id(session_id, update_data)
    return {"success": True, "message": "Session updated"}


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = ChatSessionRepository(db)
    session = await repo.get_by_id(session_id)
    if not session or session.tenant_id != current_user.tenant_id:
        raise NotFoundError("Session not found")
    await repo.delete_by_id(session_id)
    return {"success": True, "message": "Session deleted"}


@router.post("/sessions/{session_id}/messages")
async def send_message(
    session_id: str,
    body: MessageRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    import json
    import time

    from app.services.langgraph_service import LangGraphService

    session_repo = ChatSessionRepository(db)
    session = await session_repo.get_by_id(session_id)
    if not session or session.tenant_id != current_user.tenant_id:
        raise NotFoundError("Session not found")

    message_repo = MessageRepository(db)
    start_time = time.time()

    # Save user message
    user_msg = await message_repo.create({
        "session_id": session_id,
        "tenant_id": current_user.tenant_id,
        "message_type": "user",
        "content": body.content,
    })

    # Run LangGraph RAG pipeline
    langgraph = LangGraphService()
    ai_result = await langgraph.generate_response(
        message=body.content,
        tenant_id=current_user.tenant_id,
        db=db,
        session_id=session_id,
        use_documents=True,
    )

    processing_time = int((time.time() - start_time) * 1000)

    # Save assistant message
    context_json = json.dumps(ai_result.context_chunks) if ai_result.context_chunks else None
    assistant_msg = await message_repo.create({
        "session_id": session_id,
        "tenant_id": current_user.tenant_id,
        "message_type": "assistant",
        "content": ai_result.content,
        "token_count": ai_result.token_count,
        "processing_time_ms": processing_time,
        "model_used": ai_result.model or body.model or "gpt-4",
        "cost_estimate": ai_result.cost,
        "context_chunks": context_json,
    })

    # Update session last activity
    await session_repo.update_last_activity(session_id)

    # Increment analytics: messages_sent
    analytics_repo = AnalyticsRepository(db)
    await analytics_repo.increment_tenant_metric(current_user.tenant_id, "messages_sent")

    logger.info(f"Chat message processed: session={session_id}, time={processing_time}ms")

    return {
        "success": True,
        "data": {
            "userMessage": {
                "id": user_msg.id, "content": user_msg.content,
                "messageType": "user",
                "createdAt": user_msg.created_at.isoformat() if user_msg.created_at else None,
            },
            "assistantMessage": {
                "id": assistant_msg.id, "content": assistant_msg.content,
                "messageType": "assistant",
                "tokenCount": assistant_msg.token_count,
                "modelUsed": assistant_msg.model_used,
                "processingTimeMs": assistant_msg.processing_time_ms,
                "costEstimate": float(assistant_msg.cost_estimate) if assistant_msg.cost_estimate else None,
                "contextChunks": assistant_msg.context_chunks,
                "createdAt": assistant_msg.created_at.isoformat() if assistant_msg.created_at else None,
            },
        },
    }


@router.get("/sessions/{session_id}/messages")
async def get_messages(
    session_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session_repo = ChatSessionRepository(db)
    session = await session_repo.get_by_id(session_id)
    if not session or session.tenant_id != current_user.tenant_id:
        raise NotFoundError("Session not found")

    message_repo = MessageRepository(db)
    offset = (page - 1) * limit
    messages = await message_repo.get_by_session(session_id, skip=offset, limit=limit)
    total = await message_repo.count_by_session(session_id)

    return {
        "success": True,
        "data": [
            {
                "id": m.id, "sessionId": m.session_id, "messageType": m.message_type,
                "content": m.content, "tokenCount": m.token_count,
                "modelUsed": m.model_used, "processingTimeMs": m.processing_time_ms,
                "costEstimate": float(m.cost_estimate) if m.cost_estimate else None,
                "contextChunks": m.context_chunks,
                "createdAt": m.created_at.isoformat() if m.created_at else None,
            }
            for m in messages
        ],
        "pagination": {"page": page, "limit": limit, "total": total, "totalPages": -(-total // limit)},
    }


@router.delete("/sessions/{session_id}/messages/{message_id}")
async def delete_message(
    session_id: str,
    message_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    message_repo = MessageRepository(db)
    msg = await message_repo.get_by_id(message_id)
    if not msg or msg.session_id != session_id or msg.tenant_id != current_user.tenant_id:
        raise NotFoundError("Message not found")
    await message_repo.delete_by_id(message_id)
    return {"success": True, "message": "Message deleted"}


@router.post("/sessions/{session_id}/messages/{message_id}/regenerate")
async def regenerate_message(
    session_id: str,
    message_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    import json
    import time

    from sqlalchemy import text as sa_text
    from app.services.langgraph_service import LangGraphService

    message_repo = MessageRepository(db)
    msg = await message_repo.get_by_id(message_id)
    if not msg or msg.session_id != session_id or msg.tenant_id != current_user.tenant_id:
        raise NotFoundError("Message not found")
    if msg.message_type != "assistant":
        raise BadRequestError("Can only regenerate assistant messages")

    # Find the preceding user message
    result = await db.execute(
        sa_text(
            "SELECT content FROM chat_messages "
            "WHERE session_id = :sid AND message_type = 'user' AND created_at < :ts "
            "ORDER BY created_at DESC LIMIT 1"
        ),
        {"sid": session_id, "ts": msg.created_at},
    )
    row = result.mappings().first()
    if not row:
        raise NotFoundError("Could not find the original user message")
    user_content = str(row["content"])

    # Run LangGraph RAG pipeline again
    langgraph = LangGraphService()
    start_time = time.time()
    ai_result = await langgraph.generate_response(
        message=user_content,
        tenant_id=current_user.tenant_id,
        db=db,
        session_id=session_id,
        use_documents=True,
    )
    processing_time = int((time.time() - start_time) * 1000)

    # Update the existing assistant message in-place
    context_json = json.dumps(ai_result.context_chunks) if ai_result.context_chunks else None
    await message_repo.update_by_id(message_id, {
        "content": ai_result.content,
        "token_count": ai_result.token_count,
        "model_used": ai_result.model,
        "processing_time_ms": processing_time,
        "cost_estimate": ai_result.cost,
        "context_chunks": context_json,
    })

    return {
        "success": True,
        "data": {
            "id": msg.id, "content": ai_result.content,
            "messageType": "assistant",
            "tokenCount": ai_result.token_count,
            "modelUsed": ai_result.model,
            "processingTimeMs": processing_time,
            "contextChunks": ai_result.context_chunks,
            "createdAt": msg.created_at.isoformat() if msg.created_at else None,
        },
        "message": "Message regenerated",
    }


@router.get("/sessions/{session_id}/export")
async def export_session(
    session_id: str,
    format: str = Query("json", pattern="^(json|txt)$"),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session_repo = ChatSessionRepository(db)
    session = await session_repo.get_by_id(session_id)
    if not session or session.tenant_id != current_user.tenant_id:
        raise NotFoundError("Session not found")

    message_repo = MessageRepository(db)
    messages = await message_repo.get_by_session(session_id, limit=1000)

    if format == "txt":
        lines = []
        for m in messages:
            role = "User" if m.message_type == "user" else "Assistant"
            lines.append(f"[{m.created_at}] {role}: {m.content}")
        from fastapi.responses import PlainTextResponse
        return PlainTextResponse("\n\n".join(lines))

    return {
        "success": True,
        "data": {
            "sessionId": session.id,
            "sessionName": session.session_name,
            "messages": [
                {
                    "id": m.id, "messageType": m.message_type, "content": m.content,
                    "createdAt": m.created_at.isoformat() if m.created_at else None,
                }
                for m in messages
            ],
            "exportedAt": datetime.now(timezone.utc).isoformat(),
        },
    }
