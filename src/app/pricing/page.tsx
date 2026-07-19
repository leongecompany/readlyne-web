'use client';

export default function PricingPage() {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'right', margin: 0 }}>
          <a href="/en/pricing" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>EN</a>
        </p>
        <h1>定价</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px' }}>
          前 <strong>10 次</strong>基础分析完全免费，无需注册。
        </p>

        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-name">免费版</div>
            <div className="pricing-price">$0</div>
            <div className="pricing-unit">前 10 次分析</div>
            <ul>
              <li>聊天信号检测</li>
              <li>意图解读</li>
              <li>沟通风险评估</li>
              <li>无需注册</li>
            </ul>
          </div>

          <div className="pricing-card featured">
            <div className="pricing-badge">推荐</div>
            <div className="pricing-name">标准包</div>
            <div className="pricing-price">$9.99</div>
            <div className="pricing-unit">11 次分析</div>
            <ul>
              <li>聊天信号检测</li>
              <li>意图解读 + 可信度</li>
              <li>沟通风险评估</li>
              <li>三种风格回复建议</li>
              <li>不限时有效</li>
            </ul>
          </div>

          <div className="pricing-card">
            <div className="pricing-name">深度策略包</div>
            <div className="pricing-price">$9.99</div>
            <div className="pricing-unit">5 次完整报告</div>
            <ul>
              <li>目标可行性分析</li>
              <li>对方沟通状态评估</li>
              <li>时间线互动节奏</li>
              <li>心理学策略建议（5条）</li>
              <li>三种可直接使用的回复</li>
              <li>信号追踪 + 风险提醒</li>
            </ul>
          </div>
        </div>

        <h2>支付方式</h2>
        <p>
          付款由 <strong>Stripe</strong> 处理，支持信用卡和支付宝。
          按当前汇率自动换算。
        </p>

        <h2>常见问题</h2>
        <p>
          <strong>免费次数用完了怎么办？</strong><br />
          购买标准包或深度策略包即可继续使用。
        </p>
        <p>
          <strong>可以退款吗？</strong><br />
          原则上不支持退款。如因系统故障导致次数无法使用，请联系 support@readlyne.com 处理。
        </p>
        <p>
          <strong>${'$'}9.99 是什么货币？</strong><br />
          美元（USD）。实际支付时按你银行卡的汇率自动换算。
        </p>
        <p>
          <strong>深度策略和普通分析有什么区别？</strong><br />
          普通分析给出信号、意图、风险和建议。深度策略额外提供目标可行性、心理学依据、时间线分析和定制化策略报告。
        </p>
      </div>
    </div>
  );
}
