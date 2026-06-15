"""
Ingestion orchestrator.

Pipeline:
  raw text -> chunks -> embeddings -> Supabase document/sections/chunks
"""

from app.services.ingestion.chunker import chunk_text, chunk_by_sections
from app.services.ingestion.embedder import embed_texts
from app.services.db.supabase_client import get_supabase

import json
import os
import time
import re


async def ingest_document(
    title: str,
    content: str,
    domain: str,
    credibility_tier: str,
    author: str | None = None,
    source_url: str | None = None,
    language: str = "en",
    title_ml: str | None = None,
    sections: list[dict] | None = None,
    metadata: dict | None = None,
) -> dict:
    """
    Ingest a single document and return a summary.

    Embeddings are generated before database writes. That keeps failed
    Nomic/network calls from leaving partial documents in Supabase.
    """
    if sections:
        raw_chunks = chunk_by_sections(sections)
    else:
        raw_chunks = chunk_text(content)

    print(f"[ingestor] Created {len(raw_chunks)} chunks")

    texts = [chunk["content"] for chunk in raw_chunks]
    print(f"[ingestor] Embedding {len(texts)} chunks via Nomic...")
    embeddings = await embed_texts(texts, task_type="search_document")
    print("[ingestor] Embeddings received")

    # Attempt to write to Supabase, but gracefully fall back to a local
    # JSON dump when the database host is unreachable (e.g., DNS failures).
    db = get_supabase()

    # Accumulate all chunk rows so we can persist them on fallback.
    rows_all: list[dict] = []

    try:
        doc_result = db.table("documents").insert({
            "title": title,
            "title_ml": title_ml,
            "author": author,
            "source_url": source_url,
            "domain": domain,
            "credibility_tier": credibility_tier,
            "language": language,
            "metadata": metadata or {},
        }).execute()

        document_id = doc_result.data[0]["id"]
        print(f"[ingestor] Document created: {document_id} - '{title}'")

        section_id_map: dict[str, str] = {}

        if sections:
            unique_sections = {c["section_num"]: c["section_title"] for c in raw_chunks}
            for section_num, section_title in unique_sections.items():
                sec_result = db.table("sections").insert({
                    "document_id": document_id,
                    "title": section_title,
                    "section_num": section_num,
                }).execute()
                section_id_map[str(section_num)] = sec_result.data[0]["id"]

        supabase_insert_batch = 50
        total_stored = 0

        for i in range(0, len(raw_chunks), supabase_insert_batch):
            batch = raw_chunks[i : i + supabase_insert_batch]
            batch_embeddings = embeddings[i : i + supabase_insert_batch]

            rows = []
            for chunk, embedding in zip(batch, batch_embeddings):
                section_num = str(chunk.get("section_num", ""))
                rows.append({
                    "document_id": document_id,
                    "section_id": section_id_map.get(section_num),
                    "content": chunk["content"],
                    "embedding": embedding,
                    "chunk_index": chunk["chunk_index"],
                    "token_count": chunk["token_count"],
                    "metadata": {},
                })

            db.table("chunks").insert(rows).execute()
            rows_all.extend(rows)
            total_stored += len(rows)
            print(f"[ingestor] Stored {total_stored}/{len(raw_chunks)} chunks")

    except Exception as e:
        # Likely a network/DNS error when contacting Supabase. Persist a
        # local JSON backup so seeding can continue in offline/dev setups.
        print(f"[ingestor] Supabase write failed, falling back to local file: {e}")

        safe_title = re.sub(r"[^0-9A-Za-z._-]", "_", title)[:120]
        ts = int(time.time())
        backup_dir = os.path.join("scripts", "seed_output")
        os.makedirs(backup_dir, exist_ok=True)
        backup_path = os.path.join(backup_dir, f"{safe_title}_{ts}.json")

        # Prepare a document-shaped backup
        backup = {
            "title": title,
            "domain": domain,
            "credibility_tier": credibility_tier,
            "author": author,
            "source_url": source_url,
            "language": language,
            "metadata": metadata or {},
            "chunks": rows_all or [
                {
                    "content": c["content"],
                    "embedding": emb,
                    "chunk_index": c["chunk_index"],
                    "token_count": c["token_count"],
                }
                for c, emb in zip(raw_chunks, embeddings)
            ],
        }

        with open(backup_path, "w", encoding="utf-8") as f:
            json.dump(backup, f, ensure_ascii=False, indent=2)

        print(f"[ingestor] Wrote local backup: {backup_path}")

        return {
            "document_id": None,
            "title": title,
            "domain": domain,
            "chunks_created": len(raw_chunks),
            "status": "fallback",
        }

    return {
        "document_id": document_id,
        "title": title,
        "domain": domain,
        "chunks_created": len(raw_chunks),
        "status": "success",
    }
