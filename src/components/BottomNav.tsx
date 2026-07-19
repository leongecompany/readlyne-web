'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function BottomNav() {
  const pathname = usePathname();

  // Detect locale from pathname (/cn/... or /au/...)
  const locale = pathname.startsWith('/au') ? 'au' : 'cn';
  const cn = locale === 'cn';

  const items = [
    { href: `/${locale}/analyze`, icon: '🔍', label: cn ? '分析' : 'Analyze' },
    { href: `/${locale}/reply`, icon: '💬', label: cn ? '怎么回' : 'Reply' },
  ];

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${active ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
