import hashlib
import time
from dataclasses import dataclass, field

from openai import APIError, AsyncOpenAI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.core.redis import CacheService


@dataclass
class ChatCompletionRequest:
    messages: list[dict[str, str]]
    tenant_id: int
    model: str | None = None
    max_tokens: int | None = None
    temperature: float | None = None
    stream: bool = False


@dataclass
class ChatCompletionResponse:
    content: str
    tokens_used: int
    cost: float
    model: str
    finish_reason: str
    usage: dict = field(default_factory=dict)


@dataclass
class EmbeddingResponse:
    embedding: list[float]
    tokens_used: int
    cost: float
    model: str


# Pricing per 1K tokens
CHAT_PRICING: dict[str, dict[str, float]] = {
    "gpt-4": {"input": 0.03, "output": 0.06},
    "gpt-4-turbo": {"input": 0.01, "output": 0.03},
    "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
    "gpt-3.5-turbo-16k": {"input": 0.003, "output": 0.004},
    "gpt-4o": {"input": 0.005, "output": 0.015},
    "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
    "gpt-4o-transcribe": {"input": 0.005, "output": 0.015},
}

EMBEDDING_PRICING: dict[str, float] = {
    "text-embedding-3-small": 0.00002,
    "text-embedding-3-large": 0.00013,
    "text-embedding-ada-002": 0.0001,
}


