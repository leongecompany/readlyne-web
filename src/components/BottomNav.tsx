'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

function useTheme() {
  const [theme, setTheme] = useState<'dark'|'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('readlyne_theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      setTheme('dark');
    }
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('readlyne_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    setTheme(next);
  };

  return { theme, toggle };
}

export default function BottomNav() {
  const pathname = usePathname();
  const locale = pathname.startsWith('/au') ? 'au' : 'cn';
  const cn = locale === 'cn';
  const { theme, toggle } = useTheme();

  const items = [
    { href: `/${locale}/analyze`, label: cn ? '分析' : 'Analyze', icon: '🔍' },
    { href: `/${locale}/reply`, label: cn ? '怎么回' : 'Reply', icon: '💬' },
  ];

  return (
    <>
      {/* Theme toggle — glass */}
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="glass"
        style={{
          position: 'fixed', bottom: 76, right: 16,
          width: 38, height: 38, borderRadius: 19,
          fontSize: 16, cursor: 'pointer', zIndex: 101,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 0,
        }}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <nav className="bottom-nav glass-header" style={{ backdropFilter: 'blur(30px) saturate(1.5)', WebkitBackdropFilter: 'blur(30px) saturate(1.5)' }}>
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
