'use client';

import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_WEB_API_BASE_URL || 'https://readlyne-proxy.onrender.com';
const ACCESS_CODE = 'rl2026';

export default function DashboardPage() {
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState('');
  const [data, setData] = useState<{ count: number; feedback: any[] }>({ count: 0, feedback: [] });
  const [loading, setLoading] = useState(false);

  // Check URL param on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('code') === ACCESS_CODE) {
      setAuthed(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/web/admin/feedback`);
      const json = await res.json();
      setData(json);
    } catch {}
    setLoading(false);
  };

  const handleLogin = () => {
    if (code === ACCESS_CODE) {
      setAuthed(true);
      window.history.replaceState({}, '', '?code=' + ACCESS_CODE);
      loadData();
    }
  };

  if (!authed) {
    return (
      <div style={{ maxWidth: 360, margin: '80px auto', padding: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Readlyne 管理后台</h2>
        <input
          type="password"
          className="text-input"
          placeholder="输入管理密码"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          style={{ marginBottom: 12, fontSize: 16 }}
        />
        <button className="btn-primary" onClick={handleLogin} style={{ fontSize: 16 }}>
          进入
        </button>
      </div>
    );
  }

  const emails = data.feedback.filter((f: any) => f.text?.startsWith('[内测申请]'));
  const features = data.feedback.filter((f: any) => f.text?.startsWith('[功能建议]'));
  const other = data.feedback.filter((f: any) =>
    !f.text?.startsWith('[内测申请]') && !f.text?.startsWith('[功能建议]')
  );

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>📊 管理后台</h2>
        <button
          onClick={() => loadData()}
          disabled={loading}
          style={{
            background: 'none', border: '1px solid var(--card-border)',
            padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
          }}
        >
          {loading ? '刷新中…' : '🔄 刷新'}
        </button>
      </div>

      {/* 统计 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <StatCard label="内测申请" count={emails.length} color="#0060df" />
        <StatCard label="功能建议" count={features.length} color="#c93400" />
      </div>

      {/* 内测名单 */}
      <Section title={`📧 内测名单 (${emails.length})`}>
        {emails.length === 0 && <EmptyText />}
        {emails.map((f: any, i: number) => (
          <div key={i} style={itemStyle}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{f.text.replace('[内测申请] ', '')}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{f.time}</div>
          </div>
        ))}
      </Section>

      {/* 功能建议 */}
      <Section title={`💡 功能建议 (${features.length})`}>
        {features.length === 0 && <EmptyText />}
        {features.map((f: any, i: number) => (
          <div key={i} style={itemStyle}>
            <div style={{ fontSize: 14 }}>{f.text.replace('[功能建议] ', '')}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{f.time}</div>
          </div>
        ))}
      </Section>

      {/* 用户反馈 */}
      {other.length > 0 && (
        <Section title={`💬 用户反馈 (${other.length})`}>
          {other.map((f: any, i: number) => (
            <div key={i} style={itemStyle}>
              <div style={{ fontSize: 14 }}>{f.text}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{f.time}</div>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function StatCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{
      flex: 1, background: '#fff', border: '1px solid var(--card-border)',
      borderRadius: 12, padding: '16px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{count}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>{title}</h3>
      {children}
    </div>
  );
}

function EmptyText() {
  return <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>暂无数据</p>;
}

const itemStyle: React.CSSProperties = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--card-border)',
  borderRadius: 10,
  padding: '12px 14px',
  marginBottom: 8,
};