class OpenAIService:
    def __init__(self) -> None:
        self._default_client = AsyncOpenAI(api_key=settings.DEFAULT_OPENAI_API_KEY)
        self.default_model = settings.OPENAI_MODEL
        self.embedding_model = settings.OPENAI_EMBEDDING_MODEL
        self._tenant_clients: dict[int, tuple[AsyncOpenAI, float]] = {}
        self._client_cache_ttl = 300  # 5 minutes

    # ------------------------------------------------------------------
    # Chat completion
    # ------------------------------------------------------------------
    async def generate_chat_completion(
        self, request: ChatCompletionRequest
    ) -> ChatCompletionResponse:
        start = time.time()
        try:
            client = await self.get_client(request.tenant_id)
            model = request.model or self.default_model

            response = await client.chat.completions.create(
                model=model,
                messages=request.messages,  # type: ignore[arg-type]
                max_completion_tokens=request.max_tokens or settings.OPENAI_MAX_TOKENS,
                stream=False,
            )

            choice = response.choices[0]
            if not choice or not choice.message:
                raise RuntimeError("No response from OpenAI")

            tokens_used = response.usage.total_tokens if response.usage else 0
            prompt_tokens = response.usage.prompt_tokens if response.usage else 0
            completion_tokens = response.usage.completion_tokens if response.usage else 0
            cost = self._calculate_chat_cost(model, prompt_tokens, completion_tokens)

            # Downgraded from logger.info — fires on every single message
            duration = int((time.time() - start) * 1000)
            logger.debug(
                "OpenAI chat completion: tenant=%s model=%s tokens=%s cost=%.6f duration_ms=%s",
                request.tenant_id, model, tokens_used, cost, duration,
            )

            return ChatCompletionResponse(
                content=choice.message.content or "",
                tokens_used=tokens_used,
                cost=cost,
                model=model,
                finish_reason=choice.finish_reason or "unknown",
                usage={
                    "total_tokens": tokens_used,
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "totalTokens": tokens_used,
                    "promptTokens": prompt_tokens,
                    "completionTokens": completion_tokens,
                },
            )

        except APIError as e:
            logger.error(
                "OpenAI API error: tenant=%s status=%s message=%s",
                request.tenant_id, e.status_code, str(e),
            )
            if e.status_code == 429:
                raise RuntimeError("OpenAI rate limit exceeded") from e
            if e.status_code == 401:
                raise RuntimeError("Invalid OpenAI API key") from e
            raise RuntimeError(f"OpenAI API error: {e}") from e

    # ------------------------------------------------------------------
    # Streaming chat completion
    # ------------------------------------------------------------------
    async def stream_chat_completion(
        self, request: ChatCompletionRequest
    ):
        """Async generator yielding content chunks, then a final ChatCompletionResponse."""
        client = await self.get_client(request.tenant_id)
        model = request.model or self.default_model

        stream = await client.chat.completions.create(
            model=model,
            messages=request.messages,  # type: ignore[arg-type]
            max_completion_tokens=request.max_tokens or settings.OPENAI_MAX_TOKENS,
            temperature=request.temperature if request.temperature is not None else settings.OPENAI_TEMPERATURE,
            stream=True,
            stream_options={"include_usage": True},
        )

        full_content = ""
        tokens_used = 0
        prompt_tokens = 0
        completion_tokens = 0

        async for chunk in stream:
            delta = chunk.choices[0].delta if chunk.choices else None
            if delta and delta.content:
                full_content += delta.content
                yield delta.content

            if chunk.usage:
                tokens_used = chunk.usage.total_tokens
                prompt_tokens = chunk.usage.prompt_tokens
                completion_tokens = chunk.usage.completion_tokens

        cost = self._calculate_chat_cost(model, prompt_tokens, completion_tokens)

        yield ChatCompletionResponse(
            content=full_content,
            tokens_used=tokens_used,
            cost=cost,
            model=model,
            finish_reason="stop",
            usage={
                "total_tokens": tokens_used,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "totalTokens": tokens_used,
                "promptTokens": prompt_tokens,
                "completionTokens": completion_tokens,
            },
        )

    # ------------------------------------------------------------------
    # Embeddings
    # ------------------------------------------------------------------
    async def generate_embedding(
        self, text: str, tenant_id: int
    ) -> EmbeddingResponse:
        start = time.time()
        try:
            cache_key = f"embedding:{self._hash_text(text)}"
            cached = await CacheService.get(cache_key)
            if cached:
                # Removed logger.debug cache hit log — fires on every cached embedding
                return EmbeddingResponse(**cached)

            client = await self.get_client(tenant_id)

            response = await client.embeddings.create(
                model=self.embedding_model,
                input=text,
                encoding_format="float",
            )

            if not response.data or len(response.data) == 0:
                raise RuntimeError("No embedding returned from OpenAI")

            embedding = response.data[0].embedding
            tokens_used = response.usage.total_tokens if response.usage else 0
            cost = self._calculate_embedding_cost(self.embedding_model, tokens_used)

            result = EmbeddingResponse(
                embedding=embedding,
                tokens_used=tokens_used,
                cost=cost,
                model=self.embedding_model,
            )

            # Cache for 24 hours
            await CacheService.set(
                cache_key,
                {"embedding": embedding, "tokens_used": tokens_used, "cost": cost, "model": self.embedding_model},
                86400,
            )

            # Downgraded from logger.info — fires on every message (embed query + retrieval)
            duration = int((time.time() - start) * 1000)
            logger.debug(
                "OpenAI embedding: tenant=%s tokens=%s duration_ms=%s",
                tenant_id, tokens_used, duration,
            )

            return result

        except APIError as e:
            logger.error(
                "OpenAI embedding API error: tenant=%s status=%s message=%s",
                tenant_id, e.status_code, str(e),
            )
            if e.status_code == 429:
                raise RuntimeError("OpenAI rate limit exceeded") from e
            if e.status_code == 401:
                raise RuntimeError("Invalid OpenAI API key") from e
            raise RuntimeError(f"OpenAI API error: {e}") from e

    async def generate_batch_embeddings(
        self, texts: list[str], tenant_id: int, batch_size: int = 100
    ) -> list[EmbeddingResponse]:
        import asyncio

        results: list[EmbeddingResponse] = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            batch_results = await asyncio.gather(
                *[self.generate_embedding(t, tenant_id) for t in batch]
            )
            results.extend(batch_results)

            if i + batch_size < len(texts):
                await asyncio.sleep(1.0)

        return results

    # ------------------------------------------------------------------
    # API key validation
    # ------------------------------------------------------------------
    async def validate_api_key(self, api_key: str) -> bool:
        try:
            client = AsyncOpenAI(api_key=api_key)
            await client.models.list()
            return True
        except Exception:
            return False

    # ------------------------------------------------------------------
    # Usage stats
    # ------------------------------------------------------------------
    async def get_usage_stats(
        self, tenant_id: int, db: AsyncSession, days: int = 30
    ) -> dict:
        try:
            chat_result = await db.execute(
                text("""
                    SELECT
                        COUNT(*) as count,
                        COALESCE(SUM(token_count), 0) as total_tokens,
                        COALESCE(SUM(cost_cents), 0) as total_cost_cents
                    FROM chat_messages
                    WHERE tenant_id = :tenant_id
                      AND created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
                      AND token_count IS NOT NULL
                """),
                {"tenant_id": tenant_id, "days": days},
            )
            chat_row = chat_result.mappings().first()

            embedding_result = await db.execute(
                text("""
                    SELECT
                        COUNT(*) as count,
                        COALESCE(SUM(token_count), 0) as total_tokens
                    FROM document_chunks
                    WHERE tenant_id = :tenant_id
                      AND created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
                      AND embedding_status = 'completed'
                      AND token_count IS NOT NULL
                """),
                {"tenant_id": tenant_id, "days": days},
            )
            emb_row = embedding_result.mappings().first()

            chat_tokens = int(chat_row["total_tokens"]) if chat_row else 0
            emb_tokens = int(emb_row["total_tokens"]) if emb_row else 0
            chat_count = int(chat_row["count"]) if chat_row else 0
            emb_count = int(emb_row["count"]) if emb_row else 0
            total_tokens = chat_tokens + emb_tokens
            total_requests = chat_count + emb_count
            total_cost_cents = int(chat_row["total_cost_cents"]) if chat_row else 0

            return {
                "totalTokens": total_tokens,
                "totalCost": total_cost_cents / 100,
                "chatCompletions": chat_count,
                "embeddings": emb_count,
                "avgTokensPerRequest": round(total_tokens / total_requests) if total_requests else 0,
            }

        except Exception as e:
            logger.error("Error getting OpenAI usage stats: tenant=%s error=%s", tenant_id, str(e))
            return {
                "totalTokens": 0,
                "totalCost": 0,
                "chatCompletions": 0,
                "embeddings": 0,
                "avgTokensPerRequest": 0,
            }

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------
    async def get_client(self, tenant_id: int) -> AsyncOpenAI:
        """Return tenant-specific OpenAI client (cached), or default."""
        now = time.time()
        if tenant_id in self._tenant_clients:
            client, expires_at = self._tenant_clients[tenant_id]
            if now < expires_at:
                return client
            del self._tenant_clients[tenant_id]

        from app.core.database import async_session_factory

        try:
            async with async_session_factory() as session:
                result = await session.execute(
                    text("""
                        SELECT configuration_value
                        FROM tenant_configurations
                        WHERE tenant_id = :tid
                          AND configuration_key = 'openai_api_key'
                          AND is_active = 1
                        LIMIT 1
                    """),
                    {"tid": tenant_id},
                )
                row = result.scalars().first()
                if row:
                    client = AsyncOpenAI(api_key=row)
                    self._tenant_clients[tenant_id] = (client, now + self._client_cache_ttl)
                    return client
        except Exception as e:
            logger.warning(
                "Failed to get tenant API key, using default: tenant=%s error=%s",
                tenant_id, str(e),
            )

        return self._default_client

    @staticmethod
    def _calculate_chat_cost(model: str, prompt_tokens: int, completion_tokens: int) -> float:
        pricing = CHAT_PRICING.get(model, {"input": 0.0005, "output": 0.0015})
        cost = (prompt_tokens / 1000) * pricing["input"] + (completion_tokens / 1000) * pricing["output"]
        return round(cost, 6)

    @staticmethod
    def _calculate_embedding_cost(model: str, tokens: int) -> float:
        price = EMBEDDING_PRICING.get(model, 0.00002)
        return round((tokens / 1000) * price, 6)

    @staticmethod
    def _hash_text(text: str) -> str:
        if not text:
            return ""
        return hashlib.sha256(text.encode()).hexdigest()[:16]