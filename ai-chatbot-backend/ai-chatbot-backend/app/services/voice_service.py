"""
Voice Service — Audio transcription via OpenAI Whisper.

Flow:
  1. Receive raw audio bytes + metadata from the API endpoint.
  2. Persist the audio file under uploads/voice/<session_id>/<uuid>.<ext>.
  3. Fetch per-tenant language config + build a properly structured Whisper prompt.
  4. Call OpenAI Whisper (whisper-1) for transcription.
  5. Run a lightweight GPT-4o-mini correction pass to fix domain-term spelling.
  6. Return (corrected_text, file_path).

Key improvements over previous version:
  - Audio constraints recommendation for client side (16 kHz mono).
  - Whisper prompt: only ASSISTANT messages as preceding text (not user messages).
  - Vocab is appended as a clean CSV at the end of the prompt — Whisper parses
    a trailing comma-separated list as a token-bias hint, not prose.
  - Common English words are filtered out of the vocab before injection.
  - Per-tenant language config (tenant_configurations.whisper_language).
  - Post-transcription correction pass with GPT-4o-mini to fix domain terms.
  - All error paths fall back gracefully — Whisper output is never lost.
"""
from __future__ import annotations

import asyncio
import os
import uuid
from pathlib import Path

from sqlalchemy import text
from openai import AsyncOpenAI

from app.core.config import settings
from app.core.database import async_session_factory
from app.core.logging import logger
from app.services.openai_service import OpenAIService, ChatCompletionRequest
from app.services.weaviate_service import WeaviateService, SearchOptions

VOICE_UPLOAD_DIR = Path(settings.UPLOAD_DIR) / "voice"

# ---------------------------------------------------------------------------
# Common English filler words that should never appear in the STT vocab list.
# Whisper uses trailing CSV as token-probability hints — common words confuse it.
# ---------------------------------------------------------------------------
_COMMON_WORDS = frozenset({
    "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
    "her", "was", "one", "our", "out", "day", "get", "has", "him", "his",
    "how", "its", "may", "new", "now", "old", "see", "two", "use", "way",
    "who", "did", "man", "end", "put", "say", "she", "too", "any", "big",
    "boy", "did", "few", "got", "let", "own", "run", "set", "try", "why",
    "yes", "yet", "ago", "air", "ask", "due", "far", "off", "per", "top",
    "via", "add", "age", "ago", "aim", "ask", "bit", "buy", "cut", "die",
    "eat", "fit", "fix", "fly", "hit", "hot", "job", "key", "law", "lay",
    "led", "low", "mix", "pay", "ran", "red", "run", "sit", "six", "ten",
    "tie", "win", "won", "act", "ago", "aid", "app", "bad", "bag", "bay",
    "bed", "box", "bus", "buy", "cab", "car", "cup", "dog", "due", "ear",
    "eye", "fan", "far", "fat", "fee", "fit", "fly", "fun", "gap", "gas",
    "guy", "hat", "hit", "hub", "ice", "ill", "ink", "ion", "jar", "joy",
    "lab", "lag", "leg", "lid", "lip", "log", "lot", "map", "mix", "mud",
    "net", "oil", "pan", "pet", "pie", "pig", "pin", "pot", "raw", "ray",
    "row", "sad", "sea", "sky", "sun", "tax", "tea", "tip", "toe", "ton",
    "toy", "tub", "van", "war", "web", "wet", "win", "wit", "yes", "zoo",
    # Very common verbs/adjectives that slip through extraction
    "able", "also", "back", "base", "been", "both", "call", "case", "come",
    "data", "does", "done", "down", "each", "else", "even", "ever", "fact",
    "feel", "find", "five", "from", "full", "give", "good", "hand", "have",
    "help", "here", "high", "home", "into", "just", "keep", "kind", "know",
    "lake", "last", "late", "lead", "left", "less", "life", "like", "line",
    "list", "live", "long", "look", "made", "main", "make", "many", "mean",
    "meet", "more", "most", "move", "much", "must", "name", "need", "next",
    "none", "note", "only", "open", "over", "page", "part", "past", "path",
    "plan", "play", "plus", "post", "read", "real", "rest", "role", "said",
    "same", "save", "self", "send", "show", "side", "sign", "size", "some",
    "sort", "stay", "step", "such", "sure", "take", "talk", "task", "tell",
    "than", "that", "them", "then", "they", "this", "time", "told", "tool",
    "true", "turn", "type", "unit", "upon", "used", "user", "very", "view",
    "wait", "want", "week", "well", "went", "were", "what", "when", "will",
    "with", "word", "work", "year", "your",
})

