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
    Higher-level retrieval that returns chunks + structured metadata.
    Used directly by the chat endpoint.

    Retrieves match_count=20 candidates, then takes top_k after sorting.
    The reranker (Step 6) will slot in here later between retrieve and top_k.
    """
    candidates = await retrieve_chunks(
        query=query,
        domain=domain,
        match_count=20,
        similarity_threshold=0.3,
    )

    # Sort by similarity descending (Supabase RPC returns sorted, but be explicit)
    candidates.sort(key=lambda x: x["similarity"], reverse=True)

    # Take top_k
    top_chunks = candidates[:top_k]

    # Build structured context string for the LLM (used in Step 5+)
    context_parts = []
    for i, chunk in enumerate(top_chunks, 1):
        source_label = f"[Source {i}: {chunk['document_title']}"
        if chunk.get("section_title"):
            source_label += f" — {chunk['section_title']}"
        source_label += f" ({chunk['credibility_tier']})]"

        context_parts.append(f"{source_label}\n{chunk['content']}")

    context_string = "\n\n---\n\n".join(context_parts)

    return {
        "query": query,
        "domain": domain,
        "chunks": top_chunks,
        "context_string": context_string,      # ready to inject into LLM prompt
        "sources_count": len(top_chunks),
    }