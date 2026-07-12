'use client';

import { useState } from 'react';
import { analyzeSubtext } from '@/lib/api';

type AnalysisResult = {
  relationship_signal?: { summary: string; confidence: string; evidence_refs: string[] };
  possible_intentions?: { label: string; explanation: string; confidence: number; evidence_refs: string[] }[];
  communication_risks?: { risk: string; suggestion: string; severity: string }[];
  safety?: { is_high_risk: boolean; risk_type: string; safe_response_mode: boolean };
};

export default function AnalyzePage() {
  const [message, setMessage] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await analyzeSubtext(message.trim(), context.trim());
      if (!data.ok) {
        setError(data.error || '分析请求失败');
        return;
      }
      // Parse JSON result from LLM
      try {
        const parsed = JSON.parse(data.content);
        setResult(parsed.analysis_result || parsed);
      } catch {
        setError('AI 返回格式异常，请稍后重试');
      }
    } catch (e: any) {
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

  const confidenceLabel = (c: string) => {
    if (c === 'high') return '高';
    if (c === 'medium') return '中';
    return '低';
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>🔍 潜台词分析</h1>
      <p className="text-dim" style={{ fontSize: 13, marginBottom: 16 }}>
        粘贴对方说的话，AI 帮你分析可能的含义
      </p>

      <div className="card">
        <label style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 6, display: 'block' }}>
          对方说的话
        </label>
        <textarea
          className="text-input"
          rows={4}
          placeholder="粘贴聊天内容或句子…"
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
          placeholder="例如：和对方认识两个月，最近有点冷淡…"
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={loading || !message.trim()}>
        {loading ? '分析中…' : '分析'}
      </button>

      {error && (
        <div className="card" style={{ borderColor: '#5a1a1a', marginTop: 12 }}>
          <p style={{ color: '#ff6b6b', fontSize: 14, margin: 0 }}>{error}</p>
        </div>
      )}

      {loading && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="skeleton" style={{ width: '60%' }} />
          <div className="skeleton" style={{ width: '90%' }} />
          <div className="skeleton" style={{ width: '75%' }} />
          <div className="skeleton" style={{ width: '40%' }} />
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          {/* Relationship Signal */}
          {result.relationship_signal && (
            <div className="card">
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>关系信号</h2>
              <p className="result-text" style={{ fontSize: 15, marginBottom: 4 }}>
                {result.relationship_signal.summary}
              </p>
              <span className="label-tag" style={{
                background: 'var(--border)',
                color: 'var(--text-dim)',
                fontSize: 11,
              }}>
                置信度: {confidenceLabel(result.relationship_signal.confidence)}
              </span>
            </div>
          )}

          {/* Possible Intention */}
          {result.possible_intentions && result.possible_intentions.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>可能的意图</h2>
              {result.possible_intentions.map((item, i) => (
                <div key={i} style={{
                  padding: '10px 0',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span className="label-tag" style={{
                      background: item.confidence >= 0.7 ? '#1a2a5a' :
                                   item.confidence >= 0.5 ? '#2a2a1a' : '#2a1a1a',
                      color: item.confidence >= 0.7 ? '#5b8bf9' :
                             item.confidence >= 0.5 ? '#ffd93d' : '#888',
                    }}>
                      {item.label}
                    </span>
                    <span className="text-dim" style={{ fontSize: 11 }}>
                      {Math.round(item.confidence * 100)}%
                    </span>
                  </div>
                  <p className="result-text" style={{ fontSize: 14 }}>{item.explanation}</p>
                </div>
              ))}
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
                    <span className={`label-tag ${severityClass(item.severity)}`}>{item.severity === 'high' ? '高' : item.severity === 'medium' ? '中' : '低'}</span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.risk}</span>
                  </div>
                  <p className="text-dim" style={{ fontSize: 13, margin: 0 }}>{item.suggestion}</p>
                </div>
              ))}
            </div>
          )}

          {/* Safety warning */}
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
