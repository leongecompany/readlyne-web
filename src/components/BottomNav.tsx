'use client';

import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/analyze', icon: '🔍', label: '分析' },
  { href: '/reply', icon: '💬', label: '怎么回' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              className={`nav-item${active ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
