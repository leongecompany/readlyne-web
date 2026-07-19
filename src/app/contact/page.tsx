export default function ContactPage() {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <h1>Contact</h1>
        <p>Have questions, feedback, or need help? Reach out to us.</p>

        <div className="contact-methods">
          <div className="contact-item">
            <div className="contact-icon">📧</div>
            <div>
              <h3>Support</h3>
              <p><a href="mailto:support@readlyne.com">support@readlyne.com</a></p>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">🔒</div>
            <div>
              <h3>Privacy</h3>
              <p><a href="mailto:privacy@readlyne.com">privacy@readlyne.com</a></p>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">🐛</div>
            <div>
              <h3>Bug Report</h3>
              <p><a href="mailto:support@readlyne.com">support@readlyne.com</a></p>
            </div>
          </div>
        </div>

        <h2>Business</h2>
        <p>
          Readlyne is operated by Leon AI Studio.
          <br />
          Sydney, Australia
        </p>
      </div>
    </div>
  );
}
