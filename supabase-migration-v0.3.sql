-- ============================================================================
-- Readlyne v0.3 — Admin Dashboard & Tracking
-- ============================================================================
-- 在 Supabase SQL Editor 执行（事务性，可安全重跑）
-- ============================================================================

BEGIN;

-- ───────── 1. api_requests — 每一条 API 调用的日志 ─────────
CREATE TABLE IF NOT EXISTS public.api_requests (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  installation_id TEXT NOT NULL,
  ip VARCHAR(45),
  mode TEXT NOT NULL CHECK (mode IN ('analyze', 'reply', 'deep_strategy')),
  locale TEXT DEFAULT 'cn',
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error')),
  country VARCHAR(100),
  city VARCHAR(200),
  message_length INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  message_snippet VARCHAR(200)   -- 仅存前 200 chars，隐私保护
);

CREATE INDEX IF NOT EXISTS idx_api_requests_created ON public.api_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_requests_installation ON public.api_requests(installation_id);
CREATE INDEX IF NOT EXISTS idx_api_requests_mode ON public.api_requests(mode);
CREATE INDEX IF NOT EXISTS idx_api_requests_country ON public.api_requests(country);
CREATE INDEX IF NOT EXISTS idx_api_requests_date ON public.api_requests((created_at::date));

-- ───────── 2. user_queries — 存用户输入的聊天内容（仅 admin 可见）─────────
CREATE TABLE IF NOT EXISTS public.user_queries (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  installation_id TEXT NOT NULL,
  message TEXT NOT NULL,
  context TEXT,
  locale TEXT DEFAULT 'cn',
  mode TEXT NOT NULL DEFAULT 'analyze' CHECK (mode IN ('analyze', 'reply', 'deep_strategy')),
  status TEXT NOT NULL DEFAULT 'success',
  ip VARCHAR(45)
);

CREATE INDEX IF NOT EXISTS idx_user_queries_created ON public.user_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_queries_installation ON public.user_queries(installation_id);

COMMIT;

-- ───────── 3. 验证 ─────────
SELECT table_name, table_type FROM information_schema.tables
WHERE table_schema='public' AND table_name IN ('api_requests','user_queries');
