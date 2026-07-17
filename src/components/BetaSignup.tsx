'use client';

import { useState } from 'react';
import { submitFeedback } from '@/lib/api';

export default function BetaSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'sending'|'sent'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (status !== 'idle' || !email.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('请输入有效邮箱');
      return;
    }
    setError('');
    setStatus('sending');
    try {
      await submitFeedback('[内测申请] ' + email.trim());
      setStatus('sent');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('idle');
      setError('提交失败，请重试');
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: '0 0 8px' }}>
        加入内测，第一时间获取新功能
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="text-input"
          type="email"
          style={{ flex: 1, marginBottom: 0, fontSize: 14, padding: '10px 14px' }}
          placeholder="your@email.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          disabled={status !== 'idle' || !email.trim()}
          style={{
            padding: '10px 20px',
            background: status === 'sent' ? '#34c759' : 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: status !== 'idle' || !email.trim() ? 'not-allowed' : 'pointer',
            opacity: status !== 'idle' || !email.trim() ? 0.5 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          {status === 'sending' ? '…' : status === 'sent' ? '✓ 已提交' : '加入'}
        </button>
      </div>
      {error && <p style={{ fontSize: 12, color: '#d70015', margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}
