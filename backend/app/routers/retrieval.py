"""
Retrieval Router
Exposes the retrieval pipeline as an HTTP endpoint.
Useful for testing retrieval quality independently of the LLM.
"""
from fastapi import APIRouter, Query
from app.services.rag.retriever import retrieve_chunks, retrieve_with_context
from app.services.db.supabase_client import get_supabase
from app.services.rag.reranker import rerank_chunks
from app.services.rag.query_processor import process_query

router = APIRouter(prefix="/retrieve", tags=["retrieval"])


@router.get("/")
async def retrieve(
    query: str = Query(..., description="User's question"),
    domain: str | None = Query(None, description="Optional domain filter"),
    top_k: int = Query(5, ge=1, le=20, description="Number of chunks to return"),
):
    """
    Test endpoint — retrieve relevant chunks for a query.
    Use this to verify retrieval quality before the LLM is connected.
    """
    result = await retrieve_with_context(
        query=query,
        domain=domain,
        top_k=top_k,
    )
    return result

@router.get("/stats")
async def retrieval_stats():
    """
    Shows how many documents and chunks are in the knowledge base,
    broken down by domain. Use to verify ingestion worked.
    """
    db = get_supabase()

    docs = db.table("documents").select("domain").execute()
    chunks = db.table("chunks").select("document_id").execute()

    # Count by domain
    domain_counts: dict[str, int] = {}
    for doc in docs.data:
        d = doc["domain"]
        domain_counts[d] = domain_counts.get(d, 0) + 1

    return {
        "total_documents": len(docs.data),
        "total_chunks": len(chunks.data),
        "documents_by_domain": domain_counts,
    }

@router.get("/rerank-debug")
async def rerank_debug(
    query: str = Query(..., description="Query to test"),
    domain: str | None = Query(None),
):
    """
    Shows bi-encoder ranking vs cross-encoder ranking side by side.
    Use this to verify reranking is actually improving result order.
    """
    # Get raw bi-encoder results
    raw = await retrieve_chunks(
        query=query,
        domain=domain,
        match_count=10,
        similarity_threshold=0.2,
    )

    # Rerank them
    reranked = await rerank_chunks(query=query, chunks=raw, top_k=5)

    return {
        "query": query,
        "bi_encoder_top5": [
            {
                "rank":       i + 1,
                "title":      c["document_title"],
                "similarity": round(c["similarity"], 3),
                "snippet":    c["content"][:120] + "...",
            }
            for i, c in enumerate(raw[:5])
        ],
        "reranker_top5": [
            {
                "rank":          i + 1,
                "original_rank": c.get("original_rank", "?"),
                "title":         c["document_title"],
                "rerank_score":  round(c.get("rerank_score", 0), 4),
                "bi_sim":        round(c["similarity"], 3),
                "snippet":       c["content"][:120] + "...",
            }
            for i, c in enumerate(reranked)
        ],
    }

@router.get("/process-query")
async def process_query_endpoint(
    query: str = Query(...),
    domain: str | None = Query(None),
):
    """
    Test the query processor in isolation.
    Shows what expansion and classification it produces.
    """
    result = await process_query(query=query, active_domain=domain)
    return result
