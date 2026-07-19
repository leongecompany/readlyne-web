export default function EnFeaturesPage() {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'right', margin: 0 }}>
          <a href="/features" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>中文</a>
        </p>
        <h1>Features</h1>

        <div className="features-list">
          <div className="feature-item">
            <div className="feature-icon">🔮</div>
            <div>
              <h3>Signal Detection</h3>
              <p>AI analyzes tone, engagement, and interaction patterns to identify positive, neutral, or warning signals.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <div>
              <h3>Intention Analysis</h3>
              <p>Uncover hidden meanings behind messages with confidence ratings and evidence references.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚠️</div>
            <div>
              <h3>Risk Assessment</h3>
              <p>Spot communication risks, emotional triggers, and conversational pitfalls before they escalate.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">💬</div>
            <div>
              <h3>Reply Suggestions</h3>
              <p>Three styles — conservative, natural, bold — each with explanations of effectiveness and risk notes.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🧠</div>
            <div>
              <h3>Deep Strategy</h3>
              <p>7-section psychological report: goal feasibility, communication state, timeline analysis, 5 strategies, 3 custom replies, and signal tracking.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📱</div>
            <div>
              <h3>Relationship Tracking (App)</h3>
              <p>Build relationship profiles in the iOS app for increasingly personalized AI insights.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <div>
              <h3>Privacy First</h3>
              <p>Chat content is analyzed in real-time and not stored. No unnecessary permissions. Full data deletion on request.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
