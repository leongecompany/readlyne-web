export default function FeaturesPage() {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <h1>Features</h1>
        <p className="legal-date">AI-powered relationship communication insights</p>

        <div className="features-list">
          <div className="feature-item">
            <div className="feature-icon">🔮</div>
            <div>
              <h3>Signal Detection</h3>
              <p>AI analyzes chat tone, engagement, and patterns to tell you how the conversation is going — positive, neutral, or concerning.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <div>
              <h3>Intention Analysis</h3>
              <p>Uncover possible meanings behind messages with probability ratings and evidence references. Understand what they really meant.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">⚠️</div>
            <div>
              <h3>Risk Assessment</h3>
              <p>Get alerted to miscommunication risks, emotional triggers, and conversational pitfalls before they escalate.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">💬</div>
            <div>
              <h3>Smart Reply Suggestions</h3>
              <p>Three styles of replies — conservative, natural, and bold — each with an explanation of why it works and what risks to watch for.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">🧠</div>
            <div>
              <h3>Deep Strategy (Premium)</h3>
              <p>7-section psychological strategy report based on your specific goal: timeline analysis, psychology-backed tactics, 3 tailored replies, signal tracking, and risk reminders.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">📱</div>
            <div>
              <h3>Relationship Tracking (App)</h3>
              <p>Build relationship profiles in the iOS app so analysis becomes progressively more personalized across conversations.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <div>
              <h3>Privacy First</h3>
              <p>Chat content is analyzed in real-time and not stored permanently. No chat logs saved. You stay in control of your data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
