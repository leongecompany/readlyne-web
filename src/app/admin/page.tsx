'use client';

import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_WEB_API_BASE_URL || 'https://readlyne-proxy.onrender.com';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('token') || '';
}

async function api(path: string): Promise<any> {
  const token = getToken();
  if (!token) return { ok: false };
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'x-admin-token': token },
      signal: AbortSignal.timeout(8000),
    });
    return res.json();
  } catch { return { ok: false, error: 'NETWORK_ERROR' }; }
}

function fmt(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const TABS = [
  { key: 'overview', label: 'Overview', icon: '◉' },
  { key: 'users', label: 'Users', icon: '◎' },
  { key: 'revenue', label: 'Revenue', icon: '◈' },
  { key: 'errors', label: 'Errors', icon: '◌' },
  { key: 'settings', label: 'Settings', icon: '◊' },
];

export default function AdminPage() {
  const [tab, setTab] = useState('overview');
  const [online, setOnline] = useState<number | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [traffic, setTraffic] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const h = window.location.hash.replace('#', '') || 'overview';
    setTab(h);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api('/web/admin/stats'),
      api('/web/admin/traffic?days=30'),
      api('/web/admin/online'),
      api('/web/admin/users'),
      api('/web/admin/revenue'),
      api('/web/admin/errors'),
    ]).then(([s, t, o, u, r, e]) => {
      if (s.ok) setStats(s);
      if (t.ok) setTraffic(t.days || []);
      if (o.ok) setOnline(o.online);
      if (u.ok) setUsers(u.users || []);
      if (r.ok) setRevenue(r);
      if (e.ok) setErrors(e.errors || []);
      setLoading(false);
    });
    const interval = setInterval(() => {
      api('/web/admin/online').then(d => d.ok && setOnline(d.online));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const navigate = (k: string) => { setTab(k); window.location.hash = k; };

  const main = (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <style>{`
        .site-footer, .bottom-nav, [aria-label="Toggle theme"] { display: none !important; }
        .app-container > footer, .app-container > nav { display: none !important; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
        <aside style={{ width: 220, borderRight: '1px solid #e5e5e5', padding: '0 12px', position: 'fixed', top: 0, left: 0, bottom: 0, background: '#fff', zIndex: 100, overflowY: 'auto' }}>
          <div style={{ padding: '20px 12px 16px', borderBottom: '1px solid #f0f0f0', marginBottom: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em' }}>Readlyne</div>
            <div style={{ fontSize: 11, color: '#8e8e93', marginTop: 1 }}>Admin</div>
          </div>
          <div style={{ padding: '8px 12px 16px', borderBottom: '1px solid #f0f0f0', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#34c759' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34c759', display: 'inline-block' }} />
              Online: {online !== null ? online : '…'}
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => navigate(t.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', textAlign: 'left', color: tab === t.key ? '#000' : '#666', background: tab === t.key ? '#f5f5f5' : 'transparent' }}
              ><span style={{ fontSize: 14, opacity: 0.6 }}>{t.icon}</span>{t.label}</button>
            ))}
          </nav>
        </aside>

        <main style={{ flex: 1, marginLeft: 220, padding: '32px 40px', maxWidth: 'calc(100vw - 220px)' }}>
          {tab === 'overview' && <Overview stats={stats} traffic={traffic} loading={loading} />}
          {tab === 'users' && <Users users={users} />}
          {tab === 'revenue' && <RevenueTab revenue={revenue} />}
          {tab === 'errors' && <ErrTab errors={errors} />}
          {tab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
  return main;
}

function Overview({ stats, traffic, loading }: { stats: any; traffic: any[]; loading: boolean }) {
  if (loading || !stats) return <p style={{ color: '#8e8e93', padding: 40 }}>Loading…</p>;
  const mR = Math.max(...traffic.map(d => d.requests), 1);
  const mU = Math.max(...traffic.map(d => d.users), 1);
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#8e8e93', margin: '4px 0 0' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
        {[
          ['👤', '总访客', stats.installations],
          ['🆕', '今日新用户', stats.today.unique_users],
          ['📊', '今日分析', stats.today.analyze_count],
          ['💬', '今日回复', stats.today.reply_count],
          ['💰', '今日收入', '—'],
          ['😊', '活跃用户', stats.today.unique_users],
        ].map(([icon, label, value], i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 20 }}>{icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 4 }}>{value}</div>
            <div style={{ fontSize: 12, color: '#8e8e93', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
      {traffic.length > 0 && (
        <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, padding: 20, marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>最近30天趋势</h2>
          <div style={{ height: 200 }}>
            <svg width="100%" height="200" viewBox="0 0 600 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              {[0,1,2,3,4].map(i => <line key={i} x1={0} y1={40*i} x2={600} y2={40*i} stroke="#f0f0f0" strokeWidth={1} />)}
              <polyline points={traffic.map((d,i) => `${(i/(traffic.length-1))*600},${200-(d.users/mU)*180}`).join(' ')} fill="none" stroke="#0066ff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={traffic.map((d,i) => `${(i/(traffic.length-1))*600},${200-(d.requests/mR)*180}`).join(' ')} fill="none" stroke="#34c759" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: 11, color: '#8e8e93' }}>
            <span><span style={{ color: '#0066ff' }}>━</span> 用户数</span>
            <span><span style={{ color: '#34c759' }}>━</span> 请求量</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Users({ users }: { users: any[] }) {
  const [q, setQ] = useState('');
  const f = users.filter(u => (u.installation_id||'').includes(q.toLowerCase()));
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Users</h1>
      <p style={{ fontSize: 13, color: '#8e8e93', marginBottom: 16 }}>{users.length} 条</p>
      <input placeholder="搜索ID…" value={q} onChange={e => setQ(e.target.value)}
        style={{ width: '100%', maxWidth: 320, padding: '8px 12px', border: '1px solid #e5e5e5', borderRadius: 6, fontSize: 13, marginBottom: 16, background: '#fff' }} />
      <div style={{ overflowX: 'auto', border: '1px solid #e5e5e5', borderRadius: 10 }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead><tr>
            {['ID', '请求', 'Credits', '购买', '注册', '活跃'].map(h => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 500, color: '#8e8e93', borderBottom: '2px solid #e5e5e5' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {f.map((u:any,i:number) => (
              <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontSize: 11, color: '#666' }}>{(u.installation_id||'').slice(0,18)}</td>
                <td style={{ padding: '8px 10px', fontWeight: 600 }}>{u.total_requests||0}</td>
                <td style={{ padding: '8px 10px', color: (u.credits||0) > 0 ? '#34c759' : '#aeaeb2', fontWeight: 600 }}>{u.credits||0}</td>
                <td style={{ padding: '8px 10px' }}>{(u.total_purchases||0) > 0 ? `$${u.total_purchases}` : '—'}</td>
                <td style={{ padding: '8px 10px', color: '#8e8e93', fontSize: 11 }}>{fmt(u.created_at)}</td>
                <td style={{ padding: '8px 10px', color: '#8e8e93', fontSize: 11 }}>{fmt(u.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RevenueTab({ revenue }: { revenue: any }) {
  if (!revenue) return <p style={{ color: '#8e8e93', padding: 40 }}>Loading…</p>;
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Revenue</h1>
      <p style={{ fontSize: 13, color: '#8e8e93', marginBottom: 16 }}>Stripe 付款</p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          ['今日', `$${(revenue.today/100).toFixed(2)}`],
          ['本周', `$${(revenue.week/100).toFixed(2)}`],
          ['本月', `$${(revenue.month/100).toFixed(2)}`],
          ['付款人数', revenue.payers],
          ['退款', revenue.refunds],
        ].map(([k,v],i) => (
          <div key={i} style={{ background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: 8, padding: '12px 18px', minWidth: 90 }}>
            <div style={{ fontSize: 11, color: '#8e8e93', marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ overflowX: 'auto', border: '1px solid #e5e5e5', borderRadius: 10 }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead><tr>
            {['时间', '金额', '状态', '用户'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500, color: '#8e8e93', borderBottom: '2px solid #e5e5e5' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {revenue.records.map((r:any,i:number) => (
              <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '10px 14px', color: '#8e8e93', fontSize: 11 }}>{fmt(r.time)}</td>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{r.amount}</td>
                <td style={{ padding: '10px 14px' }}><span style={{ background: r.status==='paid'?'#e8f5e9':'#fce8e6', color: r.status==='paid'?'#248a3d':'#d70015', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>{r.status}</span></td>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: '#666' }}>{(r.installation_id||'').slice(0,14)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ErrTab({ errors }: { errors: any[] }) {
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Errors</h1>
      <p style={{ fontSize: 13, color: '#8e8e93', marginBottom: 16 }}>{errors.length} 条</p>
      <div style={{ overflowX: 'auto', border: '1px solid #e5e5e5', borderRadius: 10 }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead><tr>
            {['时间', '用户', '模式', '信息'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500, color: '#8e8e93', borderBottom: '2px solid #e5e5e5' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {errors.length===0 && <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#aeaeb2' }}>暂无错误 🎉</td></tr>}
            {errors.map((e:any,i:number) => (
              <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '10px 14px', color: '#8e8e93', fontSize: 11 }}>{fmt(e.created_at)}</td>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: '#666' }}>{(e.installation_id||'').slice(0,14)}</td>
                <td style={{ padding: '10px 14px' }}>{e.mode}</td>
                <td style={{ padding: '10px 14px', color: '#d70015', fontSize: 11 }}>{e.message_snippet||'-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Settings() {
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Settings</h1>
      <p style={{ fontSize: 13, color: '#8e8e93', marginBottom: 16 }}>开发中</p>
      <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, padding: 60, textAlign: 'center', color: '#aeaeb2' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
        <p style={{ margin: 0, fontSize: 14 }}>Coming soon.</p>
      </div>
    </div>
  );
}
