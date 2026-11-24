-- Enable pgvector for future knowledge-base embeddings.
-- This does not create tables, columns, or indexes.
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
