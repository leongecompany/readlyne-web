import Link from 'next/link';

export default function RootPage() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100dvh', gap: 24, padding: 20, textAlign: 'center', fontFamily: '-apple-system, sans-serif',
    }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Readlyne</h1>
      <p style={{ fontSize: 15, color: '#86868b', margin: 0, maxWidth: 260 }}>
        {`Don't understand them? AI analyzes subtext, risks, and best replies.`}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 200 }}>
        <Link href="/cn" style={{
          padding: '16px', background: '#1d1d1f', color: '#fff', borderRadius: 12,
          textDecoration: 'none', fontSize: 17, fontWeight: 600,
        }}>🇨🇳 中文</Link>
        <Link href="/au" style={{
          padding: '16px', background: '#1d1d1f', color: '#fff', borderRadius: 12,
          textDecoration: 'none', fontSize: 17, fontWeight: 600,
        }}>🇦🇺 English</Link>
      </div>
    </div>
  );
}
