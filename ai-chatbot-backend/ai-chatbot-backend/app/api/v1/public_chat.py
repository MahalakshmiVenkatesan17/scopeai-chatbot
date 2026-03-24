import secrets
import uuid
from datetime import datetime, timezone
 
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
 
from app.core.database import get_db
from app.core.exceptions import BadRequestError, NotFoundError
from app.core.logging import logger
from app.core.redis import cache_service
from app.repositories.message_repo import MessageRepository
from app.repositories.session_repo import ChatSessionRepository
from app.repositories.analytics_repo import AnalyticsRepository
from app.repositories.tenant_repo import TenantConfigRepository, TenantRepository
 
router = APIRouter(prefix="/public/chat", tags=["Public Chat"])
 
 
@router.get("/config/{tenant_slug}")
async def get_chatbot_config(
    tenant_slug: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import text as sa_text
 
    tenant_repo = TenantRepository(db)
    tenant = await tenant_repo.get_by_slug(tenant_slug)
    if not tenant or tenant.status != "active":
        raise NotFoundError("Tenant not found")
 
    # Set state for middleware/logging
    request.state.tenant_id = tenant.id
 
    # Query tenant_chatbot_config table (same as Node.js)
    try:
        result = await db.execute(
            sa_text(
                "SELECT chatbot_name, welcome_message, placeholder_text, widget_position, "
                "primary_color, secondary_color, text_color, background_color, widget_size, "
                "auto_open, show_agent_avatar, collect_user_info, require_email, "
                "enable_file_upload, max_message_length, custom_css "
                "FROM tenant_chatbot_config WHERE tenant_id = :tid AND is_active = true"
            ),
            {"tid": tenant.id},
        )
        row = result.mappings().first()
    except Exception:
        row = None
 
    if row:
        config = {
            "chatbotName": row.get("chatbot_name", "AI Assistant"),
            "welcomeMessage": row.get("welcome_message", "Hello! How can I help you today?"),
            "placeholderText": row.get("placeholder_text", "Type your message here..."),
            "widgetPosition": row.get("widget_position", "bottom-right"),
            "primaryColor": row.get("primary_color", "#007bff"),
            "secondaryColor": row.get("secondary_color", "#6c757d"),
            "textColor": row.get("text_color", "#333333"),
            "backgroundColor": row.get("background_color", "#ffffff"),
            "widgetSize": row.get("widget_size", "medium"),
            "autoOpen": row.get("auto_open", 0),
            "showAgentAvatar": row.get("show_agent_avatar", 1),
            "collectUserInfo": row.get("collect_user_info", 0),
            "requireEmail": row.get("require_email", 0),
            "enableFileUpload": row.get("enable_file_upload", 0),
            "maxMessageLength": row.get("max_message_length", 2000),
            "customCss": row.get("custom_css"),
        }
    else:
        config = {
            "chatbotName": "AI Assistant",
            "welcomeMessage": "Hello! How can I help you today?",
            "placeholderText": "Type your message here...",
            "widgetPosition": "bottom-right",
            "primaryColor": tenant.primary_color or "#007bff",
            "secondaryColor": tenant.secondary_color or "#6c757d",
            "textColor": "#333333",
            "backgroundColor": "#ffffff",
            "widgetSize": "medium",
            "autoOpen": 0,
            "showAgentAvatar": 1,
            "collectUserInfo": 0,
            "requireEmail": 0,
            "enableFileUpload": 0,
            "maxMessageLength": 2000,
            "customCss": None,
        }
 
    return {
        "success": True,
        "data": {
            "config": config,
        },
    }
 
 
@router.post("/session")
async def init_session(
    body: dict | None = None,
    request: Request = None,
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import text as sa_text
 
    body = body or {}
    tenant_slug = body.get("tenantSlug")
    if not tenant_slug:
        raise BadRequestError("tenantSlug is required")
 
    tenant_repo = TenantRepository(db)
    tenant = await tenant_repo.get_by_slug(tenant_slug)
    if not tenant or tenant.status != "active":
        raise NotFoundError("Tenant not found")
 
    # Set state for middleware/logging
    if request:
        request.state.tenant_id = tenant.id
 
    visitor_id = body.get("visitorId", f"visitor_{secrets.token_hex(12)}")
    session_id = str(uuid.uuid4())
    session_token = f"sess_{secrets.token_hex(24)}"
 
    # Extract visitor info and page details
    v_info = body.get("visitorInfo") or {}
    v_name = v_info.get("name") or body.get("visitorName")
    v_email = v_info.get("email") or body.get("visitorEmail")
    v_meta = v_info.get("metadata") or body.get("metadata")
 
    session_repo = ChatSessionRepository(db)
    session = await session_repo.create({
        "id": session_id,
        "tenant_id": tenant.id,
        "user_id": None,
        "session_name": f"Public Chat {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}",
        "session_metadata": {
            "visitorName": v_name,
            "visitorEmail": v_email,
            "visitorId": visitor_id,
            "pageUrl": body.get("pageUrl"),
            "referrerUrl": body.get("referrerUrl"),
            "metadata": v_meta,
            "sessionToken": session_token,
        },
        "status": "active",
        "ip_address": request.client.host if request and request.client else None,
        "user_agent": request.headers.get("User-Agent") if request else None,
    })
 
    # Increment analytics: chat_sessions
    analytics_repo = AnalyticsRepository(db)
    await analytics_repo.increment_tenant_metric(tenant.id, "chat_sessions")
 
    # Cache session token mapping
    await cache_service.set(f"public_session:{session_token}", {
        "sessionId": session_id,
        "tenantId": tenant.id,
        "tenantSlug": tenant_slug,
        "visitorId": visitor_id,
    }, ttl_seconds=86400)
 
    # Get chatbot config for response
    try:
        result = await db.execute(
            sa_text(
                "SELECT chatbot_name, welcome_message, placeholder_text, primary_color, secondary_color "
                "FROM tenant_chatbot_config WHERE tenant_id = :tid"
            ),
            {"tid": tenant.id},
        )
        row = result.mappings().first()
    except Exception:
        row = None
 
    if row:
        config = {
            "chatbotName": row.get("chatbot_name", "AI Assistant"),
            "welcomeMessage": row.get("welcome_message", "Hello! How can I help you today?"),
            "placeholderText": row.get("placeholder_text", "Type your message here..."),
            "primaryColor": row.get("primary_color", "#007bff"),
            "secondaryColor": row.get("secondary_color", "#6c757d"),
        }
    else:
        config = {
            "chatbotName": "AI Assistant",
            "welcomeMessage": "Hello! How can I help you today?",
            "placeholderText": "Type your message here...",
            "primaryColor": tenant.primary_color or "#007bff",
            "secondaryColor": tenant.secondary_color or "#6c757d",
        }
 
    return {
        "success": True,
        "data": {
            "sessionId": session_id,
            "sessionToken": session_token,
            "tenantSlug": tenant_slug,
            "visitorId": visitor_id,
            "config": config,
        },
    }
 
 
async def _validate_session_token(session_token: str) -> dict:
    """Validate public session token and return session info."""
    session_data = await cache_service.get(f"public_session:{session_token}")
    if not session_data:
        raise BadRequestError("Invalid or expired session token", code="INVALID_SESSION_TOKEN")
    return session_data
 
 
@router.post("/session/{session_token}/message")
async def send_public_message(
    session_token: str,
    body: dict,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    session_data = await _validate_session_token(session_token)
    session_id = session_data["sessionId"]
    tenant_id = session_data["tenantId"]
 
    # Set state for middleware/logging
    request.state.tenant_id = tenant_id
 
    content = body.get("content", "").strip()
    if not content:
        content = body.get("message", "").strip()
    if not content:
        raise BadRequestError("Message content is required")
 
    import json
    import time
 
    from app.services.langgraph_service import get_langgraph_service

    message_repo = MessageRepository(db)

    # Save user message
    user_msg = await message_repo.create({
        "session_id": session_id,
        "tenant_id": tenant_id,
        "message_type": "user",
        "content": content,
    })

    # Run LangGraph RAG pipeline (singleton)
    langgraph = get_langgraph_service()
    start_time = time.time()
    ai_result = await langgraph.generate_response(
        message=content,
        tenant_id=tenant_id,
        db=db,
        session_id=session_id,
        use_documents=True,
    )
    processing_time = int((time.time() - start_time) * 1000)



    context_json = json.dumps(ai_result.context_chunks) if ai_result.context_chunks else None
    assistant_msg = await message_repo.create({
        "session_id": session_id,
        "tenant_id": tenant_id,
        "message_type": "assistant",
        "content": ai_result.content,
        "token_count": ai_result.token_count,
        "model_used": ai_result.model or "gpt-4",
        "processing_time_ms": processing_time,
        "cost_estimate": ai_result.cost,
        "context_chunks": context_json,
    })
 
    # Update session activity
    session_repo = ChatSessionRepository(db)
    await session_repo.update_last_activity(session_id)
 
    # Increment analytics: messages_sent
    analytics_repo = AnalyticsRepository(db)
    await analytics_repo.increment_tenant_metric(tenant_id, "messages_sent")
 
    return {
        "success": True,
        "data": {
            "visitorMessage": {
                "id": user_msg.id,
                "content": user_msg.content,
                "role": "visitor",
                "createdAt": user_msg.created_at.isoformat().replace("+00:00", "Z") if user_msg.created_at else None,
            },
            "assistantMessage": {
                "id": assistant_msg.id,
                "content": assistant_msg.content,
                "role": "assistant",
                "createdAt": assistant_msg.created_at.isoformat().replace("+00:00", "Z") if assistant_msg.created_at else None,
            },
            "usage": ai_result.usage if hasattr(ai_result, "usage") and ai_result.usage else {
                "promptTokens": 0,
                "completionTokens": 0,
                "totalTokens": ai_result.token_count or 0,
            },
            "cost": ai_result.cost or 0,
        },
    }
 
 
@router.get("/session/{session_token}/messages")
async def get_public_messages(
    session_token: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    session_data = await _validate_session_token(session_token)
    session_id = session_data["sessionId"]
    tenant_id = session_data["tenantId"]
 
    # Set state for middleware/logging
    request.state.tenant_id = tenant_id
 
    message_repo = MessageRepository(db)
    messages = await message_repo.get_by_session(session_id, limit=100)
 
    return {
        "success": True,
        "data": [
            {
                "id": m.id, "messageType": m.message_type, "content": m.content,
                "createdAt": m.created_at.isoformat() if m.created_at else None,
            }
            for m in messages
        ],
    }
 
 
@router.post("/session/{session_token}/end")
async def end_public_session(
    session_token: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    session_data = await _validate_session_token(session_token)
    session_id = session_data["sessionId"]
    tenant_id = session_data["tenantId"]
 
    # Set state for middleware/logging
    request.state.tenant_id = tenant_id
 
    session_repo = ChatSessionRepository(db)
    await session_repo.end_session(session_id)
    await cache_service.delete(f"public_session:{session_token}")
 
    return {"success": True, "data": {"message": "Session ended successfully"}}
 
 
@router.post("/session/{session_token}/clear-memory")
async def clear_public_memory(
    session_token: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    session_data = await _validate_session_token(session_token)
    session_id = session_data["sessionId"]
    tenant_id = session_data["tenantId"]
 
    # Set state for middleware/logging
    request.state.tenant_id = tenant_id
 
    # Delete all messages in session
    from sqlalchemy import delete
    from app.models.chat import ChatMessage
    await db.execute(delete(ChatMessage).where(ChatMessage.session_id == session_id))
    await db.commit()
 
    return {"success": True, "message": "Conversation memory cleared"}