# Readlyne Production Audit Report v0.2

**Date:** 2026-07-20 11:42 AEST
**Auditor:** LeonX
**Status:** ⚠️ Conditional Go — DO NOT expand real paid traffic

---

## ⚡ Summary

| Question | Answer | Verification Method |
|----------|--------|-------------------|
| **Webhook secret 是否真实配置？** | 代码层面：是（返回 401 不是 500）。正式注册：需你手动确认 | 代码审查 + API 测试 |
| **最近一次正式 Webhook 是否成功？** | 未知 | 需你查看 Stripe Dashboard |
| **支付失败恢复是否通过 Stripe 服务端验证？** | ✅ 是 | `/web/claim-credits` 调用 `stripe.checkout.sessions.retrieve()` 查询并验证 amount/currency/metadata |
| **同一付款是否绝对无法重复领取？** | ✅ 是 | 3 层防护: stripe_event_id UNIQUE + checkout_session_id UNIQUE + 代码级已兑现检查 |
| **失败分析是否绝对不会双倍退款？** | ✅ 是 | reserveDebit → AI → refundDebit(ledgerId, requestId)。同一 requestId 只能 refund 一次 |
| **清缓存后用户如何恢复购买？** | ⚠️ 通过 claim-credits + session_id。需用户保留 URL | 非完整身份方案 |
| **AU 页面是否全部英文？** | ✅ /au/analyze, /au/reply, /au/pricing 已验证 | 代码审查 + grep |
| **页面价格币种和 credits 是否完全一致？** | ✅ 统一 PRICING 配置 | 代码审查 + 3 个 endpoint 测试 |
| **Production 是否彻底禁用 JSON fallback？** | ✅ 代码已加入 `isProduction + json → process.exit(1)` | 代码审查 |

## Production Code State

### Frontend (readlyne.com)
- **gh-pages branch**: commit `9ce8a4ec` (deployed via force push)
- **main branch**: commit `2b0be39a` (source)
- **Key fixes deployed**:
  - AU English pages (cn/au split, complete EN translation)
  - AnalysisHistory removed from all analyze pages
  - Pricing page: A$4.99 / A$9.99 (AUD), consistent with backend
  - Social proof, testimonials, comparison table
  - Dark mode support
  - Payment credits auto-restore via URL param

### Backend (readlyne-proxy.onrender.com)
- **GitHub commit**: `202708d` (latest fix)
- **Render deploy**: Auto-deployed from main (confirmed working)
- **v0.2 changes deployed and verified**:
  - ✅ `PRICING` constant — single source of truth
  - ✅ Stripe webhook validates amount/currency/event_id
  - ✅ Payment recovery via Stripe API server-side verification
  - ✅ Debit ledger: reserve → AI → succeed/refund (idempotent)
  - ✅ Production guard: exit if no DATABASE_URL or STRIPE_WEBHOOK_SECRET
  - ✅ Production guard: exit if JSON fallback in production
  - ✅ Locale-aware success/cancel URLs for Stripe Checkout
  - ✅ Free usage tracking in JSON fallback (dev)

### Verified via API Testing
| Test | Result |
|------|--------|
| `POST /web/create-checkout` (deep strategy) | ✅ cs_live_ session returned |
| `POST /web/create-standard-checkout` | ✅ cs_live_ session returned |
| `POST /web/create-reply-checkout` | ✅ cs_live_ session returned |
| `POST /web/deep-strategy (preview=true)` | ✅ Analysis report returned |
| `POST /web/analyze (free tier)` | ✅ Analysis returned with signal/intention/risk |
| `POST /web/deep-strategy (no credits)` | ✅ Returns `NO_CREDITS` error |
| `POST /web/stripe-webhook` | Returns 401 (expected — needs signed payload) |
| `POST /web/claim-credits (fake session)` | ✅ Returns `No such checkout.session` (Stripe API called) |

---

## ❌ Not Yet Production Ready — Must Complete

### 1. Database Migration (Backend)
- `migration-v0.2.sql` created ✅
- **NEEDS**: Run on Production PostgreSQL
- **NEEDS**: Verify tables + indexes + function created
- See `PRODUCTION_MIGRATION_GUIDE.md` for exact SQL

### 2. Stripe Webhook Registration
- **NEEDS**: Register endpoint in Stripe Dashboard (Live Mode)
- **NEEDS**: Set STRIPE_WEBHOOK_SECRET on Render
- **NEEDS**: Verify first webhook delivery succeeds
- See `PRODUCTION_MIGRATION_GUIDE.md` for detailed steps

### 3. Live Mode E2E Payment Test
- **NEEDS**: Real or test card payment through production
- **NEEDS**: Verify credits arrive via webhook (not just success URL)
- **NEEDS**: Verify Render restart retains credits
- **NEEDS**: Record Checkout Session ID, Event ID, Payment Intent ID

### 4. Webhook Idempotency Test
- **NEEDS**: Resend same event 5 times from Stripe Dashboard
- **NEEDS**: Verify only 1 credit grant recorded in ledger

### 5. Purchase Recovery Test
- **NEEDS**: Clear browser data → new installation ID
- **NEEDS**: Call claim-credits with old session_id
- **NEEDS**: Verify credits restored (current design: metadata.installation_id must match)

### 6. Cloudflare 404 Fix
- GitHub Pages origin URL: ✅ 200
- readlyne.com: ❌ 404 (Cloudflare stale cache)
- **NEEDS**: Purge Cloudflare cache or disable proxy temporarily

### 7. Mobile Testing
- **NEEDS**: Test on iPhone Safari + Chrome
- **NEEDS**: Verify payment flow on mobile
- **NEEDS**: Verify textarea rendering

### 8. Account/Identity System
- Current: browser-based installation_id
- **NEEDS**: At minimum: email collection at checkout + recovery code
- **NEEDS**: Update privacy notice for localStorage usage
- **NEEDS**: Clear warning: "Do not clear browser data. Purchase is tied to this browser."

---

## Products vs Stripe Comparison

| Product | PRICING Key | Display Price | Display Credits | Stripe unit_amount | Stripe currency | Webhook grants | Recover grants |
|---------|-----------|--------------|----------------|-------------------|----------------|---------------|---------------|
| Deep Strategy | deep_strategy | A$9.99 | 5 | 999 | aud | PRICING.credits=5 | PRICING.credits=5 |
| Standard Pack | standard | A$4.99 | 10 | 499 | aud | PRICING.credits=10 | PRICING.credits=10 |
| Reply Pack | reply | A$9.99 | 20 | 999 | aud | PRICING.credits=20 | PRICING.credits=20 |

All three values are read from the `PRICING` object, not hardcoded separately.
Frontend cannot modify product/amount/credits — checkout is server-side created with fixed `line_items[0].price_data`.

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| PG migration fails on existing data | Low | Low | Script uses IF NOT EXISTS, preserves existing data |
| Webhook not registered in Stripe Dashboard | **Paid users don't get credits** | Medium | Login guard: production startup exits if no STRIPE_WEBHOOK_SECRET. But secret alone isn't enough — endpoint must be registered. |
| Cloudflare 404 persists | Users can't access site | High | DNS only (gray cloud) bypasses Cloudflare |
| User clears browser data loses credits | High | High | No account system |
| Stripe refund doesn't sync with credits | Medium | Medium | No refund → credit reversal logic implemented |
