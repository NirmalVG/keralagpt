"""
Query Processor
Runs before retrieval on every user query. Does three things:

  1. Language Detection   — is this English or Malayalam?
  2. Query Expansion      — rewrites short queries into retrieval-rich form
  3. Domain Classification — which of the 8 domains does this belong to?

Uses a single Groq LLM call with a structured JSON output prompt.
Falls back to safe defaults if the LLM call fails — system never breaks.

Design principle: The processor improves quality but is never a
hard dependency. A failure returns the original query untouched.
"""
import json
import re
from groq import AsyncGroq
from app.services.rag.generator import get_groq_client
from app.domains import VALID_DOMAINS, normalize_domain

PROCESSOR_SYSTEM_PROMPT = """You are a query analysis engine for KeralaGPT, 
a Kerala cultural knowledge system.

Given a user query, return ONLY a JSON object with these exact fields:

{
  "language": "en" or "ml" (detected language of the input),
  "english_query": "the query translated to English if it was Malayalam, 
                    or the original if already English",
  "expanded_query": "a richer, more detailed version of the query for 
                     semantic search — add relevant Kerala cultural context, 
                     related terms, and specifics the user implied but didn't 
                     state. 2-3 sentences max.",
  "domain": one of: performing-arts | literature | history | temple-arch |
             festivals | cuisine | cinema | geography | null,
             (null if the query spans multiple domains or is unclear)
  "domain_confidence": float 0.0-1.0 (how confident you are in the domain),
  "is_conversational": true/false (is this a greeting/small talk, not a knowledge query?),
  "intent": "factual" | "explanatory" | "comparative" | "historical" | "current"
}

Rules:
- expanded_query must be in English regardless of input language
- For very specific queries (e.g. "What is Kathakali?") expand with related terms
- For broad queries (e.g. "Kerala culture") keep domain as null
- For greetings/small talk set is_conversational to true
- Return ONLY valid JSON, no markdown, no explanation, no preamble"""


async def process_query(
    query: str,
    active_domain: str | None = None,
) -> dict:
    """
    Main query processing function.

    Args:
        query         — raw user input
        active_domain — domain the user has selected in the UI (if any)

    Returns a processed query dict:
    {
        "original":          "കഥകളി",
        "language":          "ml",
        "english_query":     "Kathakali",
        "expanded_query":    "What is Kathakali dance drama? Explain its 
                              history, costume makeup and performance style 
                              in Kerala",
        "domain":            "performing-arts",
        "domain_confidence": 0.96,
        "is_conversational": False,
        "intent":            "explanatory",
    }
    """
    # Fast-path: if query is very short (1-2 words), always expand
    # If active_domain is set by user, trust it over classifier
    try:
        client = get_groq_client()

        response = await client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": PROCESSOR_SYSTEM_PROMPT},
                {"role": "user",   "content": f"Query: {query}"},
            ],
            max_tokens=300,
            temperature=0.1,   # near-deterministic for structured output
        )

        raw = response.choices[0].message.content.strip()

        # Strip markdown fences if model adds them despite instructions
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "",          raw)

        result = json.loads(raw)

        # Validate and sanitize fields
        language    = result.get("language", "en")
        english_q   = result.get("english_query",     query)
        expanded_q  = result.get("expanded_query",    query)
        domain      = result.get("domain",            None)
        confidence  = float(result.get("domain_confidence", 0.0))
        is_convo    = bool(result.get("is_conversational", False))
        intent      = result.get("intent", "factual")

        # User-selected domain always overrides classifier
        if active_domain:
            domain     = normalize_domain(active_domain)
            confidence = 1.0
        else:
            domain = normalize_domain(domain)

        # Reject low-confidence domain classifications
        if confidence < 0.65:
            domain = None

        # Validate domain is one we know
        if domain and domain not in VALID_DOMAINS:
            domain = None

        return {
            "original":          query,
            "language":          language,
            "english_query":     english_q,
            "expanded_query":    expanded_q,
            "domain":            domain,
            "domain_confidence": confidence,
            "is_conversational": is_convo,
            "intent":            intent,
        }

    except Exception as e:
        # Graceful fallback — return safe defaults
        print(f"[query_processor] Failed, using defaults: {e}")
        return {
            "original":          query,
            "language":          "en",
            "english_query":     query,
            "expanded_query":    query,
            "domain":            normalize_domain(active_domain),
            "domain_confidence": 1.0 if active_domain else 0.0,
            "is_conversational": False,
            "intent":            "factual",
        }


def build_conversational_response(query: str) -> str:
    """
    For greetings and small talk — returns a warm response
    without triggering the full RAG pipeline.
    Saves API calls and feels more natural.
    """
    query_lower = query.lower().strip()

    greetings = ["hi", "hello", "hey", "namaste", "namaskar", "നമസ്കാരം"]
    if any(g in query_lower for g in greetings):
        return (
            "നമസ്കാരം! Hello! I'm Samskriti, your guide to Kerala's "
            "rich cultural heritage. Ask me anything about Kerala's "
            "performing arts, history, festivals, literature, cuisine, "
            "architecture, cinema, or geography."
        )

    thanks = ["thank", "thanks", "നന്ദി"]
    if any(t in query_lower for t in thanks):
        return (
            "My pleasure! Kerala's culture has so many more layers to "
            "explore. Feel free to ask anything else."
        )

    return (
        "I'm Samskriti — a cultural intelligence system for Kerala. "
        "Ask me about Kerala's arts, history, festivals, and more."
    )
