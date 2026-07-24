'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { getReplySuggestions, submitFeedback } from '@/lib/api';
import BetaSignup from '@/components/BetaSignup';

type ReplySuggestion = { style: string; text: string; why_this_works: string; risk_note: string };
type ReplyResult = {
  reply_suggestions?: ReplySuggestion[];
  communication_risks?: { risk: string; suggestion: string; severity: string }[];
  next_step?: { action: string; reason: string; boundary_note?: string };
};

const LABEL_MAP: Record<string, string> = {
  conservative: '保守风格',
  natural: '自然风格',
  active: '主动风格',
};
const STYLE_COLORS: Record<string, { bg: string; color: string }> = {
  conservative: { bg: '#e8f5e9', color: '#248a3d' },
  natural: { bg: '#e8f0fe', color: '#0060df' },
  active: { bg: '#fde8f5', color: '#a1138a' },
};

function severityTag(s: string) {
  const cls = s === 'high' ? 'tag-high' : s === 'medium' ? 'tag-medium' : 'tag-low';
  const label = s === 'high' ? '高风险' : s === 'medium' ? '中风险' : '低风险';
  return <span className={`tag ${cls}`}>{label}</span>;
}

export default function ReplyPage() {
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ReplyResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const msgRef = useRef<HTMLTextAreaElement>(null);
  const ctxRef = useRef<HTMLTextAreaElement>(null);

  // 反馈
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<'idle'|'sending'|'sent'>('idle');

  const handleSubmit = useCallback(async () => {
    if (submitting || !input.trim()) return;
    setSubmitting(true);
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const rpOpId = crypto.randomUUID?.() || 'rp-'+Date.now()+'-'+Math.random().toString(36).slice(2,10);
      const data = await getReplySuggestions(input, context, 'cn', rpOpId);
      if (!data.ok) {
        setError(data.error || '请求失败，请稍后重试');
        return;
      }
      const a = data.analysis;
      setResult({
        reply_suggestions: a.reply_suggestions,
        communication_risks: a.communication_risks,
        next_step: a.next_step,
      });
    } catch {
      setError('网络连接异常，请检查后重试');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  }, [input, context, submitting]);

  return (
    <div>
      {/* Brand header */}
      <div className="brand-header">
        <span className="brand-name">Readlyne</span>
        <span className="brand-tag">聊天洞察 AI</span>
      </div>

      {/* Hero */}
      <div style={{ padding: '12px 16px 0' }}>
        <h1 className="hero-title">不知道怎么回 TA？</h1>
        <p className="hero-sub">描述场景，AI 给你保守、自然、主动三种风格的回复参考。</p>
      </div>

      {/* Input */}
      <div className="card">
        <label className="input-label">想回应的内容</label>
        <textarea
          className="text-input auto-textarea"
          ref={msgRef}
          placeholder="对方说了什么？或者描述一下你现在的情况…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ marginBottom: 10, height: 128 }}
        />

        <label className="input-label">
          背景信息 <span className="optional">（选填）</span>
        </label>
        <textarea
          className="text-input auto-textarea"
          ref={ctxRef}
          placeholder="例如：暧昧期，前天因为小事吵了一架…"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          style={{ marginBottom: 10, height: 56 }}
        />

        <button className="btn-primary" onClick={handleSubmit} disabled={loading || !input.trim()}>
          {loading ? '生成中…' : '获取回复建议'}
        </button>
        {!input.trim() && !loading && (
          <button
            className="btn-secondary"
            style={{ marginTop: 8 }}
            onClick={() => {
              setInput('TA：你今天怎么不理我了？');
              setContext('暧昧期，认识三个月，最近对方回复变慢');
            }}
          >
            试用示例
          </button>
        )}
      </div>

      {/* Privacy trust */}
      <div className="privacy-line">
        <p>聊天内容不会保存到服务器 · 分析后即忘</p>
      </div>

      {/* Error */}
      {error && (
        <div className="card" style={{ borderColor: '#ffd7d5', background: '#fff5f5' }}>
          <p style={{ color: '#d70015', fontSize: 14, margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="card">
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
            AI 正在生成回复建议…
          </p>
          <div className="skeleton" style={{ width: '40%', marginTop: 16 }} />
          <div className="skeleton" style={{ width: '85%' }} />
          <div className="skeleton" style={{ width: '60%' }} />
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div style={{ marginTop: 4 }}>
          {/* Reply suggestions */}
          {result.reply_suggestions && result.reply_suggestions.length > 0 && (
            <div className="card">
              <div className="section-title">回复建议</div>
              {result.reply_suggestions.map((item, i) => {
                const colors = STYLE_COLORS[item.style] || { bg: '#f5f5f7', color: 'var(--text-secondary)' };
                return (
                  <div key={i} style={{
                    padding: '12px 0',
                    borderTop: i > 0 ? '1px solid var(--separator)' : 'none',
                  }}>
                    <span className="tag" style={{ background: colors.bg, color: colors.color, display: 'inline-block', marginBottom: 8 }}>
                      {LABEL_MAP[item.style] || item.style}
                    </span>
                    <div className="suggestion-card">{item.text}</div>
                    <p className="text-secondary" style={{ fontSize: 13, margin: '4px 0' }}>
                      ✅ {item.why_this_works}
                    </p>
                    {item.risk_note && (
                      <p className="text-secondary" style={{ fontSize: 12, fontStyle: 'italic', margin: '0 0 4px' }}>
                        ⚠️ {item.risk_note}
                      </p>
                    )}
                    <button
                      className="tag tag-info"
                      style={{ border: 'none', cursor: 'pointer' }}
                      onClick={() => navigator.clipboard.writeText(item.text)}
                    >
                      复制
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Communication risks */}
          {result.communication_risks && result.communication_risks.length > 0 && (
            <div className="card">
              <div className="section-title">沟通提醒</div>
              {result.communication_risks.map((item, i) => (
                <div key={i} style={{
                  padding: '10px 0',
                  borderTop: i > 0 ? '1px solid var(--separator)' : 'none',
                }}>
                  <div className="flex items-center gap-6" style={{ marginBottom: 4 }}>
                    {severityTag(item.severity)}
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.risk}</span>
                  </div>
                  <p className="text-secondary" style={{ fontSize: 13, margin: 0 }}>
                    {item.suggestion}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Next step */}
          {result.next_step && (
            <div className="card">
              <div className="section-title">下一步</div>
              <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 4, color: 'var(--text)' }}>
                {result.next_step.action}
              </p>
              {result.next_step.reason && (
                <p className="text-secondary" style={{ fontSize: 13, margin: 0 }}>
                  {result.next_step.reason}
                </p>
              )}
            </div>
          )}

          {/* App CTA */}
          <div className="app-cta">
            <p className="cta-title">想让 Readlyne 记住这个人？</p>
            <p className="cta-desc">
              下载 App 建立关系档案，<br />
              让后续分析越来越贴合你们的互动。
            </p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                回到顶部
              </button>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input
                  className="text-input auto-textarea"
                  style={{ flex: 1, marginBottom: 0, fontSize: 14, padding: '10px 14px' }}
                  placeholder="反馈建议…"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && feedbackStatus === 'idle' && feedbackText.trim()) {
                      setFeedbackStatus('sending');
                      await submitFeedback(feedbackText.trim());
                      setFeedbackStatus('sent');
                      setFeedbackText('');
                      setTimeout(() => setFeedbackStatus('idle'), 3000);
                    }
                  }}
                  maxLength={500}
                />
                <button
                  onClick={async () => {
                    if (feedbackStatus !== 'idle' || !feedbackText.trim()) return;
                    setFeedbackStatus('sending');
                    await submitFeedback(feedbackText.trim());
                    setFeedbackStatus('sent');
                    setFeedbackText('');
                    setTimeout(() => setFeedbackStatus('idle'), 3000);
                  }}
                  disabled={feedbackStatus !== 'idle' || !feedbackText.trim()}
                  style={{
                    padding: '10px 16px',
                    background: feedbackStatus === 'sent' ? '#34c759' : 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: feedbackStatus !== 'idle' || !feedbackText.trim() ? 'not-allowed' : 'pointer',
                    opacity: feedbackStatus !== 'idle' || !feedbackText.trim() ? 0.5 : 1,
                    whiteSpace: 'nowrap',
                    minWidth: 56,
                  }}
                >
                  {feedbackStatus === 'sending' ? '…' : feedbackStatus === 'sent' ? '✓' : '提交'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <>
        <div style={{ textAlign: 'center', padding: '0 16px' }}>
          <BetaSignup />
        </div>
        </>
      )}
    </div>
  );
}
