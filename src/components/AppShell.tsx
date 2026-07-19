'use client';

import { usePathname } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import SiteFooter from '@/components/SiteFooter';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Only show nav/footer on app pages (not on language selector root)
  const isApp = pathname !== '/' && !pathname.startsWith('/privacy') && !pathname.startsWith('/terms');

  if (!isApp) return <>{children}</>;

  return (
    <>
      <div className="app-container">{children}</div>
      <SiteFooter />
      <BottomNav />
    </>
  );
}
