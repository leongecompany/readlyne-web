'use client';

import { use } from 'react';
import { useLocale } from '@/lib/locale';

export default function PricingPage() {
  const { locale } = useLocale();
  const cn = locale === 'cn';
  const t = cn ? {
    title: '定价',
    free: '免费版',
    free_desc: '前 10 次分析',
    free_items: ['聊天信号检测', '意图解读', '沟通风险评估', '无需注册'],
    std_name: '标准包',
    std_price: '$4.99',
    std_desc: '10 次分析',
    std_popular: '推荐',
    std_items: ['聊天信号检测', '意图解读 + 可信度', '沟通风险评估', '三种风格回复建议', '不限时有效'],
    deep_name: '深度策略包',
    deep_price: '$9.99',
    deep_desc: '5 次完整报告',
    deep_items: ['目标可行性分析', '沟通状态评估', '时间线互动节奏', '5条心理学策略', '3条定制回复', '信号追踪 + 风险提醒'],
    payment: '付款由 Stripe 安全处理，支持信用卡和支付宝。价格为美元，按实时汇率换算。',
    faq1_q: '免费次数用完了怎么办？',
    faq1_a: '购买标准包（$4.99/10次）即可继续使用普通分析。需要深度策略请购买深度策略包。',
    faq2_q: '可以退款吗？',
    faq2_a: '原则上不支持退款。如因系统故障导致次数无法使用，请联系 support@readlyne.com。',
    faq3_q: '标准包和深度策略包有什么区别？',
    faq3_a: '标准包用于普通聊天分析和回复建议。深度策略包提供7维心理学策略报告。',
  } : {
    title: 'Pricing',
    free: 'Free',
    free_desc: 'First 10 analyses',
    free_items: ['Signal detection', 'Intention analysis', 'Risk assessment', 'No sign-up'],
    std_name: 'Standard Pack',
    std_price: '$4.99',
    std_desc: '10 analyses',
    std_popular: 'POPULAR',
    std_items: ['Signal detection', 'Intention + confidence', 'Risk assessment', '3 reply styles', 'No expiry'],
    deep_name: 'Deep Strategy',
    deep_price: '$9.99',
    deep_desc: '5 full reports',
    deep_items: ['Goal feasibility', 'Communication state', 'Timeline analysis', '5 strategies', '3 custom replies', 'Signal tracking'],
    payment: 'Payments processed securely by Stripe. Credit cards and Alipay supported. USD, auto-converted by your bank.',
    faq1_q: 'What when free runs out?',
    faq1_a: 'Buy Standard Pack ($4.99/10) to continue. For deep strategy, buy the Deep Strategy Pack.',
    faq2_q: 'Refunds?',
    faq2_a: 'Non-refundable. If a technical error prevents use, contact support@readlyne.com.',
    faq3_q: 'Standard vs Deep Strategy?',
    faq3_a: 'Standard: basic analysis and reply suggestions. Deep Strategy: 7-section psychological report.',
  };

  return (
    <div className="legal-page">
      <div className="legal-card">
        <h1>{t.title}</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px' }}>
          {cn ? '前 10 次普通分析完全免费，无需注册。' : 'First 10 basic analyses are free. No sign-up required.'}
        </p>

        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-name">{t.free}</div>
            <div className="pricing-price">$0</div>
            <div className="pricing-unit">{t.free_desc}</div>
            <ul>{t.free_items.map((item, i) => <li key={i}>{item}</li>)}</ul>
          </div>

          <div className="pricing-card featured">
            <div className="pricing-badge">{t.std_popular}</div>
            <div className="pricing-name">{t.std_name}</div>
            <div className="pricing-price">{t.std_price}</div>
            <div className="pricing-unit">{t.std_desc}</div>
            <ul>{t.std_items.map((item, i) => <li key={i}>{item}</li>)}</ul>
          </div>

          <div className="pricing-card">
            <div className="pricing-name">{t.deep_name}</div>
            <div className="pricing-price">{t.deep_price}</div>
            <div className="pricing-unit">{t.deep_desc}</div>
            <ul>{t.deep_items.map((item, i) => <li key={i}>{item}</li>)}</ul>
          </div>
        </div>

        <div style={{ margin: '24px 0', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'center' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--separator)' }}>
              <th style={{ padding: '8px 6px', textAlign: 'left' }}>功能</th>
              <th style={{ padding: '8px 6px' }}>{t.free}</th>
              <th style={{ padding: '8px 6px', color: 'var(--accent)' }}>{t.std_name}</th>
              <th style={{ padding: '8px 6px' }}>{t.deep_name}</th>
            </tr>
          </thead>
          <tbody>
            {[
              [cn?'价格':'Price', '$0', '$4.99', '$9.99'],
              [cn?'次数':'Analyses', '10', '10', '5'],
              [cn?'信号检测':'Signal Detection', '✅', '✅', '✅'],
              [cn?'意图解读':'Intention Analysis', '✅', '✅', '✅'],
              [cn?'风险评估':'Risk Assessment', '✅', '✅', '✅'],
              [cn?'回复建议':'Reply Suggestions', '❌', '✅', '✅'],
              [cn?'心理学策略':'Psychology Strategies', '❌', '❌', '✅'],
              [cn?'定制回复':'Custom Replies', '❌', '❌', '✅'],
              [cn?'信号追踪':'Signal Tracking', '❌', '❌', '✅'],
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--separator)' }}>
                <td style={{ padding: '8px 6px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: i < 2 ? 600 : 400 }}>{row[0]}</td>
                <td style={{ padding: '8px 6px' }}>{row[1]}</td>
                <td style={{ padding: '8px 6px', background: i === 0 ? 'var(--bg-secondary)' : 'transparent' }}>{row[2]}</td>
                <td style={{ padding: '8px 6px' }}>{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>{cn ? '支付方式' : 'Payment'}</h2>
        <p>{t.payment}</p>

        <h2>FAQ</h2>
        <p><strong>{t.faq1_q}</strong><br />{t.faq1_a}</p>
        <p><strong>{t.faq2_q}</strong><br />{t.faq2_a}</p>
        <p><strong>{t.faq3_q}</strong><br />{t.faq3_a}</p>
      </div>
    </div>
  );
}
