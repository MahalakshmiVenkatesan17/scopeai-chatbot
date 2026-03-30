"""
LangGraph RAG pipeline for the AI chatbot.

Pipeline: embed_query → retrieve_context → evaluate_context → generate_response
"""

from dataclasses import dataclass, field
from typing import Any

from langgraph.graph import END, StateGraph
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from typing_extensions import TypedDict

from app.core.config import settings
from app.core.logging import logger
from app.services.openai_service import ChatCompletionRequest, OpenAIService
from app.services.weaviate_service import SearchOptions, SearchResult, WeaviateService


# ------------------------------------------------------------------
# State
# ------------------------------------------------------------------
class RAGState(TypedDict, total=False):
    query: str
    tenant_id: int
    session_id: str | None
    use_documents: bool
    conversation_history: list[dict[str, str]]
    system_prompt: str
    query_embedding: list[float]
    context_chunks: list[dict[str, Any]]
    context_text: str
    has_relevant_context: bool
    ai_response: str
    token_count: int
    model: str
    usage: dict[str, int]
    cost: float
    error: str | None


# ------------------------------------------------------------------
# Response dataclass (matches Node.js AIResponse)
# ------------------------------------------------------------------
@dataclass
class AIResponse:
    content: str
    token_count: int = 0
    model: str = ""
    usage: dict[str, int] = field(default_factory=lambda: {"promptTokens": 0, "completionTokens": 0, "totalTokens": 0})
    cost: float = 0.0
    context_chunks: list[dict[str, Any]] = field(default_factory=list)


