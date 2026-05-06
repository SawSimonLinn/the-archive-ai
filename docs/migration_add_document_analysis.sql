-- Run this in Supabase > SQL Editor before deploying this feature.
-- Persists upload-time summaries so refreshes and new tabs reuse the same analysis.

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS suggested_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS analysis_generated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS documents_analysis_generated_at_idx
  ON documents (analysis_generated_at);
