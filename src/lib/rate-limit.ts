import { supabaseAdmin } from './supabase-admin';

// DB-based rate limiting — survives cold starts and works across serverless instances.

export async function checkUploadRateLimit(userId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await supabaseAdmin
    .from('documents')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo);

  if (error) return true; // allow on DB error
  return (count ?? 0) < 5;
}

export async function checkChatRateLimit(userId: string, limitPerHour: number): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await supabaseAdmin
    .from('chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'user')
    .gte('created_at', oneHourAgo);

  if (error) return true; // allow on DB error
  return (count ?? 0) < limitPerHour;
}
