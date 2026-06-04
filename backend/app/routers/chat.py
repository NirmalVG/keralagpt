from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.rag.retriever import retrieve_hybrid
from app.services.rag.generator import stream_answer

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    query: str
    domain: str | None = None
    top_k: int = 5


@router.post("/")
async def chat(req: ChatRequest):
    # Hybrid retrieval — uses web search automatically when needed
    retrieval_result = await retrieve_hybrid(
        query=req.query,
        domain=req.domain,
        top_k=req.top_k,
    )

    context_string = retrieval_result["context_string"]
    sources = retrieval_result["chunks"]
    web_results = retrieval_result["web_results"]

    if not sources and not web_results:
        async def empty_stream():
            yield "data: I don't have information about this topic yet.\\n\n"
            yield "data: [SOURCES][][/SOURCES]\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(empty_stream(), media_type="text/event-stream")

    return StreamingResponse(
        stream_answer(
            query=req.query,
            context_string=context_string,
            sources=sources,
            web_results=web_results,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )