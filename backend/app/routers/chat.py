"""
Chat Router — with Query Processor integrated
"""
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.rag.query_processor import process_query, build_conversational_response
from app.services.rag.retriever       import retrieve_hybrid
from app.services.rag.generator       import stream_answer
import json

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    query:  str
    domain: str | None = None
    top_k:  int        = 5


@router.post("/")
async def chat(req: ChatRequest):
    """
    Full pipeline:
    1. Process query   → detect language, expand, classify domain
    2. Retrieve        → bi-encoder + cross-encoder rerank + optional web
    3. Generate        → Groq streaming → SSE
    """

    # ── Stage 1: Query Processing ──────────────────────────────
    processed = await process_query(
        query=req.query,
        active_domain=req.domain,
    )

    # Handle conversational queries without touching RAG
    if processed["is_conversational"]:
        response_text = build_conversational_response(req.query)

        async def convo_stream():
            # Stream the conversational response token by token
            words = response_text.split(" ")
            for i, word in enumerate(words):
                token = word if i == 0 else " " + word
                yield f"data: {token}\n\n"
            yield "data: [SOURCES][][/SOURCES]\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(convo_stream(), media_type="text/event-stream")

    # ── Stage 2: Hybrid Retrieval (using expanded query) ───────
    # KEY DECISION: we retrieve using expanded_query (richer signal)
    # but we respond to the original query (user's actual words)
    retrieval_result = await retrieve_hybrid(
        query=processed["expanded_query"],   # expanded for retrieval
        domain=processed["domain"],          # auto-classified or user-selected
        top_k=req.top_k,
    )

    context_string = retrieval_result["context_string"]
    sources        = retrieval_result["chunks"]
    web_results    = retrieval_result["web_results"]

    # ── Stage 3: Handle empty retrieval ────────────────────────
    if not sources and not web_results:
        async def empty_stream():
            msg = (
                "I don't have enough information about this topic in my "
                "current knowledge base. Try asking about Kerala's performing "
                "arts, history, festivals, literature, cuisine, or cinema."
            )
            for word in msg.split():
                yield f"data: {word} \n\n"
            yield "data: [SOURCES][][/SOURCES]\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(empty_stream(), media_type="text/event-stream")

    # ── Stage 4: Stream generation ──────────────────────────────
    # Pass original query to LLM (respond in user's language/style)
    # but the context was retrieved using the expanded query
    return StreamingResponse(
        stream_answer(
            query=req.query,        # original — LLM responds to this
            context_string=context_string,
            sources=sources,
            web_results=web_results,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control":    "no-cache",
            "X-Accel-Buffering": "no",
        },
    )