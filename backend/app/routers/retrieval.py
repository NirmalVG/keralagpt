"""
Retrieval Router
Exposes the retrieval pipeline as an HTTP endpoint.
Useful for testing retrieval quality independently of the LLM.
"""
from fastapi import APIRouter, Query
from app.services.rag.retriever import retrieve_with_context
from app.services.db.supabase_client import get_supabase

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