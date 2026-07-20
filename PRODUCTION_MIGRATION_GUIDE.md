# Readlyne Production Go-Live — Manual Steps

Commitments verified by code audit but NOT yet confirmed in Production environment.
Below are the exact manual steps needed to complete Go-Live.

---

## Step 1: Run Database Migration

### 需要做的事
1. 打开 Supabase Dashboard → SQL Editor
2. 粘贴并执行下方 SQL
3. 执行后运行验证查询确认所有对象已创建

### Migration SQL — 直接复制到 Supabase SQL Editor

```sql
-- Readlyne v0.2 Production Migration
-- 可重复执行 (IF NOT EXISTS / CREATE OR REPLACE)
-- 不会删除或修改已有数据

-- ===== 1. installations 表 =====
-- 用途：存储每个设备/用户的 credits、免费使用次数
CREATE TABLE IF NOT EXISTS installations (
  installation_id TEXT PRIMARY KEY,
  credits INTEGER NOT NULL DEFAULT 0,
  free_uses INTEGER NOT NULL DEFAULT 0,
  reply_free_uses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 2. credit_ledger 表 =====
-- 用途：每笔 credits 变动的审计追踪
-- 状态枚举: reserved / succeeded / refunded / completed
-- transaction_type: purchase / debit / refund / migration / adjustment
CREATE TABLE IF NOT EXISTS credit_ledger (
  id SERIAL PRIMARY KEY,
  installation_id TEXT NOT NULL REFERENCES installations(installation_id),
  amount INTEGER NOT NULL,
  balance_before INTEGER,
  balance_after INTEGER,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'debit', 'refund', 'migration', 'adjustment')),
  reason TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('reserved', 'succeeded', 'refunded', 'completed')),
  request_id TEXT,
  parent_request_id TEXT,
  checkout_session_id TEXT,
  stripe_event_id TEXT,
  provider_request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 3. 唯一索引（幂等性关键） =====
-- stripe_event_id 唯一: 确保同一 webhook 事件不重复充值
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_ledger_stripe_event_id
  ON credit_ledger(stripe_event_id) WHERE stripe_event_id IS NOT NULL;

-- checkout_session_id 唯一: 确保同一 Stripe Session 不重复兑现
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_ledger_checkout_session
  ON credit_ledger(checkout_session_id) WHERE checkout_session_id IS NOT NULL;

-- request_id 唯一: 确保同一请求不重复扣费
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_ledger_request_id
  ON credit_ledger(request_id) WHERE request_id IS NOT NULL;

-- ===== 4. 性能索引 =====
CREATE INDEX IF NOT EXISTS idx_credit_ledger_installation
  ON credit_ledger(installation_id);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_created_at
  ON credit_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_installations_updated_at
  ON installations(updated_at);

-- ===== 5. consume_credit() 函数 =====
-- 用途：原子性扣减 1 credits，返回是否成功和剩余数
-- 包含行锁 (FOR UPDATE) 防止并发多扣
CREATE OR REPLACE FUNCTION consume_credit(p_installation_id TEXT)
RETURNS TABLE(ok BOOLEAN, credits_remaining INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  v_credits INTEGER;
BEGIN
  SELECT credits INTO v_credits
  FROM installations
  WHERE installation_id = p_installation_id
  FOR UPDATE;

  IF v_credits IS NULL OR v_credits <= 0 THEN
    RETURN QUERY SELECT false::BOOLEAN, 0::INTEGER;
    RETURN;
  END IF;

  UPDATE installations
  SET credits = credits - 1, updated_at = NOW()
  WHERE installation_id = p_installation_id;

  INSERT INTO credit_ledger (installation_id, amount, balance_before, balance_after, transaction_type, reason)
  VALUES (p_installation_id, -1, v_credits, v_credits - 1, 'debit', 'consume_credit()');

  RETURN QUERY SELECT true::BOOLEAN, (v_credits - 1)::INTEGER;
END;
$$;
```

### 执行后验证查询

```sql
-- 确认表已创建
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('installations', 'credit_ledger');

-- 确认唯一索引已创建
SELECT indexname, indexdef FROM pg_indexes
WHERE tablename = 'credit_ledger' AND indexname LIKE '%stripe_event_id%'
   OR tablename = 'credit_ledger' AND indexname LIKE '%checkout_session%'
   OR tablename = 'credit_ledger' AND indexname LIKE '%request_id%';

-- 确认函数已创建
SELECT proname FROM pg_proc WHERE proname = 'consume_credit';

-- 确认字段约束
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'credit_ledger'
ORDER BY ordinal_position;

-- 确认现有数据无冲突（如果有的话）
SELECT COUNT(*) FROM installations;
SELECT COUNT(*) FROM credit_ledger;
```

### 预计输出
```
table_name
installations
credit_ledger
```
```
indexname                                     indexdef
idx_credit_ledger_stripe_event_id   CREATE UNIQUE INDEX ...
idx_credit_ledger_checkout_session  CREATE UNIQUE INDEX ...
idx_credit_ledger_request_id        CREATE UNIQUE INDEX ...
```
```
proname
consume_credit
```

### 注意事项
- 脚本可重复执行（全部使用 IF NOT EXISTS / CREATE OR REPLACE）
- 不会删除现有数据
- 新旧 installer 数据会通过 `ON CONFLICT` 自动兼容
- 如有已有数据会保留，新旧约束会自检

---

## Step 2: Stripe Webhook 配置

### 在 Stripe Dashboard 操作

