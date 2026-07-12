'use client';

import { useState } from 'react';
import { generateAdvice } from '@/lib/api';

type ReplySuggestion = {
  style: string;
  text: string;
  why_this_works: string;
  risk_note: string;
};

type AdviceResult = {
  relationship_signal?: { summary: string; confidence: string; evidence_refs: string[] };
  reply_suggestions?: ReplySuggestion[];
  communication_risks?: { risk: string; suggestion: string; severity: string }[];
  next_step?: { action: string; reason: string; boundary_note: string };
  safety?: { is_high_risk: boolean; risk_type: string; safe_response_mode: boolean };
};

const STYLE_LABELS: Record<string, string> = {
  conservative: '保守',
  natural: '自然',
  active: '主动',
};

const STYLE_COLORS: Record<string, { bg: string; color: string }> = {
  conservative: { bg: '#1a2a1a', color: '#6bcb6b' },
  natural: { bg: '#1a1a2a', color: '#5b8bf9' },
  active: { bg: '#2a1a2a', color: '#d96bcb' },
};

export default function ReplyPage() {
  const [message, setMessage] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AdviceResult | null>(null);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await generateAdvice(message.trim(), message.trim(), context.trim());
      if (!data.ok) {
        setError(data.error || '请求失败');
        return;
      }
      try {
        const parsed = JSON.parse(data.content);
        setResult(parsed.analysis_result || parsed);
      } catch {
        setError('AI 返回格式异常，请稍后重试');
      }
    } catch {
      setError('网络错误，请检查网络后重试');
    } finally {
      setLoading(false);
    }
  };

  const severityClass = (s: string) => {
    if (s === 'high') return 'label-high';
    if (s === 'medium') return 'label-medium';
    return 'label-low';
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>💬 怎么回</h1>
      <p className="text-dim" style={{ fontSize: 13, marginBottom: 16 }}>
        描述你想回应的场景，AI 给你 3 个档位的回复建议
      </p>

      <div className="card">
        <label style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 6, display: 'block' }}>
          想回应的内容或场景
        </label>
        <textarea
          className="text-input"
          rows={4}
          placeholder="对方说了什么？或者描述一下现在的情况…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="card">
        <label style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 6, display: 'block' }}>
          背景信息 <span className="text-dim" style={{ fontWeight: 400 }}>（选填）</span>
        </label>
        <textarea
          className="text-input"
          rows={3}
          placeholder="例如：和对方在暧昧期，这次聊天是因为前天吵架了…"
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={loading || !message.trim()}>
        {loading ? '生成中…' : '生成回复'}
      </button>

      {error && (
        <div className="card" style={{ borderColor: '#5a1a1a', marginTop: 12 }}>
          <p style={{ color: '#ff6b6b', fontSize: 14, margin: 0 }}>{error}</p>
        </div>
      )}

      {loading && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="skeleton" style={{ width: '50%' }} />
          <div className="skeleton" style={{ width: '85%' }} />
          <div className="skeleton" style={{ width: '70%' }} />
          <div className="skeleton" style={{ width: '30%' }} />
          <div className="skeleton" style={{ width: '80%' }} />
          <div className="skeleton" style={{ width: '45%' }} />
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          {/* Relationship Signal */}
          {result.relationship_signal && (
            <div className="card">
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>当前关系信号</h2>
              <p className="result-text" style={{ fontSize: 15 }}>
                {result.relationship_signal.summary}
              </p>
            </div>
          )}

          {/* Reply Suggestions */}
          {result.reply_suggestions && result.reply_suggestions.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>回复建议</h2>
              {result.reply_suggestions.map((item, i) => {
                const colors = STYLE_COLORS[item.style] || STYLE_COLORS.natural;
                return (
                  <div key={i} style={{
                    padding: '12px 0',
                    borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  }}>
                    <span className="label-tag" style={{
                      background: colors.bg,
                      color: colors.color,
                      marginBottom: 8,
                      display: 'inline-block',
                      fontSize: 12,
                    }}>
                      {STYLE_LABELS[item.style] || item.style}
                    </span>
                    <div style={{
                      background: '#141414',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: '12px 14px',
                      margin: '8px 0',
                      fontSize: 15,
                      lineHeight: 1.5,
                      color: '#fff',
                    }}>
                      {item.text}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: '0 0 4px' }}>
                      ✅ {item.why_this_works}
                    </p>
                    {item.risk_note && (
                      <p style={{ fontSize: 12, color: '#ffd93d', margin: 0 }}>
                        ⚠️ {item.risk_note}
                      </p>
                    )}
                    <button
                      className="label-tag"
                      style={{
                        background: 'var(--border)',
                        color: 'var(--text-dim)',
                        border: 'none',
                        cursor: 'pointer',
                        marginTop: 8,
                        fontSize: 11,
                      }}
                      onClick={() => navigator.clipboard.writeText(item.text)}
                    >
                      📋 复制
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Risks */}
          {result.communication_risks && result.communication_risks.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>沟通风险</h2>
              {result.communication_risks.map((item, i) => (
                <div key={i} style={{
                  padding: '10px 0',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span className={`label-tag ${severityClass(item.severity)}`}>
                      {item.severity === 'high' ? '高' : item.severity === 'medium' ? '中' : '低'}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.risk}</span>
                  </div>
                  <p className="text-dim" style={{ fontSize: 13, margin: 0 }}>{item.suggestion}</p>
                </div>
              ))}
            </div>
          )}

          {/* Next Step */}
          {result.next_step && (
            <div className="card">
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>下一步建议</h2>
              <p style={{ fontSize: 14, marginBottom: 4 }}>{result.next_step.action}</p>
              <p className="text-dim" style={{ fontSize: 13, margin: 0 }}>
                {result.next_step.reason}
              </p>
              {result.next_step.boundary_note && (
                <p className="text-dim" style={{ fontSize: 12, marginTop: 6, fontStyle: 'italic' }}>
                  {result.next_step.boundary_note}
                </p>
              )}
            </div>
          )}

          {/* Safety */}
          {result.safety?.is_high_risk && (
            <div className="card" style={{ borderColor: '#5a1a1a' }}>
              <p style={{ color: '#ff6b6b', fontSize: 14, margin: 0 }}>
                ⚠️ 安全提醒：{result.safety.risk_type}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
