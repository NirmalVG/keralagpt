-- ============================================================
-- KeralaGPT — Fix Script
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create conversations table (was missing)
CREATE TABLE IF NOT EXISTS conversations (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id      TEXT NOT NULL,
  query           TEXT NOT NULL,
  response        TEXT,
  domain          TEXT,
  sources         JSONB DEFAULT '[]',
  feedback_score  INT DEFAULT 0,
  report_text     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at DESC);

-- 2. Add section_title to chunks if missing
ALTER TABLE chunks ADD COLUMN IF NOT EXISTS section_title TEXT;

-- 3. Drop old match_chunks and recreate
DROP FUNCTION IF EXISTS match_chunks(vector, integer, text, double precision);

CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(768),
  match_count INT DEFAULT 10,
  filter_domain TEXT DEFAULT NULL,
  similarity_threshold FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  id              UUID,
  document_id     UUID,
  content         TEXT,
  section_title   TEXT,
  chunk_index     INT,
  metadata        JSONB,
  similarity      FLOAT,
  document_title  TEXT,
  domain          TEXT,
  credibility_tier TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.document_id,
    c.content,
    c.section_title,
    c.chunk_index,
    c.metadata,
    (1 - (c.embedding <=> query_embedding))::FLOAT AS similarity,
    d.title AS document_title,
    d.domain,
    d.credibility_tier
  FROM chunks c
  JOIN documents d ON d.id = c.document_id
  WHERE
    c.embedding IS NOT NULL
    AND (1 - (c.embedding <=> query_embedding)) > similarity_threshold
    AND (filter_domain IS NULL OR d.domain = filter_domain)
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. Reload PostgREST schema cache so new tables/functions are visible
NOTIFY pgrst, 'reload schema';
