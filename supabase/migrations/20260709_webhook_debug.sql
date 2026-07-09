-- Debug log for the stripe-webhook edge function. Insert-only from the
-- function (service_role) and queryable via MCP / dashboard. Safe to prune.
CREATE TABLE IF NOT EXISTS webhook_debug (
  id bigserial PRIMARY KEY,
  event_type text,
  event_id text,
  message text,
  data jsonb,
  ok boolean,
  created_at timestamptz DEFAULT now()
);

GRANT ALL ON webhook_debug TO service_role;
CREATE INDEX IF NOT EXISTS idx_webhook_debug_created_at ON webhook_debug(created_at DESC);
