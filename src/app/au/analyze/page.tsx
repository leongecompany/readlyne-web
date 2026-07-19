'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeMessage, deepStrategy, createCheckout, getCredits as fetchServerCredits, claimCredits, submitFeedback } from '@/lib/api';
import BetaSignup from '@/components/BetaSignup';

const PAYMENT_MODAL_STEPS = { HIDDEN: 'hidden', CHOOSE: 'choose', PROCESSING: 'processing', SUCCESS: 'success' } as const;

type Intention = { label: string; explanation: string; confidence: number; evidence_refs?: string[] };
type Risk = { risk: string; suggestion: string; severity: string };
type Signal = { summary: string; confidence: string; evidence_refs?: string[] };
type ReplySuggestion = { style: string; text: string; why_this_works: string; risk_note: string };
type NextStep = { action: string; reason: string; boundary_note?: string };
type DeepStrategyReport = {
  goal_feasibility: { assessment: string; psychology_basis: string };
  target_comm_state: { observation: string; psychology_basis: string };
  timeline_analysis: { pattern: string; psychology_basis: string };
  strategies: { principle: string; psychology: string; mechanism: string; application: string }[];
  replies: { style: string; text: string; psychology: string; expected_effect: string }[];
  signals: {
    positive: { signal: string; psychology: string }[];
    neutral: { signal: string; psychology: string }[];
    step_back: { signal: string; psychology: string }[];
  };
  risk_reminder: { blind_spots: string; missing_evidence: string; principle_reminder: string };
};
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

// Sample Report Preview — shows Deep Strategy analysis output format
function SampleReportPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--separator)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none', border: 'none', color: 'var(--text-secondary)',
          fontSize: 13, cursor: 'pointer', padding: '4px 0', width: '100%', textAlign: 'center',
        }}
      >
        {open ? 'Hide ↑' : '📋 Full Sample Report'}
      </button>
      {open && (
        <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.7, color: 'var(--text-tertiary)', textAlign: 'left' }}>
          <div style={sampleSectionStyle}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>A. Goal Feasibility</div>
            <p style={{ margin: 0 }}>Based on Social Penetration Theory, the conversation is at surface level. Short, passive replies suggest progress is possible but requires a gentle, gradual approach.</p>
          </div>
          <div style={sampleSectionStyle}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>B. Communication State</div>
            <p style={{ margin: 0 }}>Per Self-Verification Theory, they prefer the current casual dynamic. Signals are neutral-to-positive, no rejection but no active progression.</p>
          </div>
          <div style={sampleSectionStyle}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>C. Timeline & Rhythm</div>
            <p style={{ margin: 0 }}>Reply gaps are wide (avg &gt;3h). Consistent with the Mere Exposure Effect — gradual, warm exposure works better than intense bursts.</p>
          </div>
          <div style={sampleSectionStyle}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>D. Strategies (5)</div>
            <p style={{ margin: 0 }}>Based on Reciprocity + Attachment Theory secure communication patterns, each with actionable phrasing direction.</p>
          </div>
          <div style={sampleSectionStyle}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>E. Ready-to-Use Replies (3)</div>
            <p style={{ margin: 0 }}>Safe / Natural progression / Direct confirmation, each with psychological reasoning.</p>
          </div>
          <div style={sampleSectionStyle}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>F-G. Signals & Risk Reminders</div>
            <p style={{ margin: 0 }}>How to read their reaction after sending (positive/neutral/step-back signals), with over-interpretation warnings.</p>
          </div>
          <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text)', textAlign: 'center', fontWeight: 500 }}>
            $9.99 to unlock real analysis reports
          </p>
        </div>
      )}
    </div>
  );
}

const sampleSectionStyle: React.CSSProperties = {
  padding: '6px 0',
  borderTop: '1px solid var(--separator)',
};

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

// Recent AnalysesHistory
const HISTORY_KEY = 'readlyne_history';
const MAX_HISTORY = 4;

type HistoryItem = { message: string; context: string; time: string; preview: string };

function getHistory(): HistoryItem[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}

function saveHistory(item: HistoryItem) {
  const h = getHistory();
  h.unshift(item);
  if (h.length > MAX_HISTORY) h.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}

