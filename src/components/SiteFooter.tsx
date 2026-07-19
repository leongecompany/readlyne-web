import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <nav className="footer-links">
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </nav>
        <div className="footer-brand">
          <span className="footer-name">Readlyne</span>
          <span className="footer-tag">AI 聊天洞察</span>
        </div>
        <p className="footer-disclaimer">
          Readlyne provides AI-generated relationship insights for reference only.
          It is not a substitute for professional counseling or therapy.
        </p>
        <p className="footer-copy">&copy; {new Date().getFullYear()} Readlyne. All rights reserved.</p>
      </div>
    </footer>
  );
}
