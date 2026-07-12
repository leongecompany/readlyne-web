import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Readlyne — 看不懂 TA 的话？AI 分析潜台词和回复建议',
  description: '看不懂 TA 的话？粘贴聊天内容，AI 帮你分析潜台词、误读风险和怎么回。',
  appleWebApp: { capable: true, title: 'Readlyne', statusBarStyle: 'default' },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans">
      <head>
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body>
        <div className="app-container">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
