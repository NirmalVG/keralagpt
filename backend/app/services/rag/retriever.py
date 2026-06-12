"""
Retriever Service
Converts a user query into a vector and finds the most
semantically similar chunks in the database.

Two-stage process:
  Stage 1 — Embed the query (task_type="search_query")
  Stage 2 — Call match_chunks() SQL function via Supabase RPC
"""
from app.services.ingestion.embedder import embed_single
from app.services.db.supabase_client import get_supabase
from app.services.rag.web_search import needs_web_search, search_web, format_web_results_as_context
from app.services.rag.reranker import rerank_chunks


async def retrieve_chunks(
    query: str,
    domain: str | None = None,
    match_count: int = 20,
    similarity_threshold: float = 0.3,
) -> list[dict]:
    """
    Main retrieval function.
    Returns a ranked list of chunks most relevant to the query.

    Args:
        query              — the user's question
        domain             — optional filter (e.g. "performing-arts")
        match_count        — how many chunks to retrieve before reranking
        similarity_threshold — minimum similarity score to include (0-1)

    Returns list of dicts:
    [
      {
        "id": "uuid",
        "content": "...",
        "similarity": 0.87,
        "document_title": "Kathakali — Classical Dance Drama",
        "domain": "performing-arts",
        "credibility_tier": "curated",
        "section_title": "Makeup and Costume",
      },
      ...
    ]
    """

    # Stage 1: Embed the query
    # CRITICAL: use task_type="search_query" not "search_document"
    # nomic trains these two modes to be compatible but optimized differently
    query_embedding = await embed_single(query, task_type="search_query")

    # Stage 2: Vector search via Supabase RPC
    db = get_supabase()

    result = db.rpc(
        "match_chunks",
        {
            "query_embedding": query_embedding,
            "match_count": match_count,
            "filter_domain": domain,         # None means search all domains
            "similarity_threshold": similarity_threshold,
        },
    ).execute()

    return result.data or []


async def retrieve_with_context(
    query: str,
    domain: str | None = None,
    top_k: int = 5,
) -> dict:
    """
    Two-stage retrieval:
      Stage 1 — bi-encoder cosine search (fast, top-20)
      Stage 2 — cross-encoder rerank     (precise, top-5)
    """

    # Stage 1: Retrieve 20 candidates via bi-encoder
    # We deliberately over-fetch (20 instead of 5) to give
    # the cross-encoder a rich candidate pool to work with.
    candidates = await retrieve_chunks(
        query=query,
        domain=domain,
        match_count=20,
        similarity_threshold=0.3,
    )

    if not candidates:
        return {
            "query":          query,
            "domain":         domain,
            "chunks":         [],
            "context_string": "",
            "sources_count":  0,
        }

    # Stage 2: Cross-encoder rerank — rescores all 20, returns top 5
    # This is where quality jumps significantly.
    top_chunks = await rerank_chunks(
        query=query,
        chunks=candidates,
        top_k=top_k,
    )

    # Build context string for the LLM
    context_parts = []
    for i, chunk in enumerate(top_chunks, 1):
        source_label = f"[Source {i}: {chunk['document_title']}"
        if chunk.get("section_title"):
            source_label += f" — {chunk['section_title']}"
        source_label += f" ({chunk['credibility_tier']})]"

        # Include rerank score in debug metadata (not sent to LLM)
        context_parts.append(f"{source_label}\n{chunk['content']}")

    context_string = "\n\n---\n\n".join(context_parts)

    return {
        "query":          query,
        "domain":         domain,
        "chunks":         top_chunks,
        "context_string": context_string,
        "sources_count":  len(top_chunks),
    }

async def retrieve_hybrid(
    query: str,
    domain: str | None = None,
    top_k: int = 5,
) -> dict:

    # RAG retrieval — now includes cross-encoder reranking
    rag_result = await retrieve_with_context(
        query=query,
        domain=domain,
        top_k=top_k,
    )

    web_results = []
    web_context = ""
    used_web_search = False

    if needs_web_search(query):
        used_web_search = True
        web_results = await search_web(query, max_results=3)
        web_context  = format_web_results_as_context(web_results)

    if web_context and rag_result["context_string"]:
        merged = (
            "## Knowledge Base (Reranked)\n\n"
            + rag_result["context_string"]
            + "\n\n## Current Web Sources\n\n"
            + web_context
        )
    elif web_context:
        merged = "## Current Web Sources\n\n" + web_context
    else:
        merged = rag_result["context_string"]

    return {
        "query":           query,
        "domain":          domain,
        "chunks":          rag_result["chunks"],
        "web_results":     web_results,
        "context_string":  merged,
        "sources_count":   len(rag_result["chunks"]) + len(web_results),
        "used_web_search": used_web_search,
    }