export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <h1>Privacy Policy</h1>
        <p className="legal-date">Last updated: July 2026</p>

        <h2>1. Information We Collect</h2>
        <p>
          When you use Readlyne, we collect:
        </p>
        <ul>
          <li><strong>Chat content</strong> you paste for analysis — processed temporarily and not stored long-term</li>
          <li><strong>Account information</strong> (email) if you register</li>
          <li><strong>Payment information</strong> — processed entirely by Stripe; we never see or store your card details</li>
          <li><strong>Usage data</strong> (anonymous analytics) to improve the service</li>
        </ul>

        <h2>2. How We Use Your Data</h2>
        <ul>
          <li>To analyze chat messages and generate insights</li>
          <li>To process payments via Stripe</li>
          <li>To improve our AI models and service quality</li>
          <li>To send important service updates (not marketing)</li>
        </ul>

        <h2>3. Data Storage & Retention</h2>
        <p>
          Chat content is processed in real-time for analysis and not permanently stored.
          Account data is retained as long as your account is active.
          You can request deletion of your data at any time by contacting us.
        </p>

        <h2>4. AI Processing</h2>
        <p>
          Your chat content is sent to our AI provider (DeepSeek) for analysis.
          We do not use your content to train third-party models.
          Analysis results are provided as suggestions, not professional advice.
        </p>

        <h2>5. Payment Processing</h2>
        <p>
          All payments are handled by <strong>Stripe</strong>. We do not store,
          process, or have access to your credit card details. Stripe&apos;s privacy
          policy applies to payment data. Read Stripe&apos;s privacy policy at
          <a href="https://stripe.com/privacy"> stripe.com/privacy</a>.
        </p>

        <h2>6. Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul>
          <li><strong>Stripe</strong> — payment processing</li>
          <li><strong>DeepSeek</strong> — AI analysis</li>
          <li><strong>Supabase</strong> — data storage (for registered users)</li>
          <li><strong>GitHub Pages</strong> — static hosting</li>
          <li><strong>Cloudflare</strong> — DNS, CDN & SSL</li>
        </ul>

        <h2>7. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Request deletion of your data</li>
          <li>Opt out of data collection (some features may be limited)</li>
          <li>Export your data</li>
        </ul>

        <h2>8. Contact</h2>
        <p>
          For privacy inquiries, contact us at <strong>privacy@readlyne.com</strong>.
        </p>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this policy. Material changes will be notified via email
          or in-app notice.
        </p>
      </div>
    </div>
  );
}
