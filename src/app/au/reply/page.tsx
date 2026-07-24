'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { getReplySuggestions, submitFeedback } from '@/lib/api';
import BetaSignup from '@/components/BetaSignup';

type ReplySuggestion = { style: string; text: string; why_this_works: string; risk_note: string };
type ReplyResult = {
  reply_suggestions?: ReplySuggestion[];
  communication_risks?: { risk: string; suggestion: string; severity: string }[];
  next_step?: { action: string; reason: string; boundary_note?: string };
};

const LABEL_MAP: Record<string, string> = {
  conservative: 'Conservative',
  natural: 'Natural',
  active: 'Bold',
};
const STYLE_COLORS: Record<string, { bg: string; color: string }> = {
  conservative: { bg: '#e8f5e9', color: '#248a3d' },
  natural: { bg: '#e8f0fe', color: '#0060df' },
  active: { bg: '#fde8f5', color: '#a1138a' },
};

function severityTag(s: string) {
  const cls = s === 'high' ? 'tag-high' : s === 'medium' ? 'tag-medium' : 'tag-low';
  const label = s === 'high' ? 'High Risk' : s === 'medium' ? 'Medium Risk' : 'Low Risk';
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
      const data = await getReplySuggestions(input, context, 'au');
      if (!data.ok) {
        setError(data.error || 'Request failed. Try again later.');
        return;
      }
      const a = data.analysis;
      setResult({
        reply_suggestions: a.reply_suggestions,
        communication_risks: a.communication_risks,
        next_step: a.next_step,
      });
    } catch {
      setError('Network error. Check and try again.');
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
        <span className="brand-tag">Chat Insights AI</span>
      </div>

      {/* Hero */}
      <div style={{ padding: '12px 16px 0' }}>
        <h1 className="hero-title">Don't know how to reply?</h1>
        <p className="hero-sub">Describe the situation. AI suggests conservative, natural, and bold replies.</p>
      </div>

      {/* Input */}
      <div className="card">
        <label className="input-label">What to respond to</label>
        <textarea
          className="text-input auto-textarea"
          ref={msgRef}
         
          placeholder="What did they say? Describe your situation…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ marginBottom: 10, height: 100 }}
        />

        <label className="input-label">
          Context <span className="optional">(Optional)</span>
        </label>
        <textarea
          className="text-input auto-textarea"
          ref={ctxRef}
         
          placeholder="e.g. In a situationship, had a small argument yesterday…"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          style={{ marginBottom: 10, height: 44 }}
        />

        <button className="btn-primary" onClick={handleSubmit} disabled={loading || !input.trim()}>
          {loading ? 'Generating…' : 'Get Reply Ideas'}
        </button>
        {!input.trim() && !loading && (
          <button
            className="btn-secondary"
            style={{ marginTop: 8 }}
            onClick={() => {
              setInput('Them: Why are you being distant?');
              setContext('Situationship, 3 months, replying slower lately');
            }}
          >
            Try Example
          </button>
        )}
      </div>

      {/* Privacy trust */}
      <div className="privacy-line">
        <p>Chat data not saved on server · Ephemeral analysis</p>
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
            AI generating reply suggestions…
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
              <div className="section-title">Reply Suggestions</div>
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
                      Copy
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Communication risks */}
          {result.communication_risks && result.communication_risks.length > 0 && (
            <div className="card">
              <div className="section-title">Communication Alerts</div>
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
              <div className="section-title">Next Step</div>
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
            <p className="cta-title">Want Readlyne to remember them?</p>
            <p className="cta-desc">
              Download the app to build profiles,<br />
              for increasingly personalized insights.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Back to top
              </button>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input
                  className="text-input auto-textarea"
                  style={{ flex: 1, marginBottom: 0, fontSize: 14, padding: '10px 14px' }}
                  placeholder="Feedback…"
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
                  {feedbackStatus === 'sending' ? '…' : feedbackStatus === 'sent' ? '✓' : 'Submit'}
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
          <BetaSignup locale="au" />
        </div>
        </>
      )}
    </div>
  );
}
