'use client';

import { useState, useCallback } from 'react';

type ReplySuggestion = {
  style: string;
  text: string;
  why_this_works: string;
  risk_note: string;
};

type ReplyResult = {
  reply_suggestions?: ReplySuggestion[];
  communication_risks?: { risk: string; suggestion: string; severity: string }[];
  next_step?: { action: string; reason: string; boundary_note?: string };
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

export default function ReplyPage() {
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ReplyResult | null>(null);

  const handleSubmit = useCallback(async () => {
    if (loading || !input.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-installation-id': localStorage.getItem('readlyne_installation_id') || 'web-anonymous',
        },
        body: JSON.stringify({
          message: input.trim(),
          context: context.trim(),
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || '请求失败，请稍后重试');
        return;
      }
      // Use the same analysis but render as reply suggestions
      const analysis = data.analysis;
      setResult({
        reply_suggestions: analysis.reply_suggestions,
        communication_risks: analysis.communication_risks,
        next_step: analysis.next_step,
      });
    } catch {
      setError('网络连接异常，请检查后重试');
    } finally {
      setLoading(false);
    }
  }, [input, context, loading]);

  return (
    <div>
      <div className="page-header">
        <h1>怎么回</h1>
        <p>描述场景，AI 给你不同风格的回复建议</p>
      </div>

      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
            对方说了什么
          </label>
          <textarea
            className="text-input"
            rows={4}
            placeholder="粘贴对方最后一条消息或描述场景…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
            背景 <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>选填</span>
          </label>
          <textarea
            className="text-input"
            rows={2}
            placeholder="例如：暧昧期，前天因为小事吵了一架…"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading || !input.trim()}>
          {loading ? '生成中…' : '生成回复'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 20px', background: '#fff5f5', borderBottom: '1px solid #ffd7d5' }}>
          <p style={{ color: '#d70015', fontSize: 14, margin: 0 }}>{error}</p>
        </div>
      )}

      {loading && (
        <div style={{ padding: 20 }}>
          <div className="skeleton" style={{ width: '30%' }} />
          <div className="skeleton" style={{ width: '90%', height: 60 }} />
          <div className="skeleton" style={{ width: '50%' }} />
          <div className="skeleton" style={{ width: '80%', height: 60 }} />
          <div className="skeleton" style={{ width: '40%' }} />
        </div>
      )}

      {result && !loading && (
        <div>
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
                      📋 复制
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
                    <span className={`tag ${item.severity === 'high' ? 'tag-high' : item.severity === 'medium' ? 'tag-medium' : 'tag-low'}`}>
                      {item.severity === 'high' ? '高风险' : item.severity === 'medium' ? '中风险' : '低风险'}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.risk}</span>
                  </div>
                  <p className="text-secondary" style={{ fontSize: 13, margin: 0 }}>{item.suggestion}</p>
                </div>
              ))}
            </div>
          )}

          {/* Next step */}
          {result.next_step && (
            <div className="card">
              <div className="section-title">下一步</div>
              <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{result.next_step.action}</p>
              <p className="text-secondary" style={{ fontSize: 13, margin: 0 }}>{result.next_step.reason}</p>
              {result.next_step.boundary_note && (
                <p className="text-secondary" style={{ fontSize: 12, marginTop: 6, fontStyle: 'italic' }}>
                  {result.next_step.boundary_note}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {!result && !loading && !error && (
        <div className="empty-state">
          <div className="icon">✍️</div>
          <h2>想好怎么回了？</h2>
          <p>告诉我们对方的消息，<br />AI 帮你生成回复</p>
        </div>
      )}
    </div>
  );
}
