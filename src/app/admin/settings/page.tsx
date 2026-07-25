'use client';

export default function AdminSettings() {
  return (
    <div data-admin-root>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 13, color: '#8e8e93', margin: '4px 0 0' }}>系统设置（开发中）</p>
      </div>

      <div style={{
        border: '1px solid #e5e5e5', borderRadius: 10, padding: '40px',
        textAlign: 'center', color: '#aeaeb2', fontSize: 14,
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
        <p style={{ margin: 0 }}>Settings page coming soon.</p>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#aeaeb2' }}>
          API keys, notifications, team management, and more.
        </p>
      </div>
    </div>
  );
}
