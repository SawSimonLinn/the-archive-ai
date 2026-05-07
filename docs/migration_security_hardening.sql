-- Run this in Supabase > SQL Editor before launch.
-- Defense-in-depth for tables that are normally accessed through service-role
-- server routes. RLS keeps direct anon/auth client access from exposing data if
-- a browser client ever queries these tables by mistake.

ALTER TABLE IF EXISTS document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "document_chunks_owner" ON document_chunks;
CREATE POLICY "document_chunks_owner" ON document_chunks
  FOR ALL
  USING (
    document_id IN (
      SELECT id FROM documents WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    document_id IN (
      SELECT id FROM documents WHERE user_id = auth.uid()
    )
  );

-- No direct client policies for chat_sessions. Service-role routes create and
-- read sessions, while user-visible messages are constrained through documents.
