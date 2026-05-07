import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { dirname, join, resolve } from "node:path";
import { test, before, after } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const externalBaseUrl = process.env.SMOKE_BASE_URL?.replace(/\/$/, "");

let baseUrl = externalBaseUrl;
let serverProcess;
let serverOutput = "";

function envWithCiDefaults() {
  return {
    ...process.env,
    NODE_ENV: "production",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "ci-anon-key",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "ci-service-role-key",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "sk-ci-openai-key",
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "sk_test_ci_key",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_ci_secret",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "pk_test_ci_key",
    STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID ?? "price_ci_pro",
    STRIPE_TEAM_PRICE_ID: process.env.STRIPE_TEAM_PRICE_ID ?? "price_ci_team",
    STRIPE_LIVE_TEST_PRICE_ID: process.env.STRIPE_LIVE_TEST_PRICE_ID ?? "price_ci_live_test",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? baseUrl,
  };
}

async function waitForServer(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (serverProcess?.exitCode !== null && serverProcess?.exitCode !== undefined) {
      throw new Error(`Next server exited early.\n${serverOutput}`);
    }

    try {
      const response = await fetch(url, { method: "HEAD", redirect: "manual" });
      if (response.status < 500) return;
    } catch {
      // Keep polling until the server is ready or the deadline expires.
    }

    await new Promise((resolvePoll) => setTimeout(resolvePoll, 250));
  }

  throw new Error(`Timed out waiting for ${url}.\n${serverOutput}`);
}

async function startLocalServer() {
  const port = Number(process.env.SMOKE_PORT) || 3210;
  baseUrl = `http://127.0.0.1:${port}`;

  const nextBin = join(repoRoot, "node_modules", "next", "dist", "bin", "next");
  serverProcess = spawn(
    process.execPath,
    [nextBin, "start", "-H", "127.0.0.1", "-p", String(port)],
    {
      cwd: repoRoot,
      env: envWithCiDefaults(),
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  serverProcess.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  serverProcess.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });

  await waitForServer(baseUrl);
}

async function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...options,
    headers: {
      ...(options.body && typeof options.body === "string" ? { "content-type": "application/json" } : {}),
      ...options.headers,
    },
  });
}

before(async () => {
  if (!baseUrl) {
    await startLocalServer();
    return;
  }

  await waitForServer(baseUrl);
});

after(async () => {
  if (!serverProcess) return;

  serverProcess.kill("SIGTERM");
  await Promise.race([
    once(serverProcess, "exit"),
    new Promise((resolveKill) => setTimeout(resolveKill, 2_000)),
  ]);
});

test("public routes render from the production server", async () => {
  for (const path of ["/", "/auth", "/plans"]) {
    const response = await request(path);
    assert.equal(response.status, 200, `${path} should render`);
  }
});

test("dashboard redirects unauthenticated users to auth", async () => {
  const response = await request("/dashboard");

  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "/auth");
});

test("auth callback without an OAuth code redirects back to auth", async () => {
  const response = await request("/auth/callback");

  assert.equal(response.status, 307);
  assert.match(response.headers.get("location") ?? "", /\/auth\?error=auth_error$/);
});

test("upload route rejects unauthenticated requests", async () => {
  const response = await request("/api/extract-text", { method: "POST" });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Unauthorized" });
});

test("document chat route rejects unauthenticated requests", async () => {
  const response = await request("/api/documents/00000000-0000-4000-8000-000000000000/chat", {
    method: "POST",
    body: JSON.stringify({ message: "Summarize this document" }),
  });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Unauthorized" });
});

test("billing routes reject unauthenticated requests", async () => {
  const accountResponse = await request("/api/account/billing");
  assert.equal(accountResponse.status, 401);
  assert.deepEqual(await accountResponse.json(), { error: "Unauthorized" });

  const checkoutResponse = await request("/api/stripe/checkout", {
    method: "POST",
    body: JSON.stringify({ planId: "pro" }),
  });
  assert.equal(checkoutResponse.status, 401);
  assert.deepEqual(await checkoutResponse.json(), { error: "Unauthorized" });

  const portalResponse = await request("/api/stripe/portal", { method: "POST" });
  assert.equal(portalResponse.status, 401);
  assert.deepEqual(await portalResponse.json(), { error: "Unauthorized" });
});

test("stripe webhook rejects requests without a signature", async () => {
  const response = await request("/api/stripe/webhook", {
    method: "POST",
    body: JSON.stringify({ type: "checkout.session.completed" }),
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Missing signature" });
});
