'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getOnline } from '@/lib/admin-api';

const NAV = [
  { href: '/admin', label: 'Overview', icon: '◉' },
  { href: '/admin/users', label: 'Users', icon: '◎' },
  { href: '/admin/revenue', label: 'Revenue', icon: '◈' },
  { href: '/admin/errors', label: 'Errors', icon: '◌' },
  { href: '/admin/settings', label: 'Settings', icon: '◊' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [online, setOnline] = useState<number | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const d = await getOnline();
      if (d.ok) setOnline(d.online);
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0, borderRight: '1px solid #e5e5e5',
        display: 'flex', flexDirection: 'column', padding: '0 12px',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        background: '#fff', zIndex: 50,
        overflowY: 'auto',
      }}>
        <div style={{ padding: '20px 12px 16px', borderBottom: '1px solid #f0f0f0', marginBottom: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em', color: '#000' }}>Readlyne</div>
          <div style={{ fontSize: 11, color: '#8e8e93', marginTop: 1 }}>Admin</div>
        </div>

        <div style={{ padding: '8px 12px 16px', borderBottom: '1px solid #f0f0f0', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#34c759' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34c759', display: 'inline-block' }} />
            Online: {online !== null ? online : '…'}
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                  color: active ? '#000' : '#666',
                  background: active ? '#f5f5f5' : 'transparent',
                  textDecoration: 'none', transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#f8f8f8'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 14, opacity: 0.6 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main style={{
        flex: 1, marginLeft: 220, padding: '32px 40px',
        maxWidth: 'calc(100vw - 220px)', overflowX: 'hidden',
      }}>
        {children}
      </main>
    </div>
  );
}
