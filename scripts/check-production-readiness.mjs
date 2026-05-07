import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function assertPattern(name, text, pattern) {
  assert.match(text, pattern, `Missing readiness check: ${name}`);
}

const initialSchema = read("docs/migration_000_initial_schema.sql");
const appHosting = read("apphosting.yaml");
const readiness = read("docs/production-readiness.md");
const readme = read("README.md");

const schemaChecks = [
  ["pgcrypto extension", /CREATE EXTENSION IF NOT EXISTS pgcrypto/i],
  ["pgvector extension", /CREATE EXTENSION IF NOT EXISTS vector/i],
  ["documents table", /CREATE TABLE IF NOT EXISTS public\.documents/i],
  ["document_chunks table", /CREATE TABLE IF NOT EXISTS public\.document_chunks/i],
  ["chat_sessions table", /CREATE TABLE IF NOT EXISTS public\.chat_sessions/i],
  ["chat_messages table", /CREATE TABLE IF NOT EXISTS public\.chat_messages/i],
  ["user_subscriptions table", /CREATE TABLE IF NOT EXISTS public\.user_subscriptions/i],
  ["1536-dimension embeddings", /embedding vector\(1536\)/i],
  ["HNSW vector index", /USING hnsw \(embedding vector_cosine_ops\)/i],
  ["match_document_chunks RPC", /CREATE OR REPLACE FUNCTION public\.match_document_chunks/i],
  ["private documents bucket", /INSERT INTO storage\.buckets[\s\S]*'documents'[\s\S]*false/i],
  ["documents RLS", /ALTER TABLE public\.documents ENABLE ROW LEVEL SECURITY/i],
  ["chat messages RLS", /ALTER TABLE public\.chat_messages ENABLE ROW LEVEL SECURITY/i],
  ["document chunks RLS", /ALTER TABLE public\.document_chunks ENABLE ROW LEVEL SECURITY/i],
  ["chat sessions RLS", /ALTER TABLE public\.chat_sessions ENABLE ROW LEVEL SECURITY/i],
  ["subscriptions RLS", /ALTER TABLE public\.user_subscriptions ENABLE ROW LEVEL SECURITY/i],
  ["documents owner policy", /CREATE POLICY "documents_owner" ON public\.documents/i],
  ["chat messages owner policy", /CREATE POLICY "chat_messages_owner" ON public\.chat_messages/i],
  ["document chunks owner policy", /CREATE POLICY "document_chunks_owner" ON public\.document_chunks/i],
  ["subscriptions read policy", /CREATE POLICY "subscriptions_read_own" ON public\.user_subscriptions/i],
  ["storage owner read policy", /CREATE POLICY "documents_storage_select_own" ON storage\.objects[\s\S]*storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text/i],
  ["direct storage insert disabled", /DROP POLICY IF EXISTS "documents_storage_insert_own" ON storage\.objects/i],
  ["direct storage update disabled", /DROP POLICY IF EXISTS "documents_storage_update_own" ON storage\.objects/i],
  ["direct storage delete disabled", /DROP POLICY IF EXISTS "documents_storage_delete_own" ON storage\.objects/i],
];

for (const [name, pattern] of schemaChecks) {
  assertPattern(name, initialSchema, pattern);
}

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_PRO_PRICE_ID",
  "STRIPE_TEAM_PRICE_ID",
  "STRIPE_LIVE_TEST_PRICE_ID",
  "NEXT_PUBLIC_APP_URL",
];

for (const variable of requiredEnvVars) {
  assertPattern(
    `App Hosting env ${variable}`,
    appHosting,
    new RegExp(`variable:\\s*${variable}`),
  );
}

const docChecks = [
  ["README references bootstrap migration", readme, /docs\/migration_000_initial_schema\.sql/],
  ["README references match RPC", readme, /match_document_chunks/],
  ["readiness includes static check", readiness, /npm run readiness:static/],
  ["readiness includes smoke tests", readiness, /npm run test:smoke/],
  ["readiness includes production smoke command", readiness, /SMOKE_BASE_URL=https:\/\/thearchiveai\.xyz npm run test:smoke/],
  ["readiness separates external provider checks", readiness, /External Provider Checks/],
];

for (const [name, text, pattern] of docChecks) {
  assertPattern(name, text, pattern);
}

console.log("Static production readiness checks passed.");
