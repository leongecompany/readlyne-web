'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/locale';

export default function LocaleFooter() {
  const { locale, t } = useLocale();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <nav className="footer-links">
          <Link href={`/${locale}/features`}>{t['footer.features']}</Link>
          <Link href={`/${locale}/pricing`}>{t['footer.pricing']}</Link>
          <Link href={`/${locale}/faq`}>{t['footer.faq']}</Link>
          <Link href={`/${locale}/contact`}>{t['footer.contact']}</Link>
          <Link href="/privacy">{t['footer.privacy']}</Link>
          <Link href="/terms">{t['footer.terms']}</Link>
        </nav>
        <div className="footer-brand">
          <span className="footer-name">Readlyne</span>
          <span className="footer-tag">{t['footer.tag']}</span>
        </div>
        <p className="footer-disclaimer">{t['footer.disclaimer']}</p>
        <p className="footer-copy">&copy; {new Date().getFullYear()} Readlyne. All rights reserved.</p>
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>
          {locale === 'cn' ? (
            <Link href="/au" style={{ color: 'var(--text-tertiary)' }}>English</Link>
          ) : (
            <Link href="/cn" style={{ color: 'var(--text-tertiary)' }}>中文</Link>
          )}
        </p>
      </div>
    </footer>
  );
}
