"""
Wikipedia Fetcher
Pulls article content from Wikipedia using the MediaWiki API.

Why wikipediaapi over the `wikipedia` package:
- Gives us section structure (title + content per section)
- Cleaner text extraction — no markup artifacts
- Explicit language support (en + ml)
- No rate limiting issues

We fetch the full page and split it into sections.
Each section becomes one "section" in our 3-level hierarchy:
  Document = Wikipedia article
  Section  = Wikipedia section (History, Description, etc.)
  Chunk    = 400-token pieces of section text
"""
import wikipediaapi
import time
import re

# User-agent required by Wikipedia's API policy
_wiki_en = wikipediaapi.Wikipedia(
    user_agent="KeralaGPT/1.0 (cultural knowledge platform; contact@weblyr.ai)",
    language="en",
    extract_format=wikipediaapi.ExtractFormat.WIKI,
)

_wiki_ml = wikipediaapi.Wikipedia(
    user_agent="KeralaGPT/1.0 (cultural knowledge platform; contact@weblyr.ai)",
    language="ml",
    extract_format=wikipediaapi.ExtractFormat.WIKI,
)


def fetch_article(title: str, language: str = "en") -> dict | None:
    """
    Fetch a Wikipedia article by title.

    Returns:
    {
        "title":    "Kathakali",
        "url":      "https://en.wikipedia.org/wiki/Kathakali",
        "summary":  "Kathakali is one of...",
        "sections": [
            { "title": "History", "content": "...", "level": 2 },
            { "title": "Costume", "content": "...", "level": 2 },
            ...
        ],
        "full_text": "Complete cleaned article text",
    }
    Returns None if article not found.
    """
    wiki = _wiki_ml if language == "ml" else _wiki_en

    page = wiki.page(title)
    if not page.exists():
        print(f"[wikipedia] Article not found: '{title}'")
        return None

    sections = []
    _extract_sections(page.sections, sections, level=2)

    # Filter out boilerplate sections we don't want
    skip_sections = {
        "see also", "references", "external links", "notes",
        "further reading", "bibliography", "footnotes", "citations",
        "gallery", "sources",
    }
    sections = [
        s for s in sections
        if s["title"].lower() not in skip_sections
        and len(s["content"].strip()) > 100   # skip near-empty sections
    ]

    full_text = clean_wiki_text(page.text)

    return {
        "title":    page.title,
        "url":      page.fullurl,
        "summary":  clean_wiki_text(page.summary),
        "sections": sections,
        "full_text": full_text,
        "word_count": len(full_text.split()),
    }


def _extract_sections(sections, output: list, level: int):
    """Recursively extract sections and subsections."""
    for section in sections:
        content = clean_wiki_text(section.text)
        if content.strip():
            output.append({
                "title":   section.title,
                "content": content,
                "level":   level,
            })
        # Recurse into subsections (level 3, 4...)
        _extract_sections(section.sections, output, level + 1)


def clean_wiki_text(text: str) -> str:
    """
    Clean Wikipedia markup artifacts from extracted text.
    WikipediaAPI's WIKI format is mostly clean but has some residue.
    """
    if not text:
        return ""

    # Remove citation markers like [1], [citation needed], [a]
    text = re.sub(r'\[\d+\]', '', text)
    text = re.sub(r'\[citation needed\]', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\[note \d+\]', '', text, flags=re.IGNORECASE)

    # Remove edit section markers
    text = re.sub(r'\[edit\]', '', text)

    # Normalize whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)

    # Remove lines that are just punctuation or very short (table artifacts)
    lines = text.split('\n')
    lines = [l for l in lines if len(l.strip()) > 15 or l.strip() == '']
    text = '\n'.join(lines)

    return text.strip()


def fetch_with_retry(title: str, language: str = "en", retries: int = 3) -> dict | None:
    """
    Fetch with exponential backoff — Wikipedia occasionally rate limits.
    """
    for attempt in range(retries):
        try:
            result = fetch_article(title, language)
            time.sleep(0.5)   # polite delay between requests
            return result
        except Exception as e:
            wait = 2 ** attempt
            print(f"[wikipedia] Attempt {attempt+1} failed for '{title}': {e}. Retrying in {wait}s...")
            time.sleep(wait)
    print(f"[wikipedia] All retries failed for '{title}'")
    return None