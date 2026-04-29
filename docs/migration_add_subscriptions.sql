-- Run in Supabase > SQL Editor before deploying.
-- Creates user_subscriptions table to track Stripe plan per user.

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id      TEXT UNIQUE,
  stripe_subscription_id  TEXT UNIQUE,
  plan_id                 TEXT NOT NULL DEFAULT 'free',  -- 'free' | 'pro' | 'team'
  status                  TEXT NOT NULL DEFAULT 'active', -- 'active' | 'canceled' | 'past_due'
  current_period_end      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON user_subscriptions (user_id);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription; all writes go through the service role (webhook)
CREATE POLICY "subscriptions_read_own" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
