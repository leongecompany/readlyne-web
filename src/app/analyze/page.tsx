'use client';

import { useState, useEffect, useCallback } from 'react';
import { analyzeMessage, getReport, createCheckout } from '@/lib/api';

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
  // New deep fields
  timeline_rhythm?: string;
  emotional_changes?: string;
  initiative_avoidance?: string;
  relationship_risks?: string[];
};

const LABEL_MAP: Record<string, string> = {
  conservative: '保守回复',
  natural: '自然回复',
  active: '主动回复',
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

// Locked preview component
function LockedSection({ height = 200 }: { height?: number }) {
  return (
    <div className="locked-section card" style={{ padding: 0 }}>
      <div style={{ height, background: 'var(--bg-secondary)', filter: 'blur(4px)', padding: 16 }}>
        <div className="skeleton" style={{ width: '60%' }} />
        <div className="skeleton" style={{ width: '90%' }} />
        <div className="skeleton" style={{ width: '40%' }} />
        <div className="skeleton" style={{ width: '75%' }} />
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
  const [reportId, setReportId] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Check URL params for payment return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rid = params.get('report_id');
    const paid = params.get('paid');
    if (rid && paid === 'true') {
      setReportId(rid);
      setIsPaid(true);
      // Fetch updated report
      getReport(rid).then((data) => {
        if (data.ok && data.analysis) {
          setAnalysis(data.analysis);
        }
      }).catch(() => {});
      // Clean URL
      window.history.replaceState({}, '', '/analyze');
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitting || !message.trim()) return;
    setSubmitting(true);
    setLoading(true);
    setError('');
    setAnalysis(null);
    setReportId(null);
    setIsPaid(false);

    try {
      const data = await analyzeMessage(message, context);
      if (!data.ok) {
        setError(data.error || '分析失败，请稍后重试');
        return;
      }
      setAnalysis(data.analysis);
      setReportId(data.report_id);
      setIsPaid(false);
    } catch {
      setError('网络连接异常，请检查后重试');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  }, [message, context, submitting]);

  const handleUnlock = useCallback(async () => {
    if (!reportId || checkoutLoading) return;
    setCheckoutLoading(true);
    try {
      const data = await createCheckout(reportId);
      if (data.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError('创建支付失败，请稍后重试');
      }
    } catch {
      setError('支付服务异常，请稍后重试');
    } finally {
      setCheckoutLoading(false);
    }
  }, [reportId, checkoutLoading]);

  const hasDeepContent = analysis?.timeline_rhythm || analysis?.emotional_changes ||
    analysis?.initiative_avoidance || analysis?.relationship_risks ||
    analysis?.reply_suggestions || analysis?.next_step;

  return (
    <div>
      <div className="page-header">
        <h1>分析</h1>
        <p>粘贴一段对话，AI 帮你理解对方的意思</p>
      </div>

      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
            对话内容
          </label>
          <textarea
            className="text-input"
            rows={4}
            placeholder="粘贴聊天内容…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
            背景 <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>选填</span>
          </label>
          <textarea
            className="text-input"
            rows={2}
            placeholder="例如：认识两个月，最近有点冷淡…"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading || !message.trim()}>
          {loading ? '分析中…' : '开始分析'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 20px', background: '#fff5f5', borderBottom: '1px solid #ffd7d5' }}>
          <p style={{ color: '#d70015', fontSize: 14, margin: 0 }}>{error}</p>
        </div>
      )}

      {loading && (
        <div style={{ padding: 20 }}>
          <div className="skeleton" style={{ width: '40%' }} />
          <div className="skeleton" style={{ width: '85%' }} />
          <div className="skeleton" style={{ width: '60%' }} />
          <div className="skeleton" style={{ width: '30%' }} />
        </div>
      )}

      {/* Paid banner */}
      {isPaid && (
        <div className="banner-paid">
          ✅ 深度报告已解锁
        </div>
      )}

      {/* Results */}
      {analysis && !loading && (
        <div>
          {/* — Free sections — */}

          {/* 直观判断 */}
          {analysis.relationship_signal && (
            <div className="card">
              <div className="section-title">直观判断</div>
              <p className="result-text" style={{ fontSize: 16, fontWeight: 500 }}>
                {analysis.relationship_signal.summary}
              </p>
              <span className="tag tag-info" style={{ marginTop: 4 }}>
                置信度 {analysis.relationship_signal.confidence === 'high' ? '高' :
                        analysis.relationship_signal.confidence === 'medium' ? '中' : '低'}
              </span>
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

          {/* 简单回复建议 (free) */}
          {analysis.reply_suggestions && analysis.reply_suggestions.length > 0 && isPaid === false && (
            <div className="card">
              <div className="section-title">简单回复建议</div>
              {analysis.reply_suggestions.slice(0, 1).map((item, i) => (
                <div key={i}>
                  <span className="tag" style={{
                    background: '#e8f5e9', color: '#248a3d', marginBottom: 8, display: 'inline-block',
                  }}>
                    参考
                  </span>
                  <div className="suggestion-card">{item.text}</div>
                  <p className="text-secondary" style={{ fontSize: 13 }}>{item.why_this_works}</p>
                </div>
              ))}
              <p className="text-tertiary" style={{ fontSize: 13, marginTop: 8 }}>
                💡 更多回复风格已锁定
              </p>
            </div>
          )}

          {/* — Deep / Locked sections — */}
          {!isPaid && reportId && (
            <div className="card" style={{ borderTop: '8px solid var(--bg-secondary)', textAlign: 'center', padding: '24px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🔒</div>
              <p style={{ fontSize: 17, fontWeight: 600, margin: '0 0 4px' }}>解锁深度分析</p>
              <p className="text-secondary" style={{ fontSize: 14, margin: '0 0 16px' }}>
                包含时间线节奏、情绪变化、主动性判断<br />
                3 种回复风格、下一步建议
              </p>
              <button className="btn-secondary" onClick={handleUnlock} disabled={checkoutLoading}>
                {checkoutLoading ? '跳转中…' : '¥9.9 解锁深度分析'}
              </button>
            </div>
          )}

          {/* — Paid unlocked deep content — */}
          {isPaid && (
            <div>
              {/* 时间线节奏 */}
              {analysis.timeline_rhythm && (
                <div className="card">
                  <div className="section-title">时间线节奏</div>
                  <p className="result-text">{analysis.timeline_rhythm}</p>
                </div>
              )}

              {/* 情绪变化 */}
              {analysis.emotional_changes && (
                <div className="card">
                  <div className="section-title">情绪变化</div>
                  <p className="result-text">{analysis.emotional_changes}</p>
                </div>
              )}

              {/* 主动性/回避性 */}
              {analysis.initiative_avoidance && (
                <div className="card">
                  <div className="section-title">主动性 / 回避性判断</div>
                  <p className="result-text">{analysis.initiative_avoidance}</p>
                </div>
              )}

              {/* 关系风险点 */}
              {analysis.relationship_risks && analysis.relationship_risks.length > 0 && (
                <div className="card">
                  <div className="section-title">关系风险点</div>
                  {analysis.relationship_risks.map((r, i) => (
                    <div key={i} style={{
                      padding: '8px 0', borderTop: i > 0 ? '1px solid var(--separator)' : 'none',
                      fontSize: 14, color: 'var(--text)',
                    }}>
                      ⚠️ {r}
                    </div>
                  ))}
                </div>
              )}

              {/* Full reply suggestions — 3 styles */}
              {analysis.reply_suggestions && analysis.reply_suggestions.length > 0 && (
                <div className="card">
                  <div className="section-title">回复建议</div>
                  {analysis.reply_suggestions.map((item, i) => {
                    const colors = STYLE_COLORS[item.style] || { bg: '#f5f5f7', color: 'var(--text-secondary)' };
                    return (
                      <div key={i} style={{ padding: '10px 0', borderTop: i > 0 ? '1px solid var(--separator)' : 'none' }}>
                        <span className="tag" style={{ background: colors.bg, color: colors.color, display: 'inline-block', marginBottom: 8 }}>
                          {LABEL_MAP[item.style] || item.style}
                        </span>
                        <div className="suggestion-card">{item.text}</div>
                        <p className="text-secondary" style={{ fontSize: 13, margin: '4px 0' }}>
                          ✅ {item.why_this_works}
                        </p>
                        {item.risk_note && (
                          <p className="text-secondary" style={{ fontSize: 12, fontStyle: 'italic', margin: 0 }}>
                            ⚠️ {item.risk_note}
                          </p>
                        )}
                        <button
                          className="tag tag-info"
                          style={{ border: 'none', cursor: 'pointer', marginTop: 8 }}
                          onClick={() => navigator.clipboard.writeText(item.text)}
                        >
                          📋 复制
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Next step */}
              {analysis.next_step && (
                <div className="card">
                  <div className="section-title">下一步建议</div>
                  <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{analysis.next_step.action}</p>
                  <p className="text-secondary" style={{ fontSize: 13, margin: 0 }}>
                    {analysis.next_step.reason}
                  </p>
                  {analysis.next_step.boundary_note && (
                    <p className="text-secondary" style={{ fontSize: 12, marginTop: 6, fontStyle: 'italic' }}>
                      {analysis.next_step.boundary_note}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Safety warning */}
          {analysis.relationship_signal?.summary?.includes('风险') && !isPaid && null}
        </div>
      )}

      {!analysis && !loading && !error && (
        <div className="empty-state">
          <div className="icon">💬</div>
          <h2>开始一段分析</h2>
          <p>粘贴你收到的消息，<br />AI 会帮你分析对方真正的意思</p>
        </div>
      )}
    </div>
  );
}
