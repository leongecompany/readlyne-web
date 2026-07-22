'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from '@/lib/locale';

export default function LocaleBottomNav() {
  const pathname = usePathname();
  const { locale, t } = useLocale();

  const items = [
    { href: `/${locale}/analyze`, label: t['nav.analyze'] },
    { href: `/${locale}/reply`, label: t['nav.reply'] },
  ];

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`nav-item${active ? ' active' : ''}`}>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
