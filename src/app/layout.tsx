import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Readlyne — AI 沟通助手',
  description: '分析聊天潜台词，生成回复建议',
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
