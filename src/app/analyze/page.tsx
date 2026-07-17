'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeMessage, deepStrategy, createCheckout, getCredits as fetchServerCredits, claimCredits } from '@/lib/api';

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
  const label = s === 'high' ? '高风险' : s === 'medium' ? '中风险' : '低风险';
  return <span className={`tag ${cls}`}>{label}</span>;
}

const LABEL_MAP: Record<string, string> = {
  '大概率': '大概率', '有可能': '有可能', '小概率': '小概率',
};

// 静态示例报告 — 展示深度策略分析输出格式
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
        {open ? '收起示例 ↑' : '📋 查看完整报告示例'}
      </button>
      {open && (
        <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.7, color: 'var(--text-tertiary)', textAlign: 'left' }}>
          <div style={sampleSectionStyle}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>A. 目标可行性</div>
            <p style={{ margin: 0 }}>基于 Social Penetration Theory（社会渗透理论），当前对话处于表层互动阶段。对方回复简短且未主动展开话题，目标在现有基础上推进关系是可能的，但需要温和节奏。</p>
          </div>
          <div style={sampleSectionStyle}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>B. 对方可能的沟通状态</div>
            <p style={{ margin: 0 }}>根据 Self-Verification Theory，对方倾向于保持现有的轻松互动模式。目前的沟通信号为中性偏积极，没有拒绝信号但也没有主动推进迹象。</p>
          </div>
          <div style={sampleSectionStyle}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>C. 时间线与互动节奏</div>
            <p style={{ margin: 0 }}>回复间隔较长（平均 &gt;3h），双方均未在一小时内连续回复。符合 Mere Exposure Effect 的渐进模式——持续温和曝光比密集互动更有效。</p>
          </div>
          <div style={sampleSectionStyle}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>D. 建议策略（5条）</div>
            <p style={{ margin: 0 }}>基于 Reciprocity（互惠原则）+ Attachment Theory 安全型沟通模式的策略建议，每条附带可操作的具体话术方向。</p>
          </div>
          <div style={sampleSectionStyle}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>E. 三种可直接使用的回复</div>
            <p style={{ margin: 0 }}>稳妥版 / 自然推进版 / 明确确认版，每种附为何有效的心理学依据。</p>
          </div>
          <div style={sampleSectionStyle}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>F-G. 观察信号 + 风险提醒</div>
            <p style={{ margin: 0 }}>发送后如何判断对方反应（积极/中性/后退信号），以及过度解读的边界提醒。</p>
          </div>
          <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text)', textAlign: 'center', fontWeight: 500 }}>
            ¥9.9 解锁真实分析报告
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

  const GOAL_CHIPS = [
    '确认对方态度', '推进关系', '缓和矛盾', '重新开启话题',
    '建立边界', '推进合作', '自然结束关系',
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

  // 服务端 credit 状态
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
      // 有剩余次数，服务端校验消耗
      setPaymentStep(PAYMENT_MODAL_STEPS.HIDDEN);
      setPremiumLoading(true);
      setPremiumReport(null);
      setPremiumError('');
      try {
        const data = await deepStrategy({ message, context, userGoal: userGoal.trim() });
        if (!data.ok) {
          if (data.error === 'NO_CREDITS') {
            // 服务端拒绝 — refresh credits
            loadServerCredits();
            setPaymentStep(PAYMENT_MODAL_STEPS.CHOOSE);
          } else {
            setPremiumError(data.error || '分析失败');
          }
          setPremiumLoading(false);
          return;
        }
        setPremiumReport(data.report);
        setPremiumUnlocked(true);
        setServerCredits(data.credits_remaining ?? Math.max(0, serverCredits - 1));
      } catch { setPremiumError('网络异常'); }
      finally { setPremiumLoading(false); }
    } else {
      // 没有剩余次数，显示支付
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
          setPremiumError('支付功能尚未配置，请设置 Stripe 密钥');
          return;
        }
        setPremiumError(checkout.message || '支付服务暂不可用');
        setPremiumLoading(false);
        return;
      }
      // 跳转到 Stripe Checkout（支付宝扫码/跳转）
      window.location.href = checkout.url;
    } catch (e) {
      setPremiumError('网络异常，请稍后重试');
      setPremiumLoading(false);
      setPaymentStep(PAYMENT_MODAL_STEPS.HIDDEN);
    }
  }, [message, context, userGoal, premiumLoading]);

  // Stripe 支付返回处理 — 用 session_id 向服务端验证
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      // 清除 URL 参数
      window.history.replaceState({}, '', window.location.pathname);

      // 向服务端验证支付状态并获取 credits
      claimCredits(sessionId).then((result) => {
        if (result.ok) {
          setServerCredits(result.credits);
          // 恢复待处理的分析
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
      const data = await analyzeMessage(message, context);
      if (!data.ok) {
        setError(data.error || '分析失败，请稍后重试');
        return;
      }
      setAnalysis(data.analysis);
    } catch {
      setError('网络连接异常，请检查后重试');
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
        <span className="brand-tag">聊天洞察 AI</span>
      </div>

      {/* Hero */}
      <div style={{ padding: '20px 16px 0' }}>
        <h1 className="hero-title">看不懂 TA 的话？</h1>
        <p className="hero-sub">一句话，看懂 TA 真正想表达什么。</p>
      </div>

      {/* Input */}
      <div className="card">
        <label className="input-label">聊天内容</label>
        <textarea
          className="text-input"
          ref={msgRef}
          rows={3}
          placeholder={"我：你今天怎么不理我了？\nTA：没有啊，最近工作比较忙。"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <label className="input-label">
          背景信息 <span className="optional">（选填）</span>
        </label>
        <textarea
          className="text-input"
          ref={ctxRef}
          rows={2}
          placeholder="例如：认识两个月，最近感觉有点冷淡…"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <button className="btn-primary" onClick={handleSubmit} disabled={loading || !message.trim()}>
          {loading ? '分析中…' : '分析什么意思'}
        </button>
      </div>

      {/* Privacy trust */}
      <div className="privacy-line">
        <p>🔒 默认不长期保存原始聊天内容</p>
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
          <div className="skeleton" style={{ width: '40%' }} />
          <div className="skeleton" style={{ width: '85%' }} />
          <div className="skeleton" style={{ width: '60%' }} />
          <div className="skeleton" style={{ width: '30%' }} />
        </div>
      )}

      {/* Results */}
      {analysis && !loading && (
        <div style={{ marginTop: 4 }}>
          {/* 直观判断 */}
          {analysis.relationship_signal && (
            <div className="card">
              <div className="section-title">直观判断</div>
              <p className="result-text" style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.6 }}>
                {analysis.relationship_signal.summary}
              </p>
            </div>
          )}

          {/* 可能含义 */}
          {analysis.possible_intentions && analysis.possible_intentions.length > 0 && (
            <div className="card">
              <div className="section-title">可能含义</div>
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

          {/* 误读风险 */}
          {analysis.communication_risks && analysis.communication_risks.length > 0 && (
            <div className="card">
              <div className="section-title">误读风险</div>
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

          {/* 回复参考 */}
          {analysis.reply_suggestions && analysis.reply_suggestions.length > 0 && (
            <div className="card">
              <div className="section-title">回复参考</div>
              <div className="suggestion-card">{analysis.reply_suggestions[0].text}</div>
              <p className="text-secondary" style={{ fontSize: 13, marginTop: 4 }}>
                {analysis.reply_suggestions[0].why_this_works}
              </p>
            </div>
          )}

          {/* 下一步 */}
          {analysis.next_step && (
            <div className="card">
              <div className="section-title">下一步</div>
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

          {/* Premium: 深度心理学策略分析 */}
          {analysis && (
            <div className="premium-card">
              <div className="premium-header">
                <span className="premium-title">深度心理学策略分析</span>
                <span className="pro-badge">PRO</span>
              </div>
              <p className="premium-sub">
                结合完整聊天时间线和你的目标，分析对方可能的沟通状态，并制定心理学应用策略。
              </p>

              {!premiumUnlocked && (
                <>
                  <label className="input-label">你希望达到什么目的？</label>
                  <textarea
                    className="text-input"
                    ref={goalRef}
                    rows={2}
                    maxLength={300}
                    placeholder="例如：我想推进合作，但不希望显得太急。"
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
                    {premiumLoading ? '分析中…' : serverCredits > 0 ? `深度策略分析（剩余 ${serverCredits} 次）` : '深度策略分析 ¥9.9 / 3次 →'}
                  </button>
                  {premiumError && (
                    <p style={{ color: '#d70015', fontSize: 13, marginTop: 8, textAlign: 'center' }}>{premiumError}</p>
                  )}

                  {/* 支付选择弹窗 */}
                  {paymentStep === PAYMENT_MODAL_STEPS.CHOOSE && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--separator)' }}>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px', textAlign: 'center' }}>选择支付方式</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button
                          className="btn-primary"
                          onClick={() => handlePaymentChoice('alipay')}
                        >
                          3次套餐 ¥9.9 · 支付宝
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
                  {/* A. 目标可行性 */}
                  <div className="premium-report-section">
                    <div className="report-section-title">A. 目标可行性</div>
                    <p className="report-section-content">{premiumReport.goal_feasibility.assessment}</p>
                    <p className="psychology-note">🧠 {premiumReport.goal_feasibility.psychology_basis}</p>
                  </div>
                  {/* B. 沟通状态 */}
                  <div className="premium-report-section">
                    <div className="report-section-title">B. 对方可能的沟通状态</div>
                    <p className="report-section-content">{premiumReport.target_comm_state.observation}</p>
                    <p className="psychology-note">🧠 {premiumReport.target_comm_state.psychology_basis}</p>
                  </div>
                  {/* C. 时间线 */}
                  <div className="premium-report-section">
                    <div className="report-section-title">C. 时间线与互动节奏</div>
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
                    <div className="report-section-title">E. 三种可直接使用的回复</div>
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
                    <div className="report-section-title">G. 风险提醒</div>
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
            <p className="cta-title">想让 Readlyne 记住这个人？</p>
            <p className="cta-desc">
              下载 App 建立关系档案，<br />
              让后续分析越来越贴合你们的互动。
            </p>
            <div className="cta-buttons">
              <button
                className="btn-primary"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                回到顶部开始分析
              </button>
              <button
                className="btn-secondary"
                onClick={() => window.open('https://github.com/leongecompany/readlyne-web/issues', '_blank')}
              >
                反馈建议
              </button>
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
              <span>隐私保护</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🤖</span>
              <span>AI 分析</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🌱</span>
              <span>关系成长</span>
            </div>
          </div>

          {/* App promo */}
          <div className="app-promo">
            <p>更多功能在 App 中</p>
            <div className="app-name">Readlyne</div>
            <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>开始分析 →</button>
            <p className="text-tertiary" style={{ fontSize: 12, marginTop: 8 }}>加入内测</p>
          </div>
        </>
      )}
    </div>
  );
}
