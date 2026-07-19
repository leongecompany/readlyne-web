export default function FeaturesPage() {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'right', margin: 0 }}>
          <a href="/en/features" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>EN</a>
        </p>
        <h1>功能介绍</h1>

        <div className="features-list">
          <div className="feature-item">
            <div className="feature-icon">🔮</div>
            <div>
              <h3>信号检测</h3>
              <p>AI 分析聊天中的语气、互动模式和参与度，判断积极、中性还是危险信号。</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <div>
              <h3>意图解读</h3>
              <p>揭示消息背后的可能潜台词，附可信度评估和原文引用依据。</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚠️</div>
            <div>
              <h3>风险评估</h3>
              <p>及时发现沟通误读风险、情绪触发点和对话陷阱，防患于未然。</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">💬</div>
            <div>
              <h3>回复建议</h3>
              <p>三种风格可选——保守、自然、主动——每一条都附为什么有效和潜在风险。</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🧠</div>
            <div>
              <h3>深度策略</h3>
              <p>7 维心理学策略报告：目标可行性、沟通状态、时间线分析、5 条策略、3 条定制回复、信号追踪和风险提醒。</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📱</div>
            <div>
              <h3>关系追踪（App）</h3>
              <p>在 iOS App 中建立关系档案，让 AI 分析越来越贴合你们的独家互动模式。</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <div>
              <h3>隐私优先</h3>
              <p>聊天内容实时分析后不留存，不需要的权限不索要。你随时可以请求删除数据。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
