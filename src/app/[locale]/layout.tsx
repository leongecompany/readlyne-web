import { ReactNode, use } from 'react';
import { Metadata, Viewport } from 'next';
import { LocaleProvider, Locale } from '@/lib/locale';

export async function generateStaticParams() {
  return [{ locale: 'cn' }, { locale: 'au' }];
}

export const metadata: Metadata = {
  title: 'Readlyne',
  description: 'AI-powered relationship communication insights.',
  appleWebApp: { capable: true, title: 'Readlyne', statusBarStyle: 'default' },
  openGraph: { title: 'Readlyne', description: 'AI relationship insights.', type: 'website' },
  twitter: { card: 'summary', title: 'Readlyne', description: 'AI relationship insights.' },
  other: { 'mobile-web-app-capable': 'yes' },
};

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false, themeColor: '#ffffff',
};

export default function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = use(params);
  const locale = (rawLocale || 'cn') as Locale;
  return (
    <LocaleProvider locale={locale}>
      <div className="app-container">{children}</div>

    </LocaleProvider>
  );
}
