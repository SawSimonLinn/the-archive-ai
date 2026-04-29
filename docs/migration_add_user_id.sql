-- Run this in Supabase > SQL Editor before deploying.
-- Adds user_id to documents and chat_messages so each user's data is isolated.

-- 1. documents table
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents (user_id);

-- 2. chat_messages table (needed for per-user chat rate limiting)
ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx ON chat_messages (user_id);

-- 3. (Optional but recommended) Enable Row-Level Security so the anon key
--    can never bypass user isolation even if supabaseAdmin is accidentally used
--    from a client context.
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Documents: users can only see and modify their own rows
CREATE POLICY "documents_owner" ON documents
  FOR ALL USING (auth.uid() = user_id);

-- Chat messages: users can only see messages belonging to their documents
CREATE POLICY "chat_messages_owner" ON chat_messages
  FOR ALL USING (
    source_document_id IN (
      SELECT id FROM documents WHERE user_id = auth.uid()
    )
  );

-- Note: the service-role key (used server-side in supabaseAdmin) bypasses RLS,
-- so server routes remain unaffected. RLS is a safety net for direct/anon access.
