import Link from 'next/link';
import BetaSignup from '@/components/BetaSignup';

export default function HomePage() {
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-logo">Readlyne</div>
          <h1>AI 聊天洞察助手</h1>
          <p className="home-hero-sub">
            看不懂 TA 的话？粘贴聊天记录，AI 帮你分析潜台词、误读风险和最佳回复。
          </p>
          <div className="home-hero-actions">
            <Link href="/analyze" className="home-btn-primary">
              开始分析 →
            </Link>
            <Link href="/features" className="home-btn-secondary">
              了解更多
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="home-trust">
        <div className="home-trust-item">
          <span>🔒</span> 隐私保护 · 不留存聊天内容
        </div>
        <div className="home-trust-item">
          <span>🤖</span> 心理学框架 + AI 分析
        </div>
        <div className="home-trust-item">
          <span>📱</span> 网页 + iOS 双端可用
        </div>
      </section>

      {/* Features preview */}
      <section className="home-section">
        <h2 className="home-section-title">核心功能</h2>
        <div className="home-features">
          <div className="home-feature">
            <div className="home-feature-icon">🔮</div>
            <h3>信号检测</h3>
            <p>AI 分析对话语气和模式，判断关系信号——积极、中性还是危险信号。</p>
          </div>
          <div className="home-feature">
            <div className="home-feature-icon">🎯</div>
            <h3>意图解读</h3>
            <p>揭示可能的潜台词，附可信度评估和引用依据。</p>
          </div>
          <div className="home-feature">
            <div className="home-feature-icon">💬</div>
            <h3>智能回复</h3>
            <p>三种风格的回复建议——保守、自然、主动——附为什么有效的心理学解释。</p>
          </div>
          <div className="home-feature">
            <div className="home-feature-icon">🧠</div>
            <h3>深度策略</h3>
            <p>基于心理学理论的 7 维报告，含时间线分析、策略建议、风险提醒。</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="home-section home-bg-alt">
        <h2 className="home-section-title">三步使用</h2>
        <div className="home-steps">
          <div className="home-step">
            <div className="home-step-num">1</div>
            <h3>粘贴聊天</h3>
            <p>把 TA 发的消息贴进来，可选补充背景信息。</p>
          </div>
          <div className="home-step-arrow">→</div>
          <div className="home-step">
            <div className="home-step-num">2</div>
            <h3>AI 分析</h3>
            <p>几秒内得到信号检测、意图解读、沟通风险评估。</p>
          </div>
          <div className="home-step-arrow">→</div>
          <div className="home-step">
            <div className="home-step-num">3</div>
            <h3>获得建议</h3>
            <p>三种回复方案 + 深度策略报告（付费），帮你做出更好的沟通选择。</p>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="home-section">
        <h2 className="home-section-title">定价</h2>
        <div className="home-pricing">
          <div className="home-pricing-card">
            <div className="home-pricing-name">免费版</div>
            <div className="home-pricing-amount">$0</div>
            <ul>
              <li>基础聊天分析</li>
              <li>信号检测</li>
              <li>风险评估</li>
              <li>无需登录</li>
            </ul>
            <Link href="/analyze" className="home-btn-primary" style={{ fontSize: 14, padding: '12px' }}>
              开始使用
            </Link>
          </div>
          <div className="home-pricing-card home-pricing-featured">
            <div className="home-pricing-badge">最多人买</div>
            <div className="home-pricing-name">分析包</div>
            <div className="home-pricing-amount">¥9.9</div>
            <div className="home-pricing-unit">5 次分析</div>
            <ul>
              <li>深度心理学策略分析</li>
              <li>完整 7 维报告</li>
              <li>定制回复建议</li>
              <li>不限时有效</li>
            </ul>
            <Link href="/pricing" className="home-btn-primary" style={{ fontSize: 14, padding: '12px' }}>
              查看详情
            </Link>
          </div>
          <div className="home-pricing-card">
            <div className="home-pricing-name">Pro 月付</div>
            <div className="home-pricing-amount">$29.99</div>
            <div className="home-pricing-unit">/ 月</div>
            <ul>
              <li>无限次分析</li>
              <li>优先处理</li>
              <li>关系档案追踪</li>
              <li>优先支持</li>
            </ul>
            <Link href="/pricing" className="home-btn-primary" style={{ fontSize: 14, padding: '12px' }}>
              查看详情
            </Link>
          </div>
        </div>
      </section>

      {/* Beta signup */}
      <section className="home-section home-bg-alt">
        <h2 className="home-section-title">立即体验</h2>
        <div style={{ textAlign: 'center', maxWidth: 360, margin: '0 auto' }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
            留下邮箱获取 App 内测资格，第一时间体验关系档案追踪功能。
          </p>
          <BetaSignup />
        </div>
      </section>

      {/* App download */}
      <section className="home-app-cta">
        <h2>下载 Readlyne iOS App</h2>
        <p>建立关系档案，让 AI 越来越了解你的互动。</p>
        <Link href="/analyze" className="home-btn-primary" style={{ display: 'inline-block', width: 'auto', padding: '14px 32px' }}>
          网页版先体验 →
        </Link>
      </section>
    </div>
  );
}