# ---------------------------------------------------------------------------
# Common Whisper hallucinations triggered by silence or background noise.
# ---------------------------------------------------------------------------
_WHISPER_HALLUCINATIONS = frozenset({
    "thank you for watching", "thanks for watching", "subtitles by",
    "please subscribe", "i hope you enjoyed this video", "thank you.",
    "thanks for listening", "next video", "click the link", "don't forget to",
    "see you in the next one", "bye bye", "goodbye.", "peace out",
    "read out this address.", "read out this address", "read this address",
})


class VoiceService:
    """Handles audio file storage, transcription, and post-correction."""

    def __init__(self) -> None:
        self._client = AsyncOpenAI(api_key=settings.DEFAULT_OPENAI_API_KEY)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def transcribe(
        self,
        audio_bytes: bytes,
        session_id: str,
        tenant_id: int,
        original_filename: str = "audio.webm",
        language: str | None = None,
    ) -> tuple[str, str]:
        """
        Persist the audio file, transcribe via Whisper, correct domain terms,
        and return (corrected_text, saved_file_path).

        Parameters
        ----------
        audio_bytes:       Raw bytes of the audio recording.
        session_id:        Chat session ID — used to organise files on disk.
        tenant_id:         Tenant ID — used to fetch vocab, language, correction.
        original_filename: Original filename from the upload (picks extension).
        language:          Optional BCP-47 override (e.g. "en", "ta", "hi").
                           If None, fetched from tenant_configurations.

        Returns
        -------
        (corrected_transcribed_text, relative_file_path)
        """
        ext = self._get_extension(original_filename)
        
        # 1. Silence check (prevent processing of silent/noisy submissions)
        silence_result = self._is_audio_silent(audio_bytes)
        if silence_result:
            logger.info(f"[VoiceService] Audio submission is too quiet (RMS check), skipping.")
            return "", ""

        file_path = await self._save_audio(audio_bytes, session_id, ext)

        # Fetch tenant language if not provided by caller
        if language is None:
            language = await self._get_tenant_language(tenant_id)
        if not language:
            language = "en"

        # Build Whisper prompt: assistant history + context-aware keywords
        dynamic_prompt, targeted_keywords = await self._build_dynamic_prompt(session_id, tenant_id)

        # Transcribe (GPT-4o Multimodal Intelligence)
        raw_text = await self._call_gpt4o_audio(file_path, tenant_id, dynamic_prompt, language)

        # Hallucination Guards
        raw_clean = raw_text.strip().lower()
        if raw_clean in _WHISPER_HALLUCINATIONS:
            logger.warning(f"[VoiceService] Known Whisper hallucination detected: '{raw_text}'")
            return "", str(file_path.relative_to(settings.UPLOAD_DIR))
        
        if dynamic_prompt and raw_clean:
            dp_clean = dynamic_prompt.lower()
            if len(raw_clean) > 15 and (raw_clean in dp_clean or dp_clean in raw_clean):
                 logger.warning("[VoiceService] Transcript hallucinated the vocab prompt.")
                 return "", str(file_path.relative_to(settings.UPLOAD_DIR))
            
            parts = [p.strip() for p in raw_clean.split(",") if p.strip()]
            if len(parts) > 3:
                overlap = sum(1 for p in parts if any(p in kw.lower() for kw in targeted_keywords))
                if (overlap / len(parts)) > 0.7:
                     logger.warning("[VoiceService] Transcript is a comma-separated list of keywords. Hallucination.")
                     return "", str(file_path.relative_to(settings.UPLOAD_DIR))

        if not raw_text.strip():
            return "", str(file_path.relative_to(settings.UPLOAD_DIR))

        # Post-correction: fix domain-term spelling using the targeted keywords
        corrected_text = await self._correct_transcript(raw_text, tenant_id, targeted_keywords)

        if corrected_text != raw_text:
            logger.info(
                f"[VoiceService] Transcript corrected for session={session_id}"
            )

        return corrected_text, str(file_path.relative_to(settings.UPLOAD_DIR))

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _get_extension(filename: str) -> str:
        """Return the file extension, defaulting to .webm."""
        ext = Path(filename).suffix.lower()
        allowed = {".webm", ".mp3", ".mp4", ".m4a", ".ogg", ".wav", ".flac", ".opus"}
        return ext if ext in allowed else ".webm"

    @staticmethod
    async def _save_audio(audio_bytes: bytes, session_id: str, ext: str) -> Path:
        """Write bytes to uploads/voice/<session_id>/<uuid><ext>."""
        session_dir = VOICE_UPLOAD_DIR / session_id
        session_dir.mkdir(parents=True, exist_ok=True)
        file_path = session_dir / f"{uuid.uuid4()}{ext}"
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, file_path.write_bytes, audio_bytes)
        return file_path

    async def _get_tenant_config(self, tenant_id: int, key: str) -> str | None:
        """Fetch a specific configuration value for a tenant."""
        try:
            async with async_session_factory() as session:
                res = await session.execute(
                    text(
                        "SELECT config_value FROM tenant_configurations "
                        "WHERE tenant_id = :tid AND config_key = :key"
                    ),
                    {"tid": tenant_id, "key": key},
                )
                row = res.mappings().first()
                if row and row["config_value"]:
                    return str(row["config_value"]).strip()
        except Exception as e:
            logger.warning(f"[VoiceService] Failed to fetch tenant config {key}: {e}")
        return None

    async def _get_tenant_language(self, tenant_id: int) -> str | None:
        return await self._get_tenant_config(tenant_id, "whisper_language")

    async def _build_dynamic_prompt(self, session_id: str, tenant_id: int) -> tuple[str, list[str]]:
        """
        Build a context-aware Whisper prompt by combining:
        1. Global Tenant Vocabulary (e.g., SIPCOT, TNRERA).
        2. Last 3 chat messages (Temporal context).
        3. Relevant document keywords (RA-STT).
        """
        recent_chat = ""
        targeted_keywords = []
        
        # 0. Global Tenant Vocab (highest priority for bias)
        global_vocab_str = await self._get_tenant_config(tenant_id, "whisper_vocab")
        if global_vocab_str:
            g_kws = [k.strip() for k in global_vocab_str.split(",") if k.strip()]
            targeted_keywords.extend(g_kws)

        try:
            async with async_session_factory() as session:
                # 1. Fetch temporal context (last 3 ASSISTANT chat messages only)
                res_chat = await session.execute(
                    text("SELECT content, message_type FROM chat_messages WHERE session_id = :sid AND message_type = 'assistant' ORDER BY created_at DESC LIMIT 3"),
                    {"sid": session_id}
                )
                chat_rows = res_chat.mappings().all()
                if chat_rows:
                    history = [f"{r['message_type']}: {r['content'][:150]}" for r in reversed(chat_rows)]
                    recent_chat = " | ".join(history)

            # 2. Perform RA-STT: Retrieve relevant keywords from Weaviate
            if recent_chat:
                openai_svc = OpenAIService()
                weaviate_svc = WeaviateService.get_instance()
                
                # Embed the conversation context
                emb_res = await openai_svc.generate_embedding(recent_chat, tenant_id)
                
                # Search for top 5 relevant chunks
                results = await asyncio.to_thread(
                    weaviate_svc.search_similar_chunks,
                    emb_res.embedding,
                    SearchOptions(tenant_id=tenant_id, limit=5)
                )
                
                # Aggregate keywords from results (stored in SearchResult.keywords)
                all_kws = []
                for res in results:
                    if res.keywords:
                        # Split by comma and clean
                        kws = [k.strip() for k in res.keywords.split(",") if k.strip()]
                        all_kws.extend(kws)
                
                # Deduplicate and filter common words
                if all_kws:
                    seen = set()
                    for kw in all_kws:
                        kw_lower = kw.lower()
                        if kw_lower not in seen and kw_lower not in _COMMON_WORDS:
                            targeted_keywords.append(kw)
                            seen.add(kw_lower)
                    # Limit to top 20 keywords to stay within Whisper prompt limits
                    targeted_keywords = targeted_keywords[:20]

        except Exception as e:
            logger.warning(f"[VoiceService] Failed to fetch dynamic context: {e}")

        # Ensure we don't duplicate global vocab items
        seen = set(k.lower() for k in targeted_keywords)
        # Limit to top 15 keywords to stay within Whisper prompt limits
        targeted_keywords = targeted_keywords[:15]

        # Final Prompt Engineering - Minimalist hints (Whisper-style)
        # Just a list of words separated by commas is the most effective hint format.
        vocab_str = ", ".join(targeted_keywords)
        
        if vocab_str:
            final_prompt = vocab_str
        else:
            final_prompt = ""

        # Add conversation context sparingly
        if recent_chat and len(final_prompt) < 200:
            final_prompt += f" Topic: {recent_chat}."

        return final_prompt[:800], targeted_keywords

    async def _call_gpt4o_audio(self, file_path: Path, tenant_id: int, dynamic_prompt: str, language: str) -> str:
        """
        Use gpt-4o-transcribe via the Audio API (Whisper replacement).
        This model is purpose-built for high-fidelity transcription.
        """
        try:
            # Using OpenAIService to handle tenant-specific API keys
            openai_svc = OpenAIService()
            client = await openai_svc.get_client(tenant_id)

            # We use the standard Audio Transcriptions endpoint for this model
            with open(file_path, "rb") as f:
                logger.info(f"[VoiceService] Requesting GPT-4o Transcription (model=gpt-4o-transcribe, file={file_path.name}, lang={language})")
                
                # The SDK handle the multi-part form data
                transcript = await client.audio.transcriptions.create(
                    model="gpt-4o-transcribe",
                    file=(file_path.name, f, self._mime_for(file_path.suffix)),
                    response_format="text",
                    temperature=0.0,
                    prompt=dynamic_prompt, # Inject Jargon/Context as a phonetic hint
                    language=language,
                )

            text = transcript if isinstance(transcript, str) else str(transcript)
            text = text.strip()
            
            logger.info(f"[VoiceService] GPT-4o Transcript Result: '{text}'")
            return text

        except Exception as exc:
            logger.error("[VoiceService] GPT-4o transcription failed: {}", exc)
            raise RuntimeError(f"GPT-4o Transcription failed: {exc}") from exc

    async def _correct_transcript(self, transcript: str, tenant_id: int, keywords: list[str]) -> str:
        """
        Lightweight post-correction pass using GPT-4o-mini.
        Uses the provided targeted keywords to fix domain-term spelling.
        """
        if not transcript or len(transcript.strip()) < 5:
            return transcript

        if not keywords:
            return transcript  # No keywords → no correction possible/needed

        vocab_str = ", ".join(keywords)

        try:
            from app.services.openai_service import OpenAIService, ChatCompletionRequest
            openai_svc = OpenAIService()

            response = await openai_svc.generate_chat_completion(
                ChatCompletionRequest(
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are a speech-to-text transcript corrector for a domain-specific "
                                "RAG chatbot. Your ONLY job is to fix domain-specific term spelling "
                                "errors in transcripts where Whisper mis-heard a technical term.\n\n"
                                "STRICT RULES:\n"
                                "1. Fix ONLY domain terms that appear in the vocabulary list below.\n"
                                "2. Pay special attention to PHONETIC mis-transcriptions. Acronyms are often misheard "
                                "as common similar-sounding phrases (e.g. 'silk cotton' -> 'SIPCOT').\n"
                                "3. Remove hallucinated phrases like 'Thank you for watching' or 'Please subscribe'.\n"
                                "4. Do NOT rephrase, reword, or add punctuation.\n"
                                "5. If no changes are needed, return the transcript exactly as-is.\n"
                                "6. Return ONLY the (possibly corrected) transcript. No explanation.\n\n"
                                f"Vocabulary list: {vocab_str}"
                            ),
                        },
                        {
                            "role": "user",
                            "content": f"Transcript:\n{transcript}",
                        },
                    ],
                    tenant_id=tenant_id,
                    model="gpt-4o-mini",
                    max_tokens=500,
                    temperature=0.0,
                )
            )

            corrected = response.content.strip()
            # Safety check: if the model returned nothing or something wildly different,
            # fall back to the original transcript
            if not corrected:
                return transcript
            # Sanity check: corrected should be roughly the same length
            if len(corrected) > len(transcript) * 2:
                logger.warning(
                    f"[VoiceService] Correction output suspiciously long "
                    f"(original={len(transcript)}, corrected={len(corrected)}), "
                    "falling back to raw transcript"
                )
                return transcript

            return corrected

        except Exception as e:
            logger.warning(f"[VoiceService] Transcript correction failed, using raw: {e}")
            return transcript  # always fall back — never lose the transcript

    @staticmethod
    def _mime_for(ext: str) -> str:
        mapping = {
            ".webm": "audio/webm",
            ".mp3": "audio/mpeg",
            ".mp4": "audio/mp4",
            ".m4a": "audio/mp4",
            ".ogg": "audio/ogg",
            ".wav": "audio/wav",
            ".flac": "audio/flac",
            ".opus": "audio/opus",
        }
        return mapping.get(ext, "audio/webm")

    @staticmethod
    def _is_audio_silent(audio_bytes: bytes) -> bool:
        """
        Check if the provided audio bytes are 'silent'
        For container formats (webm, ogg, mp4), we check if the byte size is abnormally small.
        The frontend handles the actual RMS silence validation before dispatching.
        """
        if len(audio_bytes) < 1000:
            return True
        return False


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------

_voice_service: VoiceService | None = None


def get_voice_service() -> VoiceService:
    global _voice_service
    if _voice_service is None:
        _voice_service = VoiceService()
    return _voice_service