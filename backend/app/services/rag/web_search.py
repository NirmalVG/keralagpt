"""
Web Search Service
Fetches current information from the web for time-sensitive queries.
Uses Tavily — an AI-optimized search API that returns clean, 
pre-extracted content (no HTML parsing needed).

When to use:
  - Queries about recent events, releases, current news
  - Queries with temporal signals: "latest", "recent", "2024", "now", "upcoming"
  - Queries about living people's current status
  - Queries RAG returns low-confidence results for

When NOT to use:
  - Historical/cultural queries well-covered by the knowledge base
  - Queries with no temporal dimension
"""
from tavily import TavilyClient
from app.config import settings

_client: TavilyClient | None = None


def get_tavily() -> TavilyClient:
    global _client
    if _client is None:
        if not settings.TAVILY_API_KEY:
            raise RuntimeError("TAVILY_API_KEY must be set in .env")
        _client = TavilyClient(api_key=settings.TAVILY_API_KEY)
    return _client


# Temporal signals that suggest a query needs current information
TEMPORAL_SIGNALS = [
    "latest", "recent", "current", "now", "today", "this year",
    "2024", "2025", "upcoming", "new", "just released", "recently",
    "this month", "last month", "announced", "release date",
    "box office", "award", "won", "winner", "ott", "streaming",
]


def needs_web_search(query: str) -> bool:
    """
    Heuristic classifier — detects if a query needs current web data.
    Returns True if any temporal signal is found in the query.
    
    This is intentionally simple. A more sophisticated version
    (Step 7) will use an LLM classifier for better accuracy.
    """
    query_lower = query.lower()
    return any(signal in query_lower for signal in TEMPORAL_SIGNALS)


async def search_web(query: str, max_results: int = 5) -> list[dict]:
    """
    Search the web and return cleaned results.
    
    Tavily returns:
    [
      {
        "title": "...",
        "url": "...",
        "content": "...",   ← pre-extracted clean text, no HTML
        "score": 0.87,
      },
      ...
    ]
    
    We add a credibility_tier based on the domain.
    """
    client = get_tavily()

    # Kerala-focused search query
    kerala_query = f"{query} Kerala"

    response = client.search(
        query=kerala_query,
        max_results=max_results,
        search_depth="advanced",   # deeper search, more relevant results
        include_answer=False,      # we want raw results, not Tavily's summary
    )

    results = response.get("results", [])

    # Enrich with credibility signals
    enriched = []
    for r in results:
        url = r.get("url", "")
        enriched.append({
            "title": r.get("title", ""),
            "url": url,
            "content": r.get("content", ""),
            "score": r.get("score", 0),
            "credibility_tier": _infer_credibility(url),
            "source_type": "web",
        })

    return enriched


def _infer_credibility(url: str) -> str:
    """
    Simple URL-based credibility inference.
    Not perfect, but good enough for source labeling.
    """
    url_lower = url.lower()

    official_domains = [
        "kerala.gov.in", "keralatourism.org", "sangeetanatak.gov.in",
        "indiaculture.gov.in", "thehindu.com", "mathrubhumi.com",
        "manoramaonline.com", "deccanherald.com"
    ]
    academic_domains = [
        "jstor.org", "academia.edu", "researchgate.net",
        "shodhganga.inflibnet.ac.in", ".edu", ".ac.in"
    ]

    if any(d in url_lower for d in official_domains):
        return "official"
    if any(d in url_lower for d in academic_domains):
        return "academic"
    return "curated"


def format_web_results_as_context(results: list[dict]) -> str:
    """
    Formats web search results into the same [Source N: ...] format
    as RAG chunks so the LLM prompt stays consistent.
    """
    parts = []
    for i, r in enumerate(results, 1):
        label = f"[Web Source {i}: {r['title']} ({r['credibility_tier']}) — {r['url']}]"
        parts.append(f"{label}\n{r['content']}")
    return "\n\n---\n\n".join(parts)