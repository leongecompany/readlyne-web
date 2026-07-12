'use client';

import { useState, useCallback } from 'react';
import { getReplySuggestions } from '@/lib/api';

type ReplySuggestion = { style: string; text: string; why_this_works: string; risk_note: string };
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
      const data = await getReplySuggestions(input, context);
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
    }
  }, [input, context, loading]);

  return (
    <div>
      <div style={{ padding: '40px 16px 0' }}>
        <h1 className="hero-title">不知道怎么回？</h1>
        <p className="hero-sub">描述场景，AI 给你 3 种不同风格的回复。</p>
      </div>

      {/* Input */}
      <div className="card">
        <label className="input-label">想回应的内容</label>
        <textarea
          className="text-input"
          rows={4}
          placeholder="对方说了什么？或者描述一下你现在的情况…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <label className="input-label">
          背景信息 <span className="optional">（选填）</span>
        </label>
        <textarea
          className="text-input"
          rows={2}
          placeholder="例如：暧昧期，前天因为小事吵了一架…"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <button className="btn-primary" onClick={handleSubmit} disabled={loading || !input.trim()}>
          {loading ? '生成中…' : '怎么回比较好'}
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
          <div className="skeleton" style={{ width: '30%' }} />
          <div className="skeleton" style={{ width: '90%', height: 60 }} />
          <div className="skeleton" style={{ width: '50%' }} />
          <div className="skeleton" style={{ width: '80%', height: 60 }} />
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div style={{ marginTop: 4 }}>
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

          {result.next_step && (
            <div className="card">
              <div className="section-title">下一步</div>
              <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{result.next_step.action}</p>
              <p className="text-secondary" style={{ fontSize: 13, margin: 0 }}>{result.next_step.reason}</p>
            </div>
          )}
        </div>
      )}

      {/* Empty */}
      {!result && !loading && !error && (
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
      )}
    </div>
  );
}
