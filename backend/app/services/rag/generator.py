"""
Generator Service
Calls Groq's LLM API and streams the response token by token.

Why Groq:
- Fastest inference available (LPU hardware) — ~500 tokens/sec vs ~60 for OpenAI
- Generous free tier — 14,400 requests/day on llama-3.3-70b
- First token latency ~200ms — critical for perceived responsiveness

We use llama-3.3-70b-versatile:
- 128k context window — fits large retrieved contexts
- Strong instruction following — respects citation rules
- Multilingual — handles Malayalam queries
"""
from groq import AsyncGroq
from app.config import settings
from app.services.rag.prompt import build_prompt
from typing import AsyncGenerator
import json

# Singleton client — same pattern as Supabase
_groq_client: AsyncGroq | None = None


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
) -> AsyncGenerator[str, None]:

    client = get_groq_client()
    messages = build_prompt(query, context_string)

    stream = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=1024,
        temperature=0.3,
        stream=True,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta
        if delta.content:
            token = delta.content.replace("\n", "\\n")
            yield f"data: {token}\n\n"

    # Build unified sources payload (RAG + web)
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