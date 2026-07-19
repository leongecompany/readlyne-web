'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function BottomNav() {
  const pathname = usePathname();
  const locale = pathname.startsWith('/au') ? 'au' : 'cn';
  const cn = locale === 'cn';

  const [theme, setTheme] = useState<'auto'|'dark'|'light'>('auto');
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : theme === 'light' ? 'auto' : 'dark';
    localStorage.setItem('readlyne_theme', next);
    setTheme(next);
  };
  const themeIcon = theme === 'dark' ? '☀️' : theme === 'light' ? '🌙' : '🌗';

  const items = [
    { href: `/${locale}/analyze`, icon: '🔍', label: cn ? '分析' : 'Analyze' },
    { href: `/${locale}/reply`, icon: '💬', label: cn ? '怎么回' : 'Reply' },
  ];

  return (
    <>
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        style={{
          position: 'fixed', bottom: 72, right: 16,
          width: 36, height: 36, borderRadius: 18,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--card-border)',
          fontSize: 16, cursor: 'pointer', zIndex: 101,
        }}
      >
        {themeIcon}
      </button>
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`nav-item${active ? ' active' : ''}`}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
