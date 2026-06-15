"""
Embedder Service
Calls nomic-embed-text-v1.5 API to generate 768-dim vectors.

Key design decisions:
- Batch API calls: nomic allows up to 100 texts per request.
  Batching reduces API calls from N to N/100.
- task_type="search_document": tells nomic this text is a DB document.
  Use "search_query" when embedding user queries at retrieval time.
  This asymmetry improves retrieval accuracy.
"""
import httpx
from app.config import settings

NOMIC_EMBED_URL = "https://api-atlas.nomic.ai/v1/embedding/text"
EMBED_MODEL = "nomic-embed-text-v1.5"
BATCH_SIZE = 100  # nomic's max per request


async def embed_texts(texts: list[str], task_type: str = "search_document") -> list[list[float]]:
    """
    Embed a list of texts. Returns a list of 768-dim float vectors.
    Automatically batches if len(texts) > BATCH_SIZE.
    
    task_type:
      "search_document" → for chunks being stored in the DB
      "search_query"    → for user queries at retrieval time
    """
    if not texts:
        return []
    if not settings.NOMIC_API_KEY:
        raise RuntimeError("NOMIC_API_KEY must be set in backend/.env before generating embeddings")

    all_embeddings = []

    # Process in batches
    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        tried_urls = [settings.NOMIC_EMBED_URL, "https://api.nomic.ai/v1/embedding/text"]
        last_exc: Exception | None = None

        async with httpx.AsyncClient(timeout=30.0, trust_env=True) as client:
            for url in tried_urls:
                try:
                    response = await client.post(
                        url,
                        headers={
                            "Authorization": f"Bearer {settings.NOMIC_API_KEY}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "model": EMBED_MODEL,
                            "texts": batch,
                            "task_type": task_type,
                        },
                    )
                except (httpx.ConnectError, httpx.NetworkError, httpx.RequestError) as exc:
                    last_exc = exc
                    print(f"[embedder] Nomic request failed for {url}: {exc}")
                    continue
                except httpx.TimeoutException as exc:
                    raise RuntimeError("Timed out while calling Nomic embeddings API") from exc

                if response.status_code != 200:
                    raise RuntimeError(
                        f"Nomic API error {response.status_code}: {response.text}"
                    )

                data = response.json()
                # nomic returns: { "embeddings": [[...], [...], ...] }
                all_embeddings.extend(data["embeddings"])
                break
            else:
                api_hosts = ", ".join(tried_urls)
                raise RuntimeError(
                    "Could not connect to Nomic embeddings API. Check DNS/internet access "
                    f"for one of: {api_hosts}. Last error: {last_exc}"
                ) from last_exc

    return all_embeddings


async def embed_single(text: str, task_type: str = "search_document") -> list[float]:
    """Convenience wrapper for embedding a single string."""
    results = await embed_texts([text], task_type=task_type)
    return results[0]
