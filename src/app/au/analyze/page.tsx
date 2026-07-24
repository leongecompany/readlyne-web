'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeMessage, getCredits as fetchServerCredits, submitFeedback } from '@/lib/api';
import BetaSignup from '@/components/BetaSignup';

type Intention = { label: string; explanation: string; confidence: number; evidence_refs?: string[] };
type Risk = { risk: string; suggestion: string; severity: string };
type Signal = { summary: string; confidence: string; evidence_refs?: string[] };
type ReplySuggestion = { style: string; text: string; why_this_works: string; risk_note: string };
type NextStep = { action: string; reason: string; boundary_note?: string };
type Analysis = {
  relationship_signal?: Signal;
  possible_intentions?: Intention[];
  communication_risks?: Risk[];
  reply_suggestions?: ReplySuggestion[];
  next_step?: NextStep;
};

function severityTag(s: string) {
  const cls = s === 'high' ? 'tag-high' : s === 'medium' ? 'tag-medium' : 'tag-low';
  const label = s === 'high' ? 'High Risk' : s === 'medium' ? 'Medium Risk' : 'Low Risk';
  return <span className={`tag ${cls}`}>{label}</span>;
}

const LABEL_MAP: Record<string, string> = { 'Likely': 'Likely', 'Possible': 'Possible', 'Unlikely': 'Unlikely' };

// Usage Counter
function UsageCounter() {
  const [count] = useState(() => {
    try { return parseInt(localStorage.getItem('readlyne_usage_count') || '0', 10); }
    catch { return 0; }
  });
  if (count < 1) return null;
  return (
    <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', margin: '0 0 16px' }}>
      Completed on this device: {count}  analyses
    </p>
  );
}


