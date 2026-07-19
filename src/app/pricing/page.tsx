export default function PricingPage() {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <h1>Pricing</h1>
        <p className="legal-date">Analysis credits for AI-powered relationship insights</p>

        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-name">Free</div>
            <div className="pricing-price">$0</div>
            <div className="pricing-unit">per analysis</div>
            <ul>
              <li>Basic chat analysis</li>
              <li>Signal detection</li>
              <li>Risk assessment</li>
              <li>No login required</li>
            </ul>
          </div>

          <div className="pricing-card featured">
            <div className="pricing-badge">POPULAR</div>
            <div className="pricing-name">Analysis Pack</div>
            <div className="pricing-price">¥9.99</div>
            <div className="pricing-unit">5 analyses</div>
            <ul>
              <li>Deep psychological strategy</li>
              <li>Full 7-section report</li>
              <li>Custom reply suggestions</li>
              <li>No expiry</li>
            </ul>
          </div>

          <div className="pricing-card">
            <div className="pricing-name">Pro Monthly</div>
            <div className="pricing-price">$29.99</div>
            <div className="pricing-unit">per month</div>
            <ul>
              <li>Unlimited analyses</li>
              <li>Priority processing</li>
              <li>Relationship tracking</li>
              <li>Early access to new features</li>
              <li>Priority support</li>
            </ul>
          </div>
        </div>

        <h2>Payment Information</h2>
        <p>
          Payments are securely processed by <strong>Stripe</strong>.
          We accept major credit cards, Alipay (for ¥9.9 pack), and other
          Stripe-supported payment methods.
        </p>
        <p>
          Prices are in USD for international customers and CNY for Chinese users.
          All purchases are non-refundable unless due to technical error.
        </p>

        <h2>Questions?</h2>
        <p>
          Contact us at <strong>support@readlyne.com</strong>.
        </p>
      </div>
    </div>
  );
}
