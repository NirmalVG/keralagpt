"""
Generator Service
Calls Groq's LLM API and streams the response token by token.

Why Groq:
- Fastest inference available (LPU hardware) — ~500 tokens/sec vs ~60 for OpenAI
- Generous free tier — 14,400 requests/day
- First token latency ~200ms — critical for perceived responsiveness

We use openai/gpt-oss-120b with fallback to openai/gpt-oss-20b:
- 128k context window — fits large retrieved contexts
- Strong instruction following — respects citation rules
- Multilingual — handles Malayalam queries

This version also:
- Accumulates the full response text to extract follow-up questions
- Sends follow-ups as a [FOLLOWUPS] SSE event before [DONE]
- Optionally persists the conversation to Supabase
- Retries with a fallback model on capacity errors (503)
"""
from groq import AsyncGroq
from app.config import settings
from app.services.rag.prompt import build_prompt, extract_follow_ups
from typing import AsyncGenerator
import json

# Singleton client — same pattern as Supabase
_groq_client: AsyncGroq | None = None

# Primary model with fallback chain
MODELS = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
]


def get_groq_client() -> AsyncGroq:
    global _groq_client
    if _groq_client is None:
        if not settings.GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY must be set in .env")
        _groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    return _groq_client


async def stream_answer(
    query: str,
    context_string: str,
    sources: list[dict],
    web_results: list[dict] | None = None,
    session_id: str | None = None,
    domain: str | None = None,
) -> AsyncGenerator[str, None]:

    client = get_groq_client()
    messages = build_prompt(query, context_string)

    # Try each model in the fallback chain
    stream = None
    used_model = MODELS[0]
    for model in MODELS:
        try:
            stream = await client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=1024,
                temperature=0.3,
                stream=True,
            )
            used_model = model
            break
        except Exception as e:
            print(f"[generator] Model {model} failed: {e}")
            if model == MODELS[-1]:
                # All models failed — yield error message
                error_msg = (
                    f"The AI service is temporarily unavailable ({str(e)[:80]}). "
                    "Please try again in a moment."
                )
                for word in error_msg.split():
                    yield f"data: {word} \n\n"
                yield 'data: [FOLLOWUPS]["What is Kathakali?","Tell me about Kerala\'s history","What is Onam?"][/FOLLOWUPS]\n\n'
                yield "data: [SOURCES][][/SOURCES]\n\n"
                yield "data: [DONE]\n\n"
                return

    if used_model != MODELS[0]:
        print(f"[generator] Using fallback model: {used_model}")

    # Accumulate the full response to extract follow-ups at the end
    accumulated_text = ""

    async for chunk in stream:
        delta = chunk.choices[0].delta
        if delta.content:
            accumulated_text += delta.content
            token = delta.content.replace("\n", "\\n")
            yield f"data: {token}\n\n"

    # ── Extract follow-up questions ──────────────────────────────
    follow_ups = extract_follow_ups(accumulated_text)
    if follow_ups:
        yield f"data: [FOLLOWUPS]{json.dumps(follow_ups)}[/FOLLOWUPS]\n\n"

    # ── Build unified sources payload (RAG + web) ────────────────
    all_sources = [
        {
            "title": s.get("document_title", ""),
            "section": s.get("section_title", ""),
            "credibility_tier": s.get("credibility_tier", "curated"),
            "similarity": round(s.get("similarity", 0), 3),
            "domain": s.get("domain", ""),
            "source_type": "knowledge_base",
        }
        for s in sources
    ]

    if web_results:
        for w in web_results:
            all_sources.append({
                "title": w.get("title", ""),
                "url": w.get("url", ""),
                "credibility_tier": w.get("credibility_tier", "curated"),
                "similarity": round(w.get("score", 0), 3),
                "domain": "web",
                "source_type": "web",
            })

    sources_payload = json.dumps(all_sources)
    yield f"data: [SOURCES]{sources_payload}[/SOURCES]\n\n"
    yield f"data: [DONE]\n\n"

    # ── Persist conversation (non-blocking, fire-and-forget) ─────
    if session_id:
        try:
            from app.services.db.supabase_client import get_supabase
            db = get_supabase()
            db.table("conversations").insert({
                "session_id": session_id,
                "query": query,
                "response": accumulated_text[:5000],  # cap at 5k chars
                "domain": domain,
                "confidence_score": _confidence_to_float(accumulated_text),
            }).execute()
        except Exception as e:
            # Never let persistence failures affect the user experience
            print(f"[generator] Conversation persistence failed: {e}")


def _confidence_to_float(text: str) -> float:
    """Convert CONFIDENCE: High/Medium/Low to a float score."""
    lower = text.lower()
    if "confidence: high" in lower:
        return 0.9
    elif "confidence: low" in lower:
        return 0.3
    return 0.6