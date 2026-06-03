"""
Ingestion Orchestrator
Coordinates the full pipeline:
  raw text → chunks → embeddings → Supabase

This is called from the ingestion API route or the CLI script.
"""
from app.services.ingestion.chunker import chunk_text, chunk_by_sections
from app.services.ingestion.embedder import embed_texts
from app.services.db.supabase_client import get_supabase
import asyncio


async def ingest_document(
    title: str,
    content: str,
    domain: str,
    credibility_tier: str,
    author: str | None = None,
    source_url: str | None = None,
    language: str = "en",
    title_ml: str | None = None,
    sections: list[dict] | None = None,  # optional pre-divided sections
    metadata: dict | None = None,
) -> dict:
    """
    Full ingestion pipeline for a single document.
    Returns a summary of what was stored.
    """
    db = get_supabase()

    # ── STAGE 1: Insert the Document record ──────────────────────────────
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
    print(f"[ingestor] Document created: {document_id} — '{title}'")

    # ── STAGE 2: Create chunks ────────────────────────────────────────────
    if sections:
        # Document has explicit sections (chapter structure)
        raw_chunks = chunk_by_sections(sections)
    else:
        # Plain text — chunk directly
        raw_chunks = chunk_text(content)

    print(f"[ingestor] Created {len(raw_chunks)} chunks")

    # ── STAGE 3: Insert sections (if provided) ────────────────────────────
    section_id_map: dict[str, str] = {}  # section_num → section_id

    if sections:
        unique_sections = {c["section_num"]: c["section_title"] for c in raw_chunks}
        for section_num, section_title in unique_sections.items():
            sec_result = db.table("sections").insert({
                "document_id": document_id,
                "title": section_title,
                "section_num": section_num,
            }).execute()
            section_id_map[str(section_num)] = sec_result.data[0]["id"]

    # ── STAGE 4: Embed all chunks in one batched API call ─────────────────
    texts = [c["content"] for c in raw_chunks]
    print(f"[ingestor] Embedding {len(texts)} chunks via nomic...")
    embeddings = await embed_texts(texts, task_type="search_document")
    print(f"[ingestor] Embeddings received")

    # ── STAGE 5: Store chunks + embeddings ───────────────────────────────
    # Supabase has a row limit per insert — batch in groups of 50
    SUPABASE_INSERT_BATCH = 50
    total_stored = 0

    for i in range(0, len(raw_chunks), SUPABASE_INSERT_BATCH):
        batch = raw_chunks[i : i + SUPABASE_INSERT_BATCH]
        batch_embeddings = embeddings[i : i + SUPABASE_INSERT_BATCH]

        rows = []
        for chunk, embedding in zip(batch, batch_embeddings):
            section_num = str(chunk.get("section_num", ""))
            rows.append({
                "document_id": document_id,
                "section_id": section_id_map.get(section_num),
                "content": chunk["content"],
                "embedding": embedding,  # list of 768 floats
                "chunk_index": chunk["chunk_index"],
                "token_count": chunk["token_count"],
                "metadata": {},
            })

        db.table("chunks").insert(rows).execute()
        total_stored += len(rows)
        print(f"[ingestor] Stored {total_stored}/{len(raw_chunks)} chunks")

    return {
        "document_id": document_id,
        "title": title,
        "domain": domain,
        "chunks_created": len(raw_chunks),
        "status": "success",
    }