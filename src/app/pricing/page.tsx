'use client';

import { useState } from 'react';

const MARKETS = {
  au: {
    label: '🇦🇺 澳洲用户',
    currency: 'A$',
    packs: [
      { name: '免费版', price: '0', unit: '每次', features: ['基础聊天分析', '信号检测', '风险评估', '无需登录'] },
      { name: '分析包', price: '14.99', unit: '5 次分析', popular: true, features: ['深度心理学策略分析', '完整 7 维报告', '5 次独立分析', '不限时有效'] },
      { name: 'Pro 月付', price: '44.99', unit: '/ 月', features: ['无限次分析', '优先处理', '关系档案追踪', '新功能优先体验', '优先支持'] },
    ],
    payment: 'Stripe（Visa / Mastercard / Apple Pay）',
  },
  cn: {
    label: '🇨🇳 中国用户',
    currency: '¥',
    packs: [
      { name: '免费版', price: '0', unit: '每次', features: ['基础聊天分析', '信号检测', '风险评估', '无需登录'] },
      { name: '分析包', price: '9.99', unit: '5 次分析', popular: true, features: ['深度心理学策略分析', '完整 7 维报告', '5 次独立分析', '不限时有效'] },
      { name: 'Pro 月付', price: '29.99', unit: '/ 月', features: ['无限次分析', '优先处理', '关系档案追踪', '新功能优先体验', '优先支持'] },
    ],
    payment: '支付宝 / Stripe',
  },
};

export default function PricingPage() {
  const [market, setMarket] = useState<'au' | 'cn'>('au');

  const m = MARKETS[market];

  return (
    <div className="legal-page">
      <div className="legal-card" style={{ paddingBottom: 16 }}>
        <h1>Pricing</h1>
        <p className="legal-date">选择你的地区查看价格</p>

        {/* Market toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
          {(['au', 'cn'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setMarket(k)}
              style={{
                padding: '10px 20px',
                border: market === k ? '2px solid var(--accent)' : '1px solid var(--card-border)',
                borderRadius: 10,
                background: market === k ? 'var(--bg-secondary)' : 'var(--card)',
                color: 'var(--text)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {MARKETS[k].label}
            </button>
          ))}
        </div>

        {/* Price cards */}
        <div className="pricing-grid">
          {m.packs.map((p, i) => (
            <div key={i} className={`pricing-card${p.popular ? ' featured' : ''}`}>
              {p.popular && <div className="pricing-badge">最多人买</div>}
              <div className="pricing-name">{p.name}</div>
              <div className="pricing-price">
                {p.price === '0' ? `${m.currency}0` : `${m.currency}${p.price}`}
              </div>
              <div className="pricing-unit">{p.unit}</div>
              <ul>
                {p.features.map((f, j) => <li key={j}>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment info */}
        <h2>支付方式</h2>
        <p>
          付款由 <strong>Stripe</strong> 安全处理。
          {market === 'cn' && ' 支持支付宝扫码支付。'}
          {market === 'au' && ' 支持 Visa、Mastercard 和 Apple Pay。'}
        </p>
        <p>
          所有价格含税。分析包购买后<b>不限时有效</b>，Pro 月付<b>按月自动续费</b>，可随时取消。
          已购分析包<b>原则上不支持退款</b>，除非因技术故障导致无法使用。
        </p>

        <h2>常见问题</h2>
        <p>
          <strong>什么情况下可以退款？</strong><br />
          因系统故障导致已购次数无法使用，可联系 support@readlyne.com 处理。
        </p>
        <p>
          <strong>Pro 月付可以随时取消吗？</strong><br />
          可以，取消后当前计费周期结束前仍可继续使用。
        </p>
      </div>
    </div>
  );
}
