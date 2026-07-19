'use client';

import { useState } from 'react';
import { submitFeedback } from '@/lib/api';

export default function BetaSignup({ locale = 'cn' }: { locale?: string }) {
  const cn = locale === 'cn';
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'sending'|'sent'>('idle');
  const [error, setError] = useState('');
  const [featureText, setFeatureText] = useState('');
  const [featureStatus, setFeatureStatus] = useState<'idle'|'sending'|'sent'>('idle');
  const [showAppModal, setShowAppModal] = useState(false);

  const handleSubmit = async () => {
    if (status !== 'idle' || !email.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError(cn ? '请输入有效邮箱' : 'Please enter a valid email');
      return;
    }
    setError('');
    setStatus('sending');
    try {
      await submitFeedback('[Beta Signup] ' + email.trim());
      setStatus('sent');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('idle');
      setError(cn ? '提交失败，请重试' : 'Failed to submit. Try again.');
    }
  };

  const handleFeatureSubmit = async () => {
    if (featureStatus !== 'idle' || !featureText.trim()) return;
    setFeatureStatus('sending');
    try {
      await submitFeedback('[Feature Request] ' + featureText.trim());
      setFeatureStatus('sent');
      setFeatureText('');
      setTimeout(() => setFeatureStatus('idle'), 3000);
    } catch {
      setFeatureStatus('idle');
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: '0 0 8px' }}>
        {cn ? '加入内测，第一时间获取新功能' : 'Join the beta for early access'}
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
            padding: '10px 20px', background: status === 'sent' ? '#34c759' : 'var(--accent)',
            color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
            cursor: status !== 'idle' || !email.trim() ? 'not-allowed' : 'pointer',
            opacity: status !== 'idle' || !email.trim() ? 0.5 : 1, whiteSpace: 'nowrap',
          }}
        >
          {status === 'sending' ? '…' : status === 'sent' ? (cn ? '✓ 已提交' : '✓ Done') : (cn ? '加入' : 'Join')}
        </button>
      </div>
      {error && <p style={{ fontSize: 12, color: '#d70015', margin: '4px 0 0' }}>{error}</p>}

      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: '16px 0 8px' }}>
        {cn ? '你希望增加什么功能？' : 'What features would you like?'}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="text-input"
          style={{ flex: 1, marginBottom: 0, fontSize: 14, padding: '10px 14px' }}
          placeholder={cn ? '说说你的想法…' : 'Share your thoughts…'}
          value={featureText}
          onChange={(e) => setFeatureText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleFeatureSubmit()}
          maxLength={300}
        />
        <button
          onClick={handleFeatureSubmit}
          disabled={featureStatus !== 'idle' || !featureText.trim()}
          style={{
            padding: '10px 20px', background: featureStatus === 'sent' ? '#34c759' : 'var(--accent)',
            color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
            cursor: featureStatus !== 'idle' || !featureText.trim() ? 'not-allowed' : 'pointer',
            opacity: featureStatus !== 'idle' || !featureText.trim() ? 0.5 : 1, whiteSpace: 'nowrap',
          }}
        >
          {featureStatus === 'sending' ? '…' : featureStatus === 'sent' ? '✓' : (cn ? '提交' : 'Submit')}
        </button>
      </div>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <button
          onClick={() => setShowAppModal(true)}
          style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
        >
          📱 {cn ? 'App 下载' : 'Download App'}
        </button>
      </div>

      {showAppModal && (
        <div onClick={() => setShowAppModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', textAlign: 'center', maxWidth: 300, width: '100%' }}>
            <p style={{ fontSize: 40, margin: '0 0 12px' }}>🚧</p>
            <p style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>Coming Soon</p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
              {cn ? 'iOS App 即将上线，敬请期待' : 'iOS app coming soon. Stay tuned!'}
            </p>
            <button className="btn-primary" onClick={() => setShowAppModal(false)} style={{ maxWidth: 200, margin: '0 auto' }}>
              {cn ? '知道了' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
