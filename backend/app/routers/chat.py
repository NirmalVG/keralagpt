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
    session_id: str | None = None


@router.post("/")
async def chat(req: ChatRequest):
    """
    Full pipeline:
    1. Process query   → detect language, expand, classify domain
    2. Retrieve        → bi-encoder + cross-encoder rerank + optional web
    3. Generate        → Groq streaming → SSE
    """

    try:
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
                yield "data: [FOLLOWUPS][\"What are the performing arts of Kerala?\",\"Tell me about Kerala's history\",\"What is the significance of Onam?\"]\n[/FOLLOWUPS]\n\n"
                yield "data: [SOURCES][]\n[/SOURCES]\n\n"
                yield "data: [DONE]\n\n"

            return StreamingResponse(convo_stream(), media_type="text/event-stream")

        # ── Stage 2: Hybrid Retrieval (using expanded query) ───────
        retrieval_result = await retrieve_hybrid(
            query=processed["expanded_query"],
            domain=processed["domain"],
            top_k=req.top_k,
        )

        context_string = retrieval_result["context_string"]
        sources        = retrieval_result["chunks"]
        web_results    = retrieval_result["web_results"]

        # ── Stage 3: Handle empty retrieval ────────────────────────
        #    Fallback: use LLM's own knowledge when KB is empty
        if not sources and not web_results:
            fallback_context = (
                "The knowledge base returned no results for this query. "
                "Answer using your general knowledge about Kerala's culture, "
                "history, arts, cuisine, geography, and traditions. "
                "Be factual and specific. Note that this answer is from "
                "general knowledge, not from the curated knowledge base."
            )
            return StreamingResponse(
                stream_answer(
                    query=req.query,
                    context_string=fallback_context,
                    sources=[],
                    web_results=web_results,
                    session_id=req.session_id,
                    domain=processed["domain"],
                ),
                media_type="text/event-stream",
                headers={
                    "Cache-Control":    "no-cache",
                    "X-Accel-Buffering": "no",
                },
            )

        # ── Stage 4: Stream generation ──────────────────────────────
        return StreamingResponse(
            stream_answer(
                query=req.query,
                context_string=context_string,
                sources=sources,
                web_results=web_results,
                session_id=req.session_id,
                domain=processed["domain"],
            ),
            media_type="text/event-stream",
            headers={
                "Cache-Control":    "no-cache",
                "X-Accel-Buffering": "no",
            },
        )

    except Exception as e:
        print(f"[chat] Pipeline error: {e}")
        error_msg = f"Backend connection error: {str(e)[:120]}. Please check your internet connection and try again."

        async def error_stream():
            for word in error_msg.split():
                yield f"data: {word} \n\n"
            yield "data: [FOLLOWUPS][\"What is Kathakali?\",\"Tell me about Kerala's history\",\"What is Onam?\"]\n[/FOLLOWUPS]\n\n"
            yield "data: [SOURCES][]\n[/SOURCES]\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(error_stream(), media_type="text/event-stream")