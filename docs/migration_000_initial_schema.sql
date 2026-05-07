-- Run this first in a fresh Supabase project.
-- It creates the database, storage, RLS, and vector-search primitives expected
-- by the Next.js app.

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

SET search_path = public, storage, extensions;

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  size BIGINT NOT NULL DEFAULT 0 CHECK (size >= 0),
  storage_path TEXT UNIQUE,
  summary TEXT,
  suggested_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  analysis_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS documents_user_id_idx
  ON public.documents (user_id);

CREATE INDEX IF NOT EXISTS documents_user_created_at_idx
  ON public.documents (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS documents_analysis_generated_at_idx
  ON public.documents (analysis_generated_at);

CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  source_document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_session_created_at_idx
  ON public.chat_messages (session_id, created_at);

CREATE INDEX IF NOT EXISTS chat_messages_source_document_created_at_idx
  ON public.chat_messages (source_document_id, created_at);

CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx
  ON public.chat_messages (user_id);

CREATE INDEX IF NOT EXISTS chat_messages_user_role_created_at_idx
  ON public.chat_messages (user_id, role, created_at);

CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx
  ON public.document_chunks (document_id);

CREATE INDEX IF NOT EXISTS document_chunks_document_chunk_index_idx
  ON public.document_chunks (document_id, chunk_index);

CREATE INDEX IF NOT EXISTS document_chunks_embedding_hnsw_idx
  ON public.document_chunks
  USING hnsw (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_id TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_subscriptions_user_id_idx
  ON public.user_subscriptions (user_id);

CREATE INDEX IF NOT EXISTS user_subscriptions_stripe_customer_id_idx
  ON public.user_subscriptions (stripe_customer_id);

CREATE INDEX IF NOT EXISTS user_subscriptions_stripe_subscription_id_idx
  ON public.user_subscriptions (stripe_subscription_id);

CREATE OR REPLACE FUNCTION public.match_document_chunks(
  query_embedding vector(1536),
  match_document_id UUID,
  match_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  chunk_index INTEGER,
  similarity DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
  SELECT
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.content,
    document_chunks.chunk_index,
    1 - (document_chunks.embedding <=> query_embedding) AS similarity
  FROM public.document_chunks
  WHERE document_chunks.document_id = match_document_id
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT LEAST(GREATEST(COALESCE(match_count, 5), 1), 50);
$$;

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documents_owner" ON public.documents;
CREATE POLICY "documents_owner" ON public.documents
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_messages_owner" ON public.chat_messages;
CREATE POLICY "chat_messages_owner" ON public.chat_messages
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id
    AND source_document_id IN (
      SELECT id FROM public.documents WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND source_document_id IN (
      SELECT id FROM public.documents WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "document_chunks_owner" ON public.document_chunks;
CREATE POLICY "document_chunks_owner" ON public.document_chunks
  FOR ALL
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM public.documents WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    document_id IN (
      SELECT id FROM public.documents WHERE user_id = auth.uid()
    )
  );

-- No direct client policies for chat_sessions. Service-role routes create and
-- read sessions, while user-visible messages are constrained through documents.

DROP POLICY IF EXISTS "subscriptions_read_own" ON public.user_subscriptions;
CREATE POLICY "subscriptions_read_own" ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'documents',
  'documents',
  false,
  20971520,
  ARRAY[
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "documents_storage_select_own" ON storage.objects;
CREATE POLICY "documents_storage_select_own" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "documents_storage_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "documents_storage_update_own" ON storage.objects;
DROP POLICY IF EXISTS "documents_storage_delete_own" ON storage.objects;

-- Direct client writes are intentionally disabled. The app uploads, updates,
-- and deletes document objects through authenticated server routes that enforce
-- plan and rate limits before using the service-role key.
