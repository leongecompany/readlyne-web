'use client';

import { useState, useEffect, useCallback } from 'react';

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

export default function AnalyzePage() {
  const [message, setMessage] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (submitting || !message.trim()) return;
    setSubmitting(true);
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-installation-id': localStorage.getItem('readlyne_installation_id') || 'web-anonymous',
        },
        body: JSON.stringify({ message: message.trim(), context: context.trim() }),
      });
      const data = await res.json();
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
      {/* Hero */}
      <div style={{ padding: '40px 16px 0' }}>
        <h1 className="hero-title">看不懂 TA 的话？</h1>
        <p className="hero-sub">粘贴聊天内容，AI 帮你分析潜台词、误读风险和怎么回。</p>
      </div>

      {/* Input */}
      <div className="card">
        <label className="input-label">聊天内容</label>
        <textarea
          className="text-input"
          rows={4}
          placeholder={"我：你今天怎么不理我了\nTA：没有啊，工作忙"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <label className="input-label">
          背景信息 <span className="optional">（选填）</span>
        </label>
        <textarea
          className="text-input"
          rows={2}
          placeholder="例如：认识两个月，最近有点冷淡…"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <button className="btn-primary" onClick={handleSubmit} disabled={loading || !message.trim()}>
          {loading ? '分析中…' : '分析什么意思'}
        </button>
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
              <p className="result-text" style={{ fontSize: 16, fontWeight: 500 }}>
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

          {/* Reply suggestion snippet */}
          {analysis.reply_suggestions && analysis.reply_suggestions.length > 0 && (
            <div className="card">
              <div className="section-title">回复参考</div>
              <div className="suggestion-card">{analysis.reply_suggestions[0].text}</div>
              <p className="text-secondary" style={{ fontSize: 13, marginTop: 4 }}>
                {analysis.reply_suggestions[0].why_this_works}
              </p>
            </div>
          )}
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
            <button className="btn-primary" style={{ marginTop: 8 }}>下载 Readlyne</button>
            <p className="text-tertiary" style={{ fontSize: 12, marginTop: 8 }}>加入内测</p>
          </div>
        </>
      )}
    </div>
  );
}
