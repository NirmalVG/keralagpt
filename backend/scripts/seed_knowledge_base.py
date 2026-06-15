"""
Knowledge Base Seeder
Ingests Wikipedia articles for all 8 KeralaGPT domains.

Usage:
    python scripts/seed_knowledge_base.py              # all domains
    python scripts/seed_knowledge_base.py --domain festivals
    python scripts/seed_knowledge_base.py --limit 5   # first 5 articles only

Progress is saved to scripts/seed_progress.json so the script
can be resumed if interrupted.
"""
import asyncio
import json
import argparse
import sys
import os

sys.path.append(".")
from dotenv import load_dotenv
load_dotenv()

from app.services.ingestion.wikipedia_fetcher import fetch_with_retry
from app.services.ingestion.ingestor          import ingest_document
from app.domains import normalize_domain

# ── Article manifest ────────────────────────────────────────────
WIKIPEDIA_ARTICLES = {
    "performing-arts": [
        "Kathakali", "Theyyam", "Mohiniyattam", "Koodiyattam",
        "Ottamthullal", "Krishnanattam", "Thiruvathirakali", "Padayani",
    ],
    "history": [
        "History of Kerala", "Chera dynasty", "Zamorin of Calicut",
        "Kingdom of Travancore", "Muziris", "Cochin State", "Malabar Coast",
    ],
    "literature": [
        "Malayalam literature", "Kumaran Asan", "Vallathol Narayana Menon",
        "G. Sankara Kurup", "Vaikom Muhammad Basheer", "M. T. Vasudevan Nair",
    ],
    "temple-arch": [
        "Padmanabhaswamy Temple", "Guruvayur Temple", "Kerala architecture",
        "Koothambalam", "Vadakkunnathan Temple",
    ],
    "festivals": [
        "Onam", "Vishu", "Thrissur Pooram", "Attukal Pongala",
        "Sabarimala", "Nehru Trophy Boat Race",
    ],
    "cuisine": [
        "Kerala cuisine", "Sadya", "Appam", "Puttu", "Karimeen", "Payasam",
    ],
    "cinema": [
        "Malayalam cinema", "Adoor Gopalakrishnan", "Shaji N. Karun",
        "K. J. Yesudas", "Mammootty", "Mohanlal",
    ],
    "geography": [
        "Kerala", "Western Ghats", "Backwaters of Kerala",
        "Vembanad Lake", "Silent Valley National Park", "Periyar River",
    ],
}

CREDIBILITY_MAP = {
    "history":      "academic",
    "literature":   "academic",
    "performing-arts":  "curated",
    "temple-arch": "official",
    "festivals":    "official",
    "cuisine":      "curated",
    "cinema":       "curated",
    "geography":    "official",
}

PROGRESS_FILE = "scripts/seed_progress.json"


def load_progress() -> set:
    """Load set of already-ingested article titles."""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            data = json.load(f)
            return set(data.get("completed", []))
    return set()


def save_progress(completed: set):
    """Persist completed articles so we can resume if interrupted."""
    os.makedirs("scripts", exist_ok=True)
    with open(PROGRESS_FILE, "w") as f:
        json.dump({"completed": list(completed)}, f, indent=2)


async def ingest_wikipedia_article(
    title: str,
    domain: str,
    credibility_tier: str,
) -> dict | None:
    """
    Fetch a Wikipedia article and ingest it into the knowledge base.
    Uses section structure when available for richer hierarchy.
    """
    print(f"\n  Fetching: '{title}'...")
    article = fetch_with_retry(title)

    if not article:
        return None

    word_count = article["word_count"]
    section_count = len(article["sections"])
    print(f"  Found: {word_count} words, {section_count} sections")

    if article["sections"]:
        # Use section structure for richer hierarchy
        result = await ingest_document(
            title=article["title"],
            content=article["full_text"],
            domain=domain,
            credibility_tier=credibility_tier,
            source_url=article["url"],
            language="en",
            metadata={
                "source":      "wikipedia",
                "word_count":  word_count,
                "summary":     article["summary"][:500],
            },
            sections=[
                {
                    "title":       s["title"],
                    "content":     s["content"],
                    "section_num": i + 1,
                }
                for i, s in enumerate(article["sections"])
            ],
        )
    else:
        # No sections — ingest as flat document
        result = await ingest_document(
            title=article["title"],
            content=article["full_text"],
            domain=domain,
            credibility_tier=credibility_tier,
            source_url=article["url"],
            language="en",
            metadata={"source": "wikipedia", "word_count": word_count},
        )

    return result


async def main(target_domain: str | None = None, limit: int | None = None):
    completed = load_progress()

    # Stats tracking
    total_docs   = 0
    total_chunks = 0
    failed       = []

    domains_to_process = (
        {target_domain: WIKIPEDIA_ARTICLES[target_domain]}
        if target_domain
        else WIKIPEDIA_ARTICLES
    )

    print("\n" + "═" * 55)
    print("  KeralaGPT — Knowledge Base Seeder")
    print("═" * 55)
    print(f"  Already completed: {len(completed)} articles")
    print(f"  Target domains:    {list(domains_to_process.keys())}")
    if limit:
        print(f"  Article limit:     {limit}")
    print("═" * 55 + "\n")

    processed_count = 0

    for domain, articles in domains_to_process.items():
        tier = CREDIBILITY_MAP[domain]
        print(f"\n▶ Domain: {domain.upper()} ({tier})")
        print(f"  Articles: {len(articles)}")

        for title in articles:
            if limit and processed_count >= limit:
                print(f"\n  Limit of {limit} reached. Stopping.")
                break

            if title in completed:
                print(f"  ✓ Skip (already done): {title}")
                continue

            try:
                processed_count += 1
                result = await ingest_wikipedia_article(title, domain, tier)

                if result:
                    chunks_n = result["chunks_created"]
                    print(f"  ✓ Ingested: {title} → {chunks_n} chunks")
                    total_docs   += 1
                    total_chunks += chunks_n
                    completed.add(title)
                    save_progress(completed)
                else:
                    print(f"  ✗ Failed:   {title} (article not found)")
                    failed.append(title)

            except Exception as e:
                print(f"  ✗ Error:    {title} → {e}")
                failed.append(title)
                # Don't stop — continue with next article
                continue

    # ── Final report ────────────────────────────────────────────
    print("\n" + "═" * 55)
    print("  SEED COMPLETE")
    print("═" * 55)
    print(f"  Documents ingested: {total_docs}")
    print(f"  Chunks created:     {total_chunks}")
    print(f"  Failed articles:    {len(failed)}")
    if failed:
        print(f"  Failed:             {failed}")
    print(f"  Total completed:    {len(completed)}")
    print("═" * 55 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="KeralaGPT Knowledge Base Seeder")
    parser.add_argument("--domain", type=str, help="Seed a single domain only")
    parser.add_argument("--limit",  type=int, help="Max articles to process")
    args = parser.parse_args()

    if args.domain:
        args.domain = normalize_domain(args.domain)

    if args.domain and args.domain not in WIKIPEDIA_ARTICLES:
        print(f"Unknown domain '{args.domain}'. Choose from: {list(WIKIPEDIA_ARTICLES.keys())}")
        sys.exit(1)

    asyncio.run(main(target_domain=args.domain, limit=args.limit))