export default function AnalyzePage() {
  const [message, setMessage] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const msgRef = useRef<HTMLTextAreaElement>(null);
  const ctxRef = useRef<HTMLTextAreaElement>(null);

  // Feedback
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<'idle'|'sending'|'sent'>('idle');
  const handleFeedback = useCallback(async () => {
    if (feedbackStatus !== 'idle' || !feedbackText.trim()) return;
    setFeedbackStatus('sending');
    try {
      await submitFeedback(feedbackText.trim());
      setFeedbackStatus('sent');
      setFeedbackText('');
      setTimeout(() => setFeedbackStatus('idle'), 3000);
    } catch {
      setFeedbackStatus('idle');
    }
  }, [feedbackText, feedbackStatus]);

  // Server credit State
  const [serverCredits, setServerCredits] = useState(0);
  const [freeRemaining, setFreeRemaining] = useState(10);
  const [creditsLoaded, setCreditsLoaded] = useState(false);

  const loadServerCredits = useCallback(async () => {
    const c = await fetchServerCredits();
    setServerCredits(c.credits);
    setFreeRemaining(c.free_remaining);
    setCreditsLoaded(true);
  }, []);

  useEffect(() => { loadServerCredits(); }, [loadServerCredits]);

  const handleSubmit = useCallback(async () => {
    if (submitting || !message.trim()) return;
    setSubmitting(true);
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const data = await analyzeMessage(message, context, 'au');
      if (!data.ok) {
        setError(data.error || 'Analysis failed, try again later');
        return;
      }
      setAnalysis(data.analysis);

      // 保存History + 计数
      try {
        const count = parseInt(localStorage.getItem('readlyne_usage_count') || '0', 10) + 1;
        localStorage.setItem('readlyne_usage_count', String(count));
      } catch {}
    } catch {
      setError('Connection error. Check and try again.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  }, [message, context, submitting]);

  // Share bonus
  const [shareBonusClaimed, setShareBonusClaimed] = useState(() => {
    try { return localStorage.getItem('readlyne_share_bonus') === '1'; }
    catch { return false; }
  });
  const handleShare = useCallback(async () => {
    const shareText = 'Readlyne — AI relationship insights. Paste your chat, get instant analysis.';
    const shareUrl = 'https://readlyne.com';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Readlyne', text: shareText, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      }
    } catch {} // user cancelled
    setFreeRemaining(10);
    setShareBonusClaimed(true);
    try { localStorage.setItem('readlyne_share_bonus', '1'); } catch {}
  }, []);

  return (
    <div>
      {/* Brand header */}
      <div className="brand-header">
        <span className="brand-name">Readlyne</span>
        <span className="brand-tag">Chat Insights AI</span>
      </div>

      {/* Hero */}
      <div style={{ padding: '20px 16px 0' }}>
        <h1 className="hero-title">Don't understand them?</h1>
        <p className="hero-sub">Paste your chat. AI analyzes subtext, risks, and best replies.</p>
      </div>

      {/* Input */}
      <div className="card glass">
        <label className="input-label">Chat Content</label>
        <textarea
          className="text-input auto-textarea"
          ref={msgRef}
         
          placeholder={"You: Why are you ignoring me?\nThem: Not ignoring, just busy with work."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ marginBottom: 16, height: 160 }}
        />

        <label className="input-label">
          Context <span className="optional">(Optional)</span>
        </label>
        <textarea
          className="text-input auto-textarea"
          ref={ctxRef}
         
          placeholder="e.g. Known each other 2 months, feeling distant lately…"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          style={{ marginBottom: 16, height: 80 }}
        />

        <button className="btn-primary" onClick={handleSubmit} disabled={loading || !message.trim() || (freeRemaining <= 0 && serverCredits <= 0 && creditsLoaded && shareBonusClaimed)}>
          {loading ? 'Analyzing…' : freeRemaining > 0 ? `Free Analysis (${freeRemaining} remaining)` : serverCredits > 0 ? `Analyze (${serverCredits} remaining)` : 'Free analyses used up'}
        </button>
        {freeRemaining <= 0 && serverCredits <= 0 && creditsLoaded && !shareBonusClaimed && message.trim() && (
          <button
            className="btn-primary"
            style={{ marginTop: 8, background: '#34c759' }}
            onClick={handleShare}
          >
            ↗ Share to get 10 free analyses
          </button>
        )}
        {!message.trim() && !loading && (
          <button
            className="btn-secondary"
            style={{ marginTop: 8 }}
            onClick={() => {
              setMessage('You: Why are you being distant?\nThem: You\'re overthinking it.\nYou: I just feel like things have been cold lately.\nThem: Just been really busy, it\'s not about you.');
              setContext('Situationship, 3 months, they\'ve been replying slower lately');
            }}
          >
            Try Example
          </button>
        )}
      </div>

      {/* Privacy trust */}
      <div className="privacy-line">
        <p>Chat Content not saved · Ephemeral analysis</p>
      </div>

      {/* Error */}
      {error && (
        <div className="card glass" style={{ borderColor: '#ffd7d5', background: '#fff5f5' }}>
          <p style={{ color: '#d70015', fontSize: 14, margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="card glass">
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
            AI is analyzing your chat…
          </p>
          <div className="skeleton" style={{ width: '40%', marginTop: 16 }} />
          <div className="skeleton" style={{ width: '85%' }} />
          <div className="skeleton" style={{ width: '60%' }} />
        </div>
      )}

      {/* Results */}
      {analysis && !loading && (
        <div style={{ marginTop: 4 }}>
          {/* 分享按钮 */}
          {analysis && (
            <div style={{ padding: '0 16px 12px' }}>
              <button
                className="btn-secondary"
                onClick={() => {
                  const text = [
                    'Readlyne Chat Analysis',
                    '',
                    analysis.relationship_signal && `🔮 Quick Judgment: ${analysis.relationship_signal.summary}`,
                    ...(analysis.possible_intentions || []).map((item, i) =>
                      `${i + 1}. ${item.label} (${Math.round(item.confidence * 100)}%) — ${item.explanation}`
                    ),
                    ...(analysis.communication_risks || []).map((item) =>
                      `⚠️ ${item.risk}: ${item.suggestion}`
                    ),
                    '',
                    '——',
                    'Analyzed by Readlyne',
                  ].filter(Boolean).join('\n');
                  navigator.clipboard.writeText(text).then(() => {
                    const btn = document.activeElement as HTMLElement;
                    if (btn) btn.textContent = '✅ Copied';
                    setTimeout(() => { if (btn) btn.textContent = 'Copy Results'; }, 2000);
                  });
                }}
              >
                Copy Results
              </button>
            </div>
          )}

          {/* Quick Judgment */}
          {analysis.relationship_signal && (
            <div className="card glass">
              <div className="section-title">Quick Judgment</div>
              <p className="result-text" style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.6 }}>
                {analysis.relationship_signal.summary}
              </p>
            </div>
          )}

          {/* Possible Meanings */}
          {analysis.possible_intentions && analysis.possible_intentions.length > 0 && (
            <div className="card glass">
              <div className="section-title">Possible Meanings</div>
              {analysis.possible_intentions.map((item, i) => (
                <div key={i} style={{
                  padding: '10px 0',
                  borderTop: i > 0 ? '1px solid var(--separator)' : 'none',
                }}>
                  <div className="flex items-center" style={{ marginBottom: 4, gap: 8 }}>
                    <span className="tag" style={{
                      background: item.confidence >= 0.7 ? '#e8f0fe' :
                                   item.confidence >= 0.5 ? '#fff4e0' : '#f5f5f7',
                      color: item.confidence >= 0.7 ? '#0060df' :
                             item.confidence >= 0.5 ? '#c93400' : 'var(--text-tertiary)',
                    }}>
                      {item.label}
                    </span>
                    <span className="text-tertiary" style={{ fontSize: 12 }}>
                      {Math.round(item.confidence * 100)}%
                    </span>
                  </div>
                  <p className="result-text" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Misreading Risks */}
          {analysis.communication_risks && analysis.communication_risks.length > 0 && (
            <div className="card glass">
              <div className="section-title">Misreading Risks</div>
              {analysis.communication_risks.map((item, i) => (
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

          {/* Reply Reference */}
          {analysis.reply_suggestions && analysis.reply_suggestions.length > 0 && (
            <div className="card glass">
              <div className="section-title">Reply Reference</div>
              <div className="suggestion-card">{analysis.reply_suggestions[0].text}</div>
              <p className="text-secondary" style={{ fontSize: 13, marginTop: 4 }}>
                {analysis.reply_suggestions[0].why_this_works}
              </p>
            </div>
          )}

          {/* Next Step */}
          {analysis.next_step && (
            <div className="card glass">
              <div className="section-title">Next Step</div>
              <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 4, color: 'var(--text)' }}>
                {analysis.next_step.action}
              </p>
              {analysis.next_step.reason && (
                <p className="text-secondary" style={{ fontSize: 13, margin: 0 }}>
                  {analysis.next_step.reason}
                </p>
              )}
            </div>
          )}

          {/* App CTA */}
          <div className="app-cta">
            <p className="cta-title">Want Readlyne to remember them?</p>
            <p className="cta-desc">
              Download the app to build relationship profiles,<br />
              for increasingly personalized insights.
            </p>
            <div className="cta-buttons">
              <button
                className="btn-primary"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Back to top
              </button>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input
                  className="text-input auto-textarea"
                  style={{ flex: 1, marginBottom: 0, fontSize: 14, padding: '10px 14px' }}
                  placeholder="Feedback…"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFeedback()}
                  maxLength={500}
                />
                <button
                  onClick={handleFeedback}
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
              {feedbackStatus === 'sent' && (
                <p style={{ fontSize: 12, color: '#34c759', margin: '4px 0 0', textAlign: 'center' }}>Thanks for the feedback!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!analysis && !loading && !error && (
        <>
          {/* Trust points */}

          {/* Social proof counter */}
          <UsageCounter />



          {/* Beta signup */}
          <div className="app-promo">
            <div className="app-name">Readlyne</div>
            <BetaSignup locale="au" />
          </div>
        </>
      )}
    </div>
  );
}
