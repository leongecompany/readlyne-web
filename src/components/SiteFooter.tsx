'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function SiteFooter() {
  const pathname = usePathname();
  const locale = pathname.startsWith('/au') ? 'au' : 'cn';
  const cn = locale === 'cn';

  const links = cn
    ? [
        { href: `/${locale}/features`, label: '功能' },
        { href: `/${locale}/pricing`, label: '定价' },
        { href: `/${locale}/faq`, label: '问答' },
        { href: `/${locale}/contact`, label: '联系' },
        { href: '/privacy', label: '隐私政策' },
        { href: '/terms', label: '服务条款' },
      ]
    : [
        { href: `/${locale}/features`, label: 'Features' },
        { href: `/${locale}/pricing`, label: 'Pricing' },
        { href: `/${locale}/faq`, label: 'FAQ' },
        { href: `/${locale}/contact`, label: 'Contact' },
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
      ];

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <nav className="footer-links">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>
        <div className="footer-brand">
          <span className="footer-name">Readlyne</span>
          <span className="footer-tag">{cn ? 'AI 聊天洞察' : 'Chat Insights AI'}</span>
        </div>
        <p className="footer-disclaimer">
          {cn
            ? 'Readlyne 提供 AI 关系洞察，仅供参考。不可替代专业心理咨询。'
            : 'Readlyne provides AI-generated relationship insights for reference only. Not a substitute for professional counseling.'}
        </p>
        <p className="footer-copy">&copy; {new Date().getFullYear()} Readlyne. All rights reserved.</p>
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>
          {cn ? (
            <Link href="/au" style={{ color: 'var(--text-tertiary)' }}>English</Link>
          ) : (
            <Link href="/cn" style={{ color: 'var(--text-tertiary)' }}>中文</Link>
          )}
        </p>
      </div>
    </footer>
  );
}
