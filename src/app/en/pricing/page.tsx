'use client';

export default function EnPricingPage() {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'right', margin: 0 }}>
          <a href="/pricing" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>中文</a>
        </p>
        <h1>Pricing</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px' }}>
          First <strong>10</strong> basic analyses are free. No sign-up required.
        </p>

        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-name">Free</div>
            <div className="pricing-price">$0</div>
            <div className="pricing-unit">first 10 analyses</div>
            <ul>
              <li>Signal detection</li>
              <li>Intention analysis</li>
              <li>Communication risk assessment</li>
              <li>No sign-up required</li>
            </ul>
          </div>

          <div className="pricing-card featured">
            <div className="pricing-badge">POPULAR</div>
            <div className="pricing-name">Standard Pack</div>
            <div className="pricing-price">$9.99</div>
            <div className="pricing-unit">11 analyses</div>
            <ul>
              <li>Signal detection</li>
              <li>Intention analysis + confidence</li>
              <li>Communication risk assessment</li>
              <li>3 reply styles with explanations</li>
              <li>No expiry</li>
            </ul>
          </div>

          <div className="pricing-card">
            <div className="pricing-name">Deep Strategy</div>
            <div className="pricing-price">$9.99</div>
            <div className="pricing-unit">5 full reports</div>
            <ul>
              <li>Goal feasibility assessment</li>
              <li>Communication state analysis</li>
              <li>Timeline and rhythm analysis</li>
              <li>5 psychology-backed strategies</li>
              <li>3 ready-to-use replies</li>
              <li>Signal tracking + risk warnings</li>
            </ul>
          </div>
        </div>

        <h2>Payment</h2>
        <p>
          Payments are processed securely by <strong>Stripe</strong>.
          Credit cards, Alipay, and Apple Pay are supported.
          Prices are in USD. Your bank handles currency conversion.
        </p>

        <h2>FAQ</h2>
        <p>
          <strong>What happens when my free analyses run out?</strong><br />
          Purchase a Standard or Deep Strategy pack to continue.
        </p>
        <p>
          <strong>Can I get a refund?</strong><br />
          Purchases are non-refundable. If a technical error prevents you from using your credits, contact support@readlyne.com.
        </p>
        <p>
          <strong>What&apos;s the difference between Standard and Deep Strategy?</strong><br />
          Standard gives you signals, intentions, risks, and reply suggestions. Deep Strategy adds goal feasibility, psychological frameworks, timeline analysis, 5 custom strategies, and signal tracking — a complete 7-section report.
        </p>
      </div>
    </div>
  );
}