1. 登录 https://dashboard.stripe.com/
2. 确认页面右上角 ⚠️ 是 **Live Mode**（不是 Test Mode）
3. 左侧导航 → **Developers → Webhooks**
4. 点击 **Add endpoint**
5. 填写：
   - **Endpoint URL**: `https://readlyne-proxy.onrender.com/web/stripe-webhook`
   - **Listen to**: `Events on your account`（不是 Connected accounts）
   - **Events to send**: 选择 `checkout.session.completed`
   - 其他事件可选：`checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `charge.refunded`
6. 点击 **Add endpoint**
7. 在生成的 **Signing secret** 列点击 **Reveal**
8. 复制完整的 `whsec_xxxxxxxxxxxx` 字符串

### 在 Render Dashboard 操作

1. 打开 https://dashboard.render.com/
2. 找到 Readlyne Proxy service
3. Environment → **Add Environment Variable**
4. Key: `STRIPE_WEBHOOK_SECRET`
5. Value: 粘贴刚才复制的 `whsec_...`（确保没有多余空格或换行）
6. 点击 **Save**
7. 页面会提示重新部署 — 确认部署完成

### 验证 Webhook 是否生效

配置完成后，Stripe Dashboard 中 Webhook 列表会显示该 endpoint 状态为 **Enabled**。
最近 Delivery 状态应为绿色 ✓（如果能从 Stripe 发送一次测试事件的话）。

---

## Step 3: Cloudflare Cache

### 操作步骤

1. 登录 https://dash.cloudflare.com/
2. 选择 `readlyne.com` 域名
3. 左侧导航 → **Cache → Purge**
4. 选择 **Custom Purge** → 粘贴以下 URLs：

```
https://readlyne.com/
https://readlyne.com/cn
https://readlyne.com/cn/analyze
https://readlyne.com/au
https://readlyne.com/au/analyze
https://readlyne.com/pricing
https://readlyne.com/analyze
https://readlyne.com/privacy
https://readlyne.com/terms
```

5. 点击 **Purge**

### 验证

Purge 后访问 `https://readlyne.com/` 应返回 200。
如果仍返回 404，检查以下：

#### GitHub Pages Custom Domain
- GitHub repo → Settings → Pages → Custom domain 应为 `readlyne.com`
- ✅ CNAME 文件已在 gh-pages 分支根目录

#### Cloudflare DNS
- `readlyne.com` A 记录 → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`（GitHub Pages IPs）
- `www` CNAME → `readlyne.com`
- Proxy status: 如果 404，尝试设为 **DNS only (gray cloud)** 排除 Cloudflare 问题

#### SSL/TLS
- Cloudflare SSL/TLS → Overview → 设置为 **Full**（不是 Full (strict) — GitHub Pages 的证书是 `*.github.io`，不是 `readlyne.com`）

---

## Step 4: End-to-End Payment Test

### 你需要做的事

1. 打开 https://readlyne.com/cn/analyze 或 https://readlyne.com/au/analyze
2. 点击购买标准包或深度策略
3. 使用 Stripe 测试卡完成支付：`4242 4242 4242 4242`
4. 观察支付后 credits 是否到账
5. 刷新页面验证余额保持

### 记录以下信息

测试完成后提供以下数据确认链路完整：

```
Checkout Session ID: cs_live_xxxxx
Stripe Event ID: evt_xxxxx
Payment Intent ID: pi_xxxxx
Product / Price ID: price_xxxxx
amount_total: 499 (for standard)
currency: aud
付款前 credits: 0
付款后 credits: 10
```

---

## Step 5: Verify Everything

### 验证清单

| # | 项目 | 验证方法 | 期望结果 |
|---|------|---------|---------|
| 1 | Production 使用 PostgreSQL | 运行 `SELECT COUNT(*) FROM credit_ledger` | 0 或正数（不会报错） |
| 2 | stripe_event_id 唯一索引 | 运行 `SELECT indexname FROM pg_indexes WHERE indexname LIKE '%stripe_event_id%'` | 返回索引名 |
| 3 | checkout_session_id 唯一索引 | 同上 | 返回索引名 |
| 4 | request_id 唯一索引 | 同上 | 返回索引名 |
| 5 | consume_credit 函数 | `SELECT * FROM consume_credit('test')` | 返回 ok=false（test 用户不存在） |
| 6 | Stripe Live Webhook endpoint | Stripe Dashboard → Webhooks → 绿色 ✓ Enabled | Enabled |
| 7 | Webhook signing secret 一致 | 从 Render env 复制 whsec_ 与 Dashboard 对比 | 完全相同 |
| 8 | 页面对账 Deep Strategy | 前端: A$9.99 / 5次, Stripe: 999 aud / 5 credits | 完全一致 |
| 9 | 页面对账 Standard Pack | 前端: A$4.99 / 10次, Stripe: 499 aud / 10 credits | 完全一致 |
| 10 | 页面对账 Reply Pack | 前端: A$9.99 / 20次, Stripe: 999 aud / 20 credits | 完全一致 |
| 11 | AU 全站英文 | 访问 /au/analyze, /au/reply, /au/pricing | 无中文 |
| 12 | readlyne.com 返回正常 | curl -I https://readlyne.com | 200 (非 404) |
| 13 | readlyne.com 手机端 | iPhone Safari + Chrome | 能打开、点击购买 |
| 14 | Render 重启后余额 | 在 Render Dashboard 手动 Restart service | 余额不变 |
