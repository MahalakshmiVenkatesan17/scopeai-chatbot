"""
WebSocket connection manager using python-socketio.
Mirrors Node.js Socket.IO setup with rooms and broadcast helpers.
"""

import socketio

from app.core.config import settings
from app.core.logging import logger
from app.core.security import decode_access_token

# Redis manager — shares socket state (rooms, sessions) across all Uvicorn workers
mgr = socketio.AsyncRedisManager(settings.redis_connection_url)

# Create async Socket.IO server
sio = socketio.AsyncServer(
    async_mode="asgi",
    client_manager=mgr,
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)


@sio.event
async def connect(sid, environ, auth):
    """Authenticate on connection — mirrors Node.js socket.use() JWT middleware."""
    token = None

    # Extract token from auth data or query params
    if auth and isinstance(auth, dict):
        token = auth.get("token")
    if not token:
        query = environ.get("QUERY_STRING", "")
        for param in query.split("&"):
            if param.startswith("token="):
                token = param.split("=", 1)[1]

    if not token:
        logger.warning(f"WebSocket connection rejected: no token (sid={sid})")
        raise socketio.exceptions.ConnectionRefusedError("Authentication required")

    payload = decode_access_token(token)
    if not payload:
        logger.warning(f"WebSocket connection rejected: invalid token (sid={sid})")
        raise socketio.exceptions.ConnectionRefusedError("Invalid token")

    user_id = payload.get("userId")
    tenant_id = payload.get("tenantId")
    email = payload.get("email")
    role = payload.get("role")

    # Store user info in session
    async with sio.session(sid) as session:
        session["userId"] = user_id
        session["tenantId"] = tenant_id
        session["email"] = email
        session["role"] = role

    # Join rooms
    await sio.enter_room(sid, f"tenant:{tenant_id}")
    await sio.enter_room(sid, f"user:{user_id}")

    logger.info(f"WebSocket connected: user={email}, tenant={tenant_id}, sid={sid}")


@sio.event
async def disconnect(sid):
    logger.info(f"WebSocket disconnected: sid={sid}")


@sio.on("chat:join_session")
async def join_session(sid, data):
    session_id = data.get("sessionId") if isinstance(data, dict) else data
    await sio.enter_room(sid, f"session:{session_id}")
    logger.debug(f"User joined session room: {session_id} (sid={sid})")


@sio.on("chat:leave_session")
async def leave_session(sid, data):
    session_id = data.get("sessionId") if isinstance(data, dict) else data
    await sio.leave_room(sid, f"session:{session_id}")
    logger.debug(f"User left session room: {session_id} (sid={sid})")


@sio.on("chat:message")
async def chat_message(sid, data):
    """Broadcast message to session room."""
    session_id = data.get("sessionId")
    if session_id:
        await sio.emit("chat:message", data, room=f"session:{session_id}", skip_sid=sid)


@sio.on("chat:typing")
async def typing(sid, data):
    """Broadcast typing indicator to session room."""
    session_id = data.get("sessionId")
    if session_id:
        await sio.emit("chat:typing", data, room=f"session:{session_id}", skip_sid=sid)


@sio.on("notification:read")
async def notification_read(sid, data):
    notification_id = data.get("notificationId") if isinstance(data, dict) else data
    async with sio.session(sid) as session:
        user_id = session.get("userId")
    logger.debug(f"Notification {notification_id} read by user {user_id}")


# Broadcast helper functions (matching Node.js broadcastToXxx methods)
async def broadcast_to_tenant(tenant_id: int, event: str, data: dict):
    await sio.emit(event, data, room=f"tenant:{tenant_id}")


async def broadcast_to_user(user_id: int, event: str, data: dict):
    await sio.emit(event, data, room=f"user:{user_id}")


async def broadcast_to_session(session_id: str, event: str, data: dict):
    await sio.emit(event, data, room=f"session:{session_id}")