# ------------------------------------------------------------------
# Service
# ------------------------------------------------------------------
class LangGraphService:
    def __init__(self) -> None:
        self.openai_service = OpenAIService()
        self.weaviate_service = WeaviateService.get_instance()
        self._graph = self._build_graph()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    async def generate_response(
        self,
        message: str,
        tenant_id: int,
        db: AsyncSession,
        session_id: str | None = None,
        use_documents: bool = True,
    ) -> AIResponse:
        """Run the full RAG pipeline and return an AIResponse."""

        # Load tenant chatbot config
        system_prompt = await self._get_system_prompt(tenant_id, db)

        # Load conversation history from DB
        conversation_history: list[dict[str, str]] = []
        if session_id:
            conversation_history = await self._load_conversation_history(session_id, db)

        initial_state: RAGState = {
            "query": message,
            "tenant_id": tenant_id,
            "session_id": session_id,
            "use_documents": use_documents,
            "conversation_history": conversation_history,
            "system_prompt": system_prompt,
            "query_embedding": [],
            "context_chunks": [],
            "context_text": "",
            "has_relevant_context": False,
            "ai_response": "",
            "token_count": 0,
            "model": "",
            "usage": {"promptTokens": 0, "completionTokens": 0, "totalTokens": 0},
            "cost": 0.0,
            "error": None,
        }

        # Execute the graph
        final_state = await self._graph.ainvoke(initial_state)

        if final_state.get("error"):
            logger.error(
                "RAG pipeline error",
                tenant_id=tenant_id,
                error=final_state["error"],
            )

        return AIResponse(
            content=final_state.get("ai_response", ""),
            token_count=final_state.get("token_count", 0),
            model=final_state.get("model", ""),
            usage=final_state.get("usage", {"promptTokens": 0, "completionTokens": 0, "totalTokens": 0}),
            cost=final_state.get("cost", 0.0),
            context_chunks=final_state.get("context_chunks", []),
        )

    # ------------------------------------------------------------------
    # Graph definition
    # ------------------------------------------------------------------
    def _build_graph(self) -> Any:
        graph = StateGraph(RAGState)

        graph.add_node("embed_query", self._embed_query)
        graph.add_node("retrieve_context", self._retrieve_context)
        graph.add_node("generate_response", self._generate_response)
        graph.add_node("skip_retrieval", self._skip_retrieval)

        graph.set_entry_point("embed_query")

        graph.add_conditional_edges(
            "embed_query",
            self._should_retrieve,
            {
                "retrieve": "retrieve_context",
                "skip": "skip_retrieval",
            },
        )

        graph.add_edge("retrieve_context", "generate_response")
        graph.add_edge("skip_retrieval", "generate_response")
        graph.add_edge("generate_response", END)

        return graph.compile()

    # ------------------------------------------------------------------
    # Graph nodes
    # ------------------------------------------------------------------
    async def _embed_query(self, state: RAGState) -> dict:
        """Generate embedding for the user query."""
        if not state.get("use_documents", True):
            return {"query_embedding": []}

        try:
            result = await self.openai_service.generate_embedding(
                state["query"], state["tenant_id"]
            )
            return {"query_embedding": result.embedding}
        except Exception as e:
            logger.warning("Failed to embed query", error=str(e))
            return {"query_embedding": [], "error": f"Embedding failed: {e}"}

    def _should_retrieve(self, state: RAGState) -> str:
        """Decide whether to retrieve context from Weaviate."""
        if not state.get("use_documents", True):
            return "skip"
        if not state.get("query_embedding"):
            return "skip"
        return "retrieve"

    async def _retrieve_context(self, state: RAGState) -> dict:
        """Retrieve relevant document chunks from Weaviate."""
        try:
            # Check if tenant has processed documents
            from app.core.database import async_session_factory

            async with async_session_factory() as session:
                result = await session.execute(
                    text(
                        'SELECT COUNT(*) as cnt FROM documents WHERE tenant_id = :tid AND status = "processed"'
                    ),
                    {"tid": state["tenant_id"]},
                )
                row = result.mappings().first()
                if not row or int(row["cnt"]) == 0:
                    return {
                        "context_chunks": [],
                        "context_text": "",
                        "has_relevant_context": False,
                    }

            search_results: list[SearchResult] = self.weaviate_service.search_similar_chunks(
                query_embedding=state["query_embedding"],
                options=SearchOptions(
                    tenant_id=state["tenant_id"],
                    limit=10,
                    threshold=0.5,
                ),
            )

            if not search_results:
                return {
                    "context_chunks": [],
                    "context_text": "",
                    "has_relevant_context": False,
                }

            # NEW: Only treat context as relevant if best score clears the bar
            RELEVANCE_THRESHOLD = 0.50  # tune as needed (0.0–1.0 cosine similarity)
            top_score = search_results[0].score if search_results else 0.0

            if top_score < RELEVANCE_THRESHOLD:
                logger.info(
                    "Retrieved chunks below relevance threshold",
                    top_score=top_score,
                    threshold=RELEVANCE_THRESHOLD,
                    tenant_id=state["tenant_id"],
                )
                return {
                    "context_chunks": [],
                    "context_text": "",
                    "has_relevant_context": False,
                }

            chunks = [
                {
                    "id": r.id,
                    "content": r.content,
                    "score": r.score,
                    "chunkId": r.chunk_id,
                    "documentId": r.document_id,
                    "documentTitle": r.document_title,
                    "documentFilename": r.document_filename,
                    "categoryName": r.category_name,
                    "tokenCount": r.token_count,
                }
                for r in search_results[:10]
            ]

            context_text = "\n\n".join(c["content"] for c in chunks)

            return {
                "context_chunks": chunks,
                "context_text": context_text,
                "has_relevant_context": True,
            }

        except Exception as e:
            logger.warning("Failed to retrieve context", error=str(e))
            return {
                "context_chunks": [],
                "context_text": "",
                "has_relevant_context": False,
            }

    async def _skip_retrieval(self, state: RAGState) -> dict:
        return {
            "context_chunks": [],
            "context_text": "",
            "has_relevant_context": False,
        }

    async def _generate_response(self, state: RAGState) -> dict:
        """Call OpenAI to generate the final AI response."""
        try:
            system_prompt = state.get("system_prompt", "You are a helpful AI assistant.")

            if state.get("has_relevant_context") and state.get("context_text"):
                # ✅ Has relevant docs — use them
                system_prompt += (
                    "\n\nContext Information:\n"
                    "--------------------------------\n"
                    f"{state['context_text']}\n"
                    "--------------------------------\n"
                    "Instructions:\n"
                    "- Answer the user's question using ONLY the information above. Do not invent facts.\n"
                    "- Do NOT mention 'context information' in your response. Speak naturally.\n"
                    "- If the information above doesn't contain a direct answer but has related information, offer the related information gracefully.\n"
                    "- ENSURE YOUR RESPONSE IS NOT EMPTY."
                )
            else:
                # ✅ No relevant docs found
                system_prompt += (
                    "\n\nYou do not have information to answer this query. "
                    "Respond using the Helpful Refusal formula mentioned in your guidelines. "
                    "DO NOT mention documents."
                )

            messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]
            messages.extend(state.get("conversation_history", []))
            messages.append({"role": "user", "content": state["query"]})

            response = await self.openai_service.generate_chat_completion(
                ChatCompletionRequest(
                    messages=messages,
                    tenant_id=state["tenant_id"],
                    model="gpt-4o-mini",
                    max_tokens=800,
                    temperature=0.7,
                )
            )

            return {
                "ai_response": response.content,
                "token_count": response.usage.get("totalTokens", 0),
                "model": response.model,
                "usage": {
                    "promptTokens": response.usage.get("promptTokens", 0),
                    "completionTokens": response.usage.get("completionTokens", 0),
                    "totalTokens": response.usage.get("totalTokens", 0),
                },
                "cost": response.cost,
            }

        except Exception as e:
            logger.error("Failed to generate AI response", error=str(e))
            return {
                "ai_response": "I'm sorry, I encountered an error generating a response. Please try again.",
                "token_count": 0,
                "model": "error",
                "usage": {"promptTokens": 0, "completionTokens": 0, "totalTokens": 0},
                "cost": 0.0,
                "error": str(e),
            }
    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    async def _get_system_prompt(self, tenant_id: int, db: AsyncSession) -> str:
        """Load tenant chatbot config and build system prompt."""
        try:
            result = await db.execute(
                text(
                    "SELECT chatbot_name, welcome_message FROM tenant_chatbot_config "
                    "WHERE tenant_id = :tid AND is_active = true"
                ),
                {"tid": tenant_id},
            )
            row = result.mappings().first()

            if row:
                name = row.get("chatbot_name") or "AI Assistant"
                welcome = row.get("welcome_message") or ""
                prompt = (
                    f"You are {name}, an intelligent and conversational AI assistant. "
                    "Your primary responsibility is to provide accurate answers while maintaining a friendly, natural tone.\n"
                    "Guidelines:\n"
                    "1. Be helpful and flexible. Understand the user's intent even if there are typos or alternative phrasing.\n"
                    "2. Base your factual answers solely on the context provided to you. Do NOT hallucinate data.\n"
                    "3. If you cannot answer a question reliably, use the 'Helpful Refusal' formula: [Empathy] + [Honesty] + [What You CAN Help With] + [Call to Action]. "
                    "For example: 'I'm sorry, I don't have an answer to that right now. I can help you with <topics>. Could you try rephrasing your question?'\n"
                    "4. CRITICAL: NEVER use words like 'documents', 'provided context', 'uploaded files', or 'knowledge base'. The user does not know about the backend system. Answer generically.\n"
                    "5. Never return an empty response string. Always say something helpful."
                )
                if welcome:
                    prompt += f'\nProvide answers in a way that aligns with your welcome message: "{welcome}".'
                return prompt
        except Exception as e:
            logger.warning("Failed to load tenant chatbot config", tenant_id=tenant_id, error=str(e))

        return (
            "You are a helpful AI assistant. Answer clearly based on context without mentioning 'context' or 'documents'. "
            "If you cannot answer, use: [Empathy]+[Honesty]+[Call to Action]."
        )

    async def _load_conversation_history(
        self, session_id: str, db: AsyncSession, limit: int = 10
    ) -> list[dict[str, str]]:
        try:
            result = await db.execute(
                text(
                    "SELECT message_type, content FROM chat_messages "
                    "WHERE session_id = :sid ORDER BY created_at ASC LIMIT :lim"
                ),
                {"sid": session_id, "lim": limit},
            )
            rows = result.mappings().all()
            return [
                {
                    # ✅ Map message_type → OpenAI role format
                    "role": "assistant" if str(r["message_type"]) == "assistant" else "user",
                    "content": str(r["content"])
                }
                for r in rows
            ]
        except Exception as e:
            logger.warning("Failed to load conversation history", session_id=session_id, error=str(e))
            return []


# ------------------------------------------------------------------
# Singleton accessor — avoids re-compiling the graph on every request
# ------------------------------------------------------------------
_langgraph_instance: LangGraphService | None = None


def get_langgraph_service() -> LangGraphService:
    global _langgraph_instance
    if _langgraph_instance is None:
        _langgraph_instance = LangGraphService()
    return _langgraph_instance
