'use client';

import { use } from 'react';
import { useLocale } from '@/lib/locale';

export default function PricingPage() {
  const { t } = useLocale();

  return (
    <div className="legal-page">
      <div className="legal-card">
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'right', margin: 0 }}>
          <a href="/pricing" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>
            {t['pricing.popular'] === '推荐' ? 'EN' : '中文'}
          </a>
        </p>
        <h1>{t['pricing.popular'] === '推荐' ? '定价' : 'Pricing'}</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px' }}>
          {t['pricing.popular'] === '推荐' ? (
            <>前 <strong>10 次</strong>基础分析完全免费，无需注册。</>
          ) : (
            <>First <strong>10</strong> basic analyses are free. No sign-up required.</>
          )}
        </p>

        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-name">{t['pricing.free']}</div>
            <div className="pricing-price">$0</div>
            <div className="pricing-unit">{t['pricing.free_desc']}</div>
            <ul>
              {t['pricing.popular'] === '推荐' ? (
                <><li>聊天信号检测</li><li>意图解读</li><li>沟通风险评估</li><li>无需注册</li></>
              ) : (
                <><li>Signal detection</li><li>Intention analysis</li><li>Risk assessment</li><li>No sign-up</li></>
              )}
            </ul>
          </div>

          <div className="pricing-card featured">
            <div className="pricing-badge">{t['pricing.popular']}</div>
            <div className="pricing-name">{t['pricing.standard']}</div>
            <div className="pricing-price">$9.99</div>
            <div className="pricing-unit">{t['pricing.standard_desc']}</div>
            <ul>
              {t['pricing.popular'] === '推荐' ? (
                <><li>聊天信号检测</li><li>意图解读 + 可信度</li><li>沟通风险评估</li><li>三种风格回复建议</li><li>不限时有效</li></>
              ) : (
                <><li>Signal detection</li><li>Intention + confidence</li><li>Risk assessment</li><li>3 reply styles</li><li>No expiry</li></>
              )}
            </ul>
          </div>

          <div className="pricing-card">
            <div className="pricing-name">{t['pricing.deep']}</div>
            <div className="pricing-price">$9.99</div>
            <div className="pricing-unit">{t['pricing.deep_desc']}</div>
            <ul>
              {t['pricing.popular'] === '推荐' ? (
                <><li>目标可行性分析</li><li>对方沟通状态评估</li><li>时间线互动节奏</li><li>心理学策略建议（5条）</li><li>三种可直接使用的回复</li><li>信号追踪 + 风险提醒</li></>
              ) : (
                <><li>Goal feasibility</li><li>Communication state</li><li>Timeline rhythm</li><li>5 psychology strategies</li><li>3 ready-to-use replies</li><li>Signal tracking + risk alerts</li></>
              )}
            </ul>
          </div>
        </div>

        <h2>{t['pricing.popular'] === '推荐' ? '支付方式' : 'Payment'}</h2>
        <p>
          {t['pricing.popular'] === '推荐'
            ? '付款由 Stripe 处理，支持信用卡和支付宝，按实时汇率自动换算。'
            : 'Payments via Stripe. Credit cards, Alipay, and Apple Pay supported. USD, auto-converted by your bank.'}
        </p>

        <h2>FAQ</h2>
        <p><strong>{t['pricing.popular'] === '推荐' ? '免费次数用完了怎么办？' : 'What when free runs out?'}</strong><br />
          {t['pricing.popular'] === '推荐' ? '购买标准包或深度策略包即可继续使用。' : 'Buy a Standard or Deep Strategy pack.'}</p>
        <p><strong>{t['pricing.popular'] === '推荐' ? '可以退款吗？' : 'Refunds?'}</strong><br />
          {t['pricing.popular'] === '推荐'
            ? '原则上不支持。因系统故障导致次数无法使用，联系 support@readlyne.com。'
            : 'Non-refundable. If a technical error prevents use, contact support@readlyne.com.'}</p>
        <p><strong>{t['pricing.popular'] === '推荐' ? '$9.99 是什么货币？' : 'Which currency?'}</strong><br />
          {t['pricing.popular'] === '推荐' ? '美元（USD），实际支付时按银行卡汇率换算。' : 'USD. Your bank converts at its rate.'}</p>
      </div>
    </div>
  );
}
