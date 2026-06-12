"""
Reranker Service
Stage 2 of the retrieval pipeline.

Takes the top-20 candidates from bi-encoder retrieval and
rescores each (query, chunk) pair together using a cross-encoder.

Why this matters:
  Bi-encoder: "Kathakali" query → finds chunks with similar embeddings
  Cross-encoder: "What color is Kathakali makeup?" + chunk about makeup
               → understands the question is specifically about COLOR
               → surfaces the most directly answering chunk first

The cross-encoder sees both texts simultaneously, allowing full
attention across the query-document pair. This is the same mechanism
that makes BERT-style models so powerful for QA tasks.
"""
import cohere
from app.config import settings

_client: cohere.Client | None = None


def get_cohere() -> cohere.Client:
    global _client
    if _client is None:
        if not settings.COHERE_API_KEY:
            raise RuntimeError("COHERE_API_KEY must be set in .env")
        _client = cohere.Client(api_key=settings.COHERE_API_KEY)
    return _client


async def rerank_chunks(
    query: str,
    chunks: list[dict],
    top_k: int = 5,
) -> list[dict]:
    """
    Rerank retrieved chunks using Cohere's cross-encoder.

    Args:
        query  — the user's original question
        chunks — list of dicts from retrieve_chunks() (top-20)
        top_k  — how many to return after reranking (typically 5)

    Returns the same chunk dicts, reordered by cross-encoder score,
    with a new 'rerank_score' field added to each.

    Falls back to original bi-encoder order if Cohere call fails.
    """
    if not chunks:
        return []

    # Cohere needs a flat list of document strings
    documents = [c["content"] for c in chunks]

    try:
        client = get_cohere()

        response = client.rerank(
            model="rerank-english-v3.0",
            query=query,
            documents=documents,
            top_n=top_k,
            return_documents=False,  # we already have them, no need to re-send
        )

        # response.results is sorted by relevance (highest first)
        # Each result has: index (into original list), relevance_score
        reranked = []
        for result in response.results:
            chunk = dict(chunks[result.index])             # copy original chunk
            chunk["rerank_score"]      = result.relevance_score
            chunk["original_rank"]     = result.index + 1  # 1-based, for debugging
            reranked.append(chunk)

        return reranked

    except Exception as e:
        # Graceful fallback — if Cohere is down or quota exceeded,
        # return the original bi-encoder ordering truncated to top_k.
        # KeralaGPT still works, just with slightly lower reranking quality.
        print(f"[reranker] Cohere rerank failed, falling back: {e}")
        return chunks[:top_k]