-- ============================================================
-- KeralaGPT — Supabase Database Setup
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Enable pgvector extension (for vector similarity search)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Documents table (parent records)
CREATE TABLE IF NOT EXISTS documents (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  title_ml      TEXT,
  domain        TEXT NOT NULL,
  author        TEXT,
  source_url    TEXT,
  language      TEXT DEFAULT 'en',
  credibility_tier TEXT DEFAULT 'community',
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 3. Chunks table (text chunks with vector embeddings)
CREATE TABLE IF NOT EXISTS chunks (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id   UUID REFERENCES documents(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  section_title TEXT,
  chunk_index   INT DEFAULT 0,
  embedding     vector(768),
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 4. Conversations table (chat history + feedback)
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

-- If conversations table already exists, add feedback columns
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS feedback_score INT DEFAULT 0;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS report_text TEXT;

-- 5. Contributions table (community knowledge submissions)
CREATE TABLE IF NOT EXISTS contributions (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title                   TEXT NOT NULL,
  domain                  TEXT NOT NULL,
  content                 TEXT NOT NULL,
  source_url              TEXT,
  contributor_name        TEXT,
  contributor_credentials TEXT,
  status                  TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at             TIMESTAMPTZ,
  submitted_at            TIMESTAMPTZ DEFAULT now()
);

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_documents_domain ON documents(domain);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);

-- 7. IVFFlat index for vector search (only if chunks have data)
-- Note: IVFFlat requires existing data to build lists. If table is empty,
-- use HNSW instead or create IVFFlat after ingesting data.
-- For now, use exact search (no index needed for small datasets).

-- ============================================================
-- 8. match_chunks RPC function (vector similarity search)
-- This is the critical function called by the retriever
-- ============================================================
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
