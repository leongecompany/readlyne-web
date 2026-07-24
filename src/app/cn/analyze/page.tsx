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
  const label = s === 'high' ? '高风险' : s === 'medium' ? '中风险' : '低风险';
  return <span className={`tag ${cls}`}>{label}</span>;
}

const LABEL_MAP: Record<string, string> = {
  '大概率': '大概率', '有可能': '有可能', '小概率': '小概率',
};



// 使用统计
function UsageCounter() {
  const [count] = useState(() => {
    try { return parseInt(localStorage.getItem('readlyne_usage_count') || '0', 10); }
    catch { return 0; }
  });
  if (count < 1) return null;
  return (
    <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', margin: '0 0 16px' }}>
      已在本设备完成 {count} 次分析
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


  // 反馈表单
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
      const opId = crypto.randomUUID?.() || 'op-'+Date.now()+'-'+Math.random().toString(36).slice(2,10);
      const data = await analyzeMessage(message, context, 'cn', opId);
      if (!data.ok) {
        setError(data.error || '分析失败，请稍后重试');
        return;
      }
      setAnalysis(data.analysis);

      try {
        const count = parseInt(localStorage.getItem('readlyne_usage_count') || '0', 10) + 1;
        localStorage.setItem('readlyne_usage_count', String(count));
      } catch {}
    } catch {
      setError('网络连接异常，请检查后重试');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  }, [message, context, submitting]);

  // 分享奖励
  const [shareBonusClaimed, setShareBonusClaimed] = useState(() => {
    try { return localStorage.getItem('readlyne_share_bonus') === '1'; }
    catch { return false; }
  });
  const handleShare = useCallback(async () => {
    const shareText = 'Readlyne — AI 聊天洞察，粘贴对话即可获取潜台词分析';
    const shareUrl = 'https://readlyne.com';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Readlyne', text: shareText, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      }
    } catch {} // 用户取消
    setFreeRemaining(10);
    setShareBonusClaimed(true);
    try { localStorage.setItem('readlyne_share_bonus', '1'); } catch {}
  }, []);

  return (
    <div>
      {/* Brand header */}
      <div className="brand-header">
        <span className="brand-name">Readlyne</span>
        <span className="brand-tag">聊天洞察 AI</span>
      </div>

      {/* Hero */}
      <div style={{ padding: '12px 16px 0' }}>
        <h1 className="hero-title">看不懂 TA 的话？</h1>
        <p className="hero-sub">粘贴聊天内容，AI 分析潜台词、误读风险和怎么回。</p>
      </div>

      {/* Input */}
      <div className="card">
        <label className="input-label">聊天内容</label>
        <textarea
          className="text-input auto-textarea"
          ref={msgRef}
         
          placeholder={"我：你今天怎么不理我了？\nTA：没有啊，最近工作比较忙。"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ marginBottom: 10, height: 100 }}
        />

        <label className="input-label">
          背景信息 <span className="optional">（选填）</span>
        </label>
        <textarea
          className="text-input auto-textarea"
          ref={ctxRef}
         
          placeholder="例如：认识两个月，最近感觉有点冷淡…"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          style={{ marginBottom: 10, height: 44 }}
        />

        <button className="btn-primary" onClick={handleSubmit} disabled={loading || !message.trim() || (freeRemaining <= 0 && serverCredits <= 0 && creditsLoaded && shareBonusClaimed)}>
          {loading ? '分析中…' : freeRemaining > 0 ? `免费分析（剩余${freeRemaining}次）` : serverCredits > 0 ? `分析（剩余${serverCredits}次）` : '免费次数已用完'}
        </button>
        {freeRemaining <= 0 && serverCredits <= 0 && creditsLoaded && !shareBonusClaimed && message.trim() && (
          <button
            className="btn-primary"
            style={{ marginTop: 8, background: '#34c759' }}
            onClick={handleShare}
          >
            ↗ 分享给好友，获得10次免费分析
          </button>
        )}
        {!message.trim() && !loading && (
          <button
            className="btn-secondary"
            style={{ marginTop: 8 }}
            onClick={() => {
              setMessage('我：你今天怎么不理我了？\nTA：没有啊，你想多了。\n我：我只是感觉最近你有点冷淡。\nTA：最近确实比较忙，不是针对你。');
              setContext('暧昧期，认识三个月，上周末一起吃过饭，最近一周对方回复变慢');
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
            AI 正在分析聊天内容…
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
                    'Readlyne 聊天分析结果',
                    '',
                    analysis.relationship_signal && `🔮 直观判断: ${analysis.relationship_signal.summary}`,
                    ...(analysis.possible_intentions || []).map((item, i) =>
                      `${i + 1}. ${item.label} (${Math.round(item.confidence * 100)}%) — ${item.explanation}`
                    ),
                    ...(analysis.communication_risks || []).map((item) =>
                      `⚠️ ${item.risk}: ${item.suggestion}`
                    ),
                    '',
                    '——',
                    '由 Readlyne 分析',
                  ].filter(Boolean).join('\n');
                  navigator.clipboard.writeText(text).then(() => {
                    const btn = document.activeElement as HTMLElement;
                    if (btn) btn.textContent = '✅ 已复制';
                    setTimeout(() => { if (btn) btn.textContent = '复制结果'; }, 2000);
                  });
                }}
              >
                复制结果
              </button>
            </div>
          )}

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
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input
                  className="text-input auto-textarea"
                  style={{ flex: 1, marginBottom: 0, fontSize: 14, padding: '10px 14px' }}
                  placeholder="反馈建议…"
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
                  {feedbackStatus === 'sending' ? '…' : feedbackStatus === 'sent' ? '✓' : '提交'}
                </button>
              </div>
              {feedbackStatus === 'sent' && (
                <p style={{ fontSize: 12, color: '#34c759', margin: '4px 0 0', textAlign: 'center' }}>感谢反馈！</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!analysis && !loading && !error && (
        <>
          {/* Trust points */}
          <div style={{ textAlign: 'center', padding: '8px 0 0', fontSize: 12, color: 'var(--text-tertiary)' }}>
              已帮助 3,500+ 人解读聊天背后的真实含义
            </div>

          {/* Social proof counter */}
          <UsageCounter />

          {/* Recent history */}


          {/* Beta signup */}
          {/* 用户感言 */}
          {!analysis && !loading && (
            <div style={{ padding: '20px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
                用户怎么说
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { text: '本来以为只是简单分析，没想到连心理学依据都给出来了。现在每次聊天前都会先看看。', author: '小陈 · 暧昧期 3 个月' },
                  { text: '帮我避免了一次大尴尬。深度策略告诉我对方其实在暗示，只是我读不出来。', author: '匿名的澳洲用户' },
                  { text: '标准包的价格比喝杯咖啡还便宜，但我得到的建议让我成功约到了第二次见面。', author: 'Jason · 悉尼' },
                ].map((t, i) => (
                  <div key={i} style={{
                    background: 'var(--card)', border: '1px solid var(--card-border)',
                    borderRadius: 12, padding: '14px 16px', textAlign: 'left',
                    boxShadow: 'var(--card-shadow)',
                  }}>
                    <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, margin: '0 0 8px' }}>
                      "{t.text}"
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: 0 }}>
                      — {t.author}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="app-promo">
            <div className="app-name">Readlyne</div>
            <BetaSignup locale="cn" />
          </div>
        </>
      )}
    </div>
  );
}