function AnalysisHistory({ onSelect }: { onSelect: (msg: string, ctx: string) => void }) {
  const [items] = useState<HistoryItem[]>(getHistory);
  if (items.length === 0) return null;
  return (
    <div style={{ padding: '0 16px', marginBottom: 16 }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 8, textAlign: 'center' }}>
        Recent Analyses
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => onSelect(item.message, item.context)}
            style={{
              textAlign: 'left',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--card-border)',
              borderRadius: 10,
              padding: '10px 14px',
              cursor: 'pointer',
              fontSize: 13,
              color: 'var(--text)',
              lineHeight: 1.4,
            }}
          >
            <div style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: 2,
            }}>
              {item.preview}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{item.time}</span>
          </button>
        ))}
      </div>
    </div>
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

  // Premium deep strategy state
  const [userGoal, setUserGoal] = useState('');
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [premiumReport, setPremiumReport] = useState<DeepStrategyReport | null>(null);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [premiumError, setPremiumError] = useState('');
  const [paymentStep, setPaymentStep] = useState<string>(PAYMENT_MODAL_STEPS.HIDDEN);
  const goalRef = useRef<HTMLTextAreaElement>(null);

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

  const GOAL_CHIPS = [
    'Check their feelings', 'Move forward', 'Resolve conflict', 'Restart conversation',
    'Test their interest', 'End situationship', 'Express interest naturally',
  ];

  const handleGoalChip = (chip: string) => {
    setUserGoal(chip);
  };

  useEffect(() => {
    if (msgRef.current) {
      msgRef.current.style.height = 'auto';
      msgRef.current.style.height = msgRef.current.scrollHeight + 'px';
    }
  }, [message]);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.style.height = 'auto';
      ctxRef.current.style.height = ctxRef.current.scrollHeight + 'px';
    }
  }, [context]);

  useEffect(() => {
    if (goalRef.current) {
      goalRef.current.style.height = 'auto';
      goalRef.current.style.height = goalRef.current.scrollHeight + 'px';
    }
  }, [userGoal]);

  // Server credit State
  const [serverCredits, setServerCredits] = useState(0);
  const [creditsLoaded, setCreditsLoaded] = useState(false);

  const loadServerCredits = useCallback(async () => {
    const c = await fetchServerCredits();
    setServerCredits(c);
    setCreditsLoaded(true);
  }, []);

  useEffect(() => { loadServerCredits(); }, [loadServerCredits]);

  const handleDeepStrategy = useCallback(async () => {
    if (premiumLoading || !userGoal.trim() || userGoal.trim().length < 2) return;
    if (serverCredits > 0) {
      // Has remaining credits，Server校验消耗
      setPaymentStep(PAYMENT_MODAL_STEPS.HIDDEN);
      setPremiumLoading(true);
      setPremiumReport(null);
      setPremiumError('');
      try {
        const data = await deepStrategy({ message, context, userGoal: userGoal.trim(), locale: 'au' });
        if (!data.ok) {
          if (data.error === 'NO_CREDITS') {
            // Server拒绝 — refresh credits
            loadServerCredits();
            setPaymentStep(PAYMENT_MODAL_STEPS.CHOOSE);
          } else {
            setPremiumError(data.error || 'Analysis failed');
          }
          setPremiumLoading(false);
          return;
        }
        setPremiumReport(data.report);
        setPremiumUnlocked(true);
        setServerCredits(data.credits_remaining ?? Math.max(0, serverCredits - 1));
      } catch { setPremiumError('Network error'); }
      finally { setPremiumLoading(false); }
    } else {
      // 没Has remaining credits，Show payment
      setPaymentStep(PAYMENT_MODAL_STEPS.CHOOSE);
    }
  }, [message, context, userGoal, premiumLoading, serverCredits, loadServerCredits]);

  const handlePaymentChoice = useCallback(async (method: string) => {
    setPaymentStep(PAYMENT_MODAL_STEPS.PROCESSING);
    setPremiumLoading(true);
    setPremiumReport(null);
    setPremiumError('');

    try {
      // 保存数据到 localStorage，支付成功回来后恢复
      localStorage.setItem('readlyne_pending_goal', userGoal.trim());
      localStorage.setItem('readlyne_pending_message', message);
      localStorage.setItem('readlyne_pending_context', context);

      const checkout = await createCheckout('deep_strategy_' + Date.now());
      if (!checkout.ok) {
        if (checkout.error === 'STRIPE_NOT_CONFIGURED') {
          setPaymentStep(PAYMENT_MODAL_STEPS.HIDDEN);
          setPremiumLoading(false);
          setPremiumError('Payment not configured，Please configure Stripe 密钥');
          return;
        }
        setPremiumError(checkout.message || 'Payment service unavailable');
        setPremiumLoading(false);
        return;
      }
      // 跳转到 Stripe Checkout（支付宝扫码/跳转）
      window.location.href = checkout.url;
    } catch (e) {
      setPremiumError('Network error，try again later');
      setPremiumLoading(false);
      setPaymentStep(PAYMENT_MODAL_STEPS.HIDDEN);
    }
  }, [message, context, userGoal, premiumLoading]);

  // Stripe 支付返回处理 — 用 session_id 向Server验证
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      // 清除 URL 参数
      window.history.replaceState({}, '', window.location.pathname);

      // 向Server验证支付State并获取 credits
      claimCredits(sessionId).then((result) => {
        if (result.ok) {
          setServerCredits(result.credits);
          // 恢复待处理的Analysis
          const savedGoal = localStorage.getItem('readlyne_pending_goal');
          const savedMessage = localStorage.getItem('readlyne_pending_message');
          const savedContext = localStorage.getItem('readlyne_pending_context');
          if (savedGoal && savedMessage) {
            localStorage.removeItem('readlyne_pending_goal');
            localStorage.removeItem('readlyne_pending_message');
            localStorage.removeItem('readlyne_pending_context');
            setPremiumLoading(true);
            setMessage(savedMessage);
            setContext(savedContext || '');
            setUserGoal(savedGoal);
            deepStrategy({ message: savedMessage, context: savedContext || '', userGoal: savedGoal })
              .then((data) => {
                if (data.ok && data.report) {
                  setServerCredits(data.credits_remaining ?? 2);
                  setPremiumReport(data.report);
                  setPremiumUnlocked(true);
                }
              })
              .catch(() => {})
              .finally(() => setPremiumLoading(false));
          }
        }
      }).catch(() => {});
    }

    // 处理取消支付
    if (params.get('cancelled') === '1') {
      window.history.replaceState({}, '', window.location.pathname);
      // 清理 pending 数据
      localStorage.removeItem('readlyne_pending_goal');
      localStorage.removeItem('readlyne_pending_message');
      localStorage.removeItem('readlyne_pending_context');
    }
  }, [loadServerCredits]);

  const handleSubmit = useCallback(async () => {
    if (submitting || !message.trim()) return;
    setSubmitting(true);
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const data = await analyzeMessage(message, context, 'au');
      if (!data.ok) {
        setError(data.error || 'Analysis failed，try again later');
        return;
      }
      setAnalysis(data.analysis);

      // 保存History + 计数
      try {
        const count = parseInt(localStorage.getItem('readlyne_usage_count') || '0', 10) + 1;
        localStorage.setItem('readlyne_usage_count', String(count));
        const preview = data.analysis?.relationship_signal?.summary || message.slice(0, 40);
        saveHistory({
          message,
          context,
          time: new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          preview,
        });
      } catch {}
    } catch {
      setError('Connection error. Check and try again.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  }, [message, context, submitting]);

  return (
    <div>
      {/* Brand header */}
      <div className="brand-header">
        <span className="brand-name">Readlyne</span>
        <span className="brand-tag">Chat Insights AI</span>
      </div>

      {/* Hero */}
      <div style={{ padding: '20px 16px 0' }}>
        <h1 className="hero-title">Don\'t understand them?</h1>
        <p className="hero-sub">Paste your chat. AI analyzes subtext, risks, and best replies.</p>
      </div>

      {/* Input */}
      <div className="card">
        <label className="input-label">Chat Content</label>
        <textarea
          className="text-input"
          ref={msgRef}
          rows={3}
          placeholder={"You: Why are you ignoring me?\nThem: Not ignoring, just busy with work."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <label className="input-label">
          Context <span className="optional">（Optional）</span>
        </label>
        <textarea
          className="text-input"
          ref={ctxRef}
          rows={2}
          placeholder="e.g. Known each other 2 months, feeling distant lately…"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <button className="btn-primary" onClick={handleSubmit} disabled={loading || !message.trim()}>
          {loading ? 'Analyzing…' : '🔍 Free Analysis'}
        </button>
        {!message.trim() && !loading && (
          <button
            className="btn-secondary"
            style={{ marginTop: 8 }}
            onClick={() => {
              setMessage('我：你今天怎么不理我了？\nTA：没有啊，你想多了。\n我：我只是感觉最近你有点冷淡。\nTA：最近确实比较忙，不是针对你。');
              setContext('Situationship, 3 months, they\'ve been replying slower lately');
            }}
          >
            💡 Try Example
          </button>
        )}
      </div>

      {/* Privacy trust */}
      <div className="privacy-line">
        <p>🔒 Chat Contentnot saved · Ephemeral analysis</p>
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
            🧠 AI 正在AnalysisChat Content…
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
                    '📊 Readlyne Chat Analysis',
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
                    '免费Analysis · Deep Strategy ¥9.9 unlock',
                  ].filter(Boolean).join('\n');
                  navigator.clipboard.writeText(text).then(() => {
                    const btn = document.activeElement as HTMLElement;
                    if (btn) btn.textContent = '✅ has复制';
                    setTimeout(() => { if (btn) btn.textContent = '📋 Copy Results'; }, 2000);
                  });
                }}
              >
                📋 Copy Results
              </button>
            </div>
          )}

          {/* Quick Judgment */}
          {analysis.relationship_signal && (
            <div className="card">
              <div className="section-title">Quick Judgment</div>
              <p className="result-text" style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.6 }}>
                {analysis.relationship_signal.summary}
              </p>
            </div>
          )}

          {/* Possible Meanings */}
          {analysis.possible_intentions && analysis.possible_intentions.length > 0 && (
            <div className="card">
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
            <div className="card">
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
            <div className="card">
              <div className="section-title">Reply Reference</div>
              <div className="suggestion-card">{analysis.reply_suggestions[0].text}</div>
              <p className="text-secondary" style={{ fontSize: 13, marginTop: 4 }}>
                {analysis.reply_suggestions[0].why_this_works}
              </p>
            </div>
          )}

          {/* Next Step */}
          {analysis.next_step && (
            <div className="card">
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

          {/* Premium: Deep Psychological Strategy */}
          {analysis && (
            <div style={{ padding: '0 16px', marginBottom: 8 }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
                Above is the free analysis · $9.99 unlocks <strong>7-section full report</strong>：
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 6, fontSize: 11, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                <span>🧠 心理学框架</span>
                <span>📋 5 条策略</span>
                <span>💬 3 custom replies</span>
                <span>📶 信号预判</span>
              </div>
            </div>
          )}
          {analysis && (
            <div className="premium-card">
              <div className="premium-header">
                <span className="premium-title">Deep Psychological Strategy</span>
                <span className="pro-badge">PRO</span>
              </div>
              <p className="premium-sub">
                Analyzes your chat timeline and goals to decode their communication state and develop psychology-backed strategies.
              </p>

              {!premiumUnlocked && (
                <>
                  <label className="input-label">你希望达到什么目的？</label>
                  <textarea
                    className="text-input"
                    ref={goalRef}
                    rows={2}
                    maxLength={300}
                    placeholder="例如：我喜欢TA但不知道怎么表达，怕被拒绝。"
                    value={userGoal}
                    onChange={(e) => setUserGoal(e.target.value)}
                    style={{ marginBottom: 12, fontSize: 14 }}
                  />
                  <div className="goal-chips">
                    {GOAL_CHIPS.map((chip) => (
                      <span
                        key={chip}
                        className={`goal-chip${userGoal === chip ? ' selected' : ''}`}
                        onClick={() => handleGoalChip(chip)}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                  <button
                    className="btn-primary"
                    onClick={handleDeepStrategy}
                    disabled={premiumLoading || userGoal.trim().length < 2}
                  >
                    {premiumLoading ? 'Analyzing…' : serverCredits > 0 ? `Deep StrategyAnalysis（remaining ${serverCredits} times）` : 'Deep StrategyAnalysis ¥9.9 / 3times →'}
                  </button>
                  {premiumError && (
                    <p style={{ color: '#d70015', fontSize: 13, marginTop: 8, textAlign: 'center' }}>{premiumError}</p>
                  )}

                  {/* Payment modal */}
                  {paymentStep === PAYMENT_MODAL_STEPS.CHOOSE && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--separator)' }}>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px', textAlign: 'center' }}>Deep Psychological Strategy</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 12px', textAlign: 'center' }}>
                        $9.99 = 3 full reports · Each with 7 sections · No expiry
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button
                          className="btn-primary"
                          onClick={() => handlePaymentChoice('alipay')}
                        >
                          ¥9.9 支付宝支付
                        </button>
                        <button
                          className="btn-secondary"
                          disabled
                        >
                          微信支付（即将上线）
                        </button>
                        <button
                          style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: 13, cursor: 'pointer', padding: 8 }}
                          onClick={() => setPaymentStep(PAYMENT_MODAL_STEPS.HIDDEN)}
                        >
                          取消
                        </button>
                      </div>
                      
                      {/* 示例报告预览 */}
                      <SampleReportPreview />
                    </div>
                  )}
                  {paymentStep === PAYMENT_MODAL_STEPS.PROCESSING && (
                    <p style={{ fontSize: 13, textAlign: 'center', color: 'var(--text-secondary)', marginTop: 12 }}>
                      正在跳转支付页面…
                    </p>
                  )}
                </>
              )}

              {premiumReport && (
                <div style={{ marginTop: premiumUnlocked ? 16 : 0 }}>
                  {/* A. Goal Feasibility */}
                  <div className="premium-report-section">
                    <div className="report-section-title">A. Goal Feasibility</div>
                    <p className="report-section-content">{premiumReport.goal_feasibility.assessment}</p>
                    <p className="psychology-note">🧠 {premiumReport.goal_feasibility.psychology_basis}</p>
                  </div>
                  {/* B. 沟通State */}
                  <div className="premium-report-section">
                    <div className="report-section-title">B. Communication State</div>
                    <p className="report-section-content">{premiumReport.target_comm_state.observation}</p>
                    <p className="psychology-note">🧠 {premiumReport.target_comm_state.psychology_basis}</p>
                  </div>
                  {/* C. 时间线 */}
                  <div className="premium-report-section">
                    <div className="report-section-title">C. Timeline & Rhythm</div>
                    <p className="report-section-content">{premiumReport.timeline_analysis.pattern}</p>
                    <p className="psychology-note">🧠 {premiumReport.timeline_analysis.psychology_basis}</p>
                  </div>
                  {/* D. 策略 */}
                  <div className="premium-report-section">
                    <div className="report-section-title">D. 建议策略</div>
                    {premiumReport.strategies.map((s, i) => (
                      <div key={i} style={{ marginBottom: 14 }}>
                        <p className="report-section-content" style={{ fontWeight: 600, marginBottom: 2 }}>
                          {i + 1}. {s.principle}
                        </p>
                        <p className="psychology-note" style={{ marginBottom: 2 }}>🧠 {s.psychology}</p>
                        <p className="report-section-content" style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0' }}>
                          💡 {s.application}
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* E. 回复 */}
                  <div className="premium-report-section">
                    <div className="report-section-title">E. Ready-to-Use Replies (3)</div>
                    {premiumReport.replies.map((r, i) => (
                      <div key={i} style={{ marginBottom: 14 }}>
                        <span className="tag" style={{ background: '#e8f0fe', color: '#0060df', display: 'inline-block', marginBottom: 4 }}>{r.style}</span>
                        <div className="suggestion-card" style={{ margin: 0 }}>{r.text}</div>
                        <p className="psychology-note">🧠 {r.psychology}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                          预期反应: {r.expected_effect}
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* F. 信号 */}
                  <div className="premium-report-section">
                    <div className="report-section-title">F. 发送后观察信号</div>
                    <div className="report-subsection-title">积极信号</div>
                    {premiumReport.signals.positive.map((s, i) => (
                      <p key={i} className="report-section-content" style={{ marginBottom: 4 }}>
                        ✅ {s.signal} <span className="psychology-note">({s.psychology})</span>
                      </p>
                    ))}
                    <div className="report-subsection-title">中性信号</div>
                    {premiumReport.signals.neutral.map((s, i) => (
                      <p key={i} className="report-section-content" style={{ marginBottom: 4 }}>
                        ➖ {s.signal} <span className="psychology-note">({s.psychology})</span>
                      </p>
                    ))}
                    <div className="report-subsection-title">建议后退信号</div>
                    {premiumReport.signals.step_back.map((s, i) => (
                      <p key={i} className="report-section-content" style={{ marginBottom: 4 }}>
                        ⚠️ {s.signal} <span className="psychology-note">({s.psychology})</span>
                      </p>
                    ))}
                  </div>
                  {/* G. 风险 */}
                  <div className="premium-report-section">
                    <div className="report-section-title">G. Risk Alerts</div>
                    <p className="report-section-content" style={{ fontSize: 13, marginBottom: 6 }}>
                      ⚠️ 盲区: {premiumReport.risk_reminder.blind_spots}
                    </p>
                    <p className="report-section-content" style={{ fontSize: 13, marginBottom: 6, color: 'var(--text-secondary)' }}>
                      📋 缺乏证据: {premiumReport.risk_reminder.missing_evidence}
                    </p>
                    <p className="psychology-note">{premiumReport.risk_reminder.principle_reminder}</p>
                  </div>
                </div>
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
                  className="text-input"
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
          <div className="trust-bar">
            <div className="trust-item">
              <span className="trust-icon">🔒</span>
              <span>Privacy Protected</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🤖</span>
              <span>AI Analyzed</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🌱</span>
              <span>Relationship Growth</span>
            </div>
          </div>

          {/* Social proof counter */}
          <UsageCounter />

          {/* Recent history */}
          <AnalysisHistory onSelect={(msg, ctx) => { setMessage(msg); setContext(ctx); }} />

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
