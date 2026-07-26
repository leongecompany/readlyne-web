'use client';

import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_WEB_API_BASE_URL || 'https://readlyne-proxy.onrender.com';

const TOKEN_KEY = 'readlyne_admin_token';

function storedToken(): string {
  if (typeof window === 'undefined') return '';
  // Priority: URL param > localStorage
  return new URLSearchParams(window.location.search).get('token') || localStorage.getItem(TOKEN_KEY) || '';
}

async function apiFetch(path: string): Promise<any> {
  const token = storedToken();
  if (!token) return { ok: false };
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { 'x-admin-token': token },
      signal: AbortSignal.timeout(8000),
    });
    return res.json();
  } catch {
    return { ok: false, error: 'NETWORK_ERROR' };
  }
}

function fmtDate(iso: string): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return '—'; }
}

type Pg = 'overview' | 'users' | 'queries' | 'settings';

export default function Admin() {
  const [tab, setTab] = useState<Pg>('overview');
  const [auth, setAuth] = useState<boolean | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [traffic, setTraffic] = useState<any[]>([]);
  const [在线, setOnline] = useState<number>(0);
  const [users, setUsers] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  // Auth check on mount
  useEffect(() => {
    const tok = storedToken();
    if (!tok) {
      setAuth(false);
      return;
    }
    apiFetch('/web/admin/stats').then(d => {
      if (d.ok) { setAuth(true); setStats(d); } else setAuth(false);
    }).catch(() => setAuth(false));
  }, []);

  const load = useCallback(async () => {
    const [s, t, o, u, e] = await Promise.all([
      apiFetch('/web/admin/stats'),
      apiFetch('/web/admin/traffic?days=30'),
      apiFetch('/web/admin/online'),
      apiFetch('/web/admin/users'),
      apiFetch('/web/admin/errors'),
    ]);
    if (s.ok) setStats(s);
    if (t.ok) setTraffic(t.days || []);
    if (o.ok) setOnline(o.online);
    if (u.ok) setUsers(u.users?.slice(0, 15) || []);
    if (e.ok) setErrors(e.errors?.slice(0, 8) || []);
    if (s.ok && s.countries) setCountries(s.countries);
  }, []);

  useEffect(() => { if (auth) load(); }, [auth, load]);

  // Online polling
  useEffect(() => {
    if (!auth) return;
    const int = setInterval(async () => {
      const d = await apiFetch('/web/admin/online');
      if (d.ok) setOnline(d.online);
    }, 30000);
    return () => clearInterval(int);
  }, [auth]);

  // --- Token input / login screen ---
  if (auth === false) {
    const handleSubmit = () => {
      const val = tokenInput.trim();
      if (!val) return;
      localStorage.setItem(TOKEN_KEY, val);
      setAuth(null);
      // Check token
      apiFetch('/web/admin/stats').then(d => {
        if (d.ok) { setAuth(true); setStats(d); } else {
          localStorage.removeItem(TOKEN_KEY);
          setAuth(false);
          alert('Token 无效，请重试');
        }
      }).catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setAuth(false);
        alert('无法连接后端服务');
      });
    };

    // Check if there's a URL token that's just invalid
    const urlToken = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') : null;

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
      }}>
        <div style={{ textAlign: 'center', width: 360 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#8e8e93', marginBottom: 8, letterSpacing: '0.05em' }}>READLYNE</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#000', margin: '0 0 4px' }}>Admin</h1>
          <p style={{ fontSize: 13, color: '#8e8e93', margin: '0 0 24px' }}>输入 Admin Token 登录</p>

          {urlToken && (
            <p style={{ fontSize: 12, color: '#d70015', background: '#fff0f0', padding: '8px 12px', borderRadius: 8, marginBottom: 16 }}>
              URL 中的 token 无效或已过期
            </p>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="password"
              placeholder="输入 token"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e5e5',
                fontSize: 14, outline: 'none', background: '#fafafa', color: '#000',
              }}
              autoFocus
            />
            <button
              onClick={handleSubmit}
              style={{
                padding: '10px 20px', borderRadius: 8, border: 'none',
                background: '#0066ff', color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', opacity: tokenInput.trim() ? 1 : 0.5,
              }}
              disabled={!tokenInput.trim()}
            >登录</button>
          </div>
        </div>
      </div>
    );
  }

  if (auth === null) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
      }}>
        <div style={{ width: 24, height: 24, border: '2px solid #f0f0f0', borderTopColor: '#0066ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      </div>
    );
  }

  const s = stats;
  const maxR = Math.max(...traffic.map(d => d.requests), 1);
  const maxU = Math.max(...traffic.map(d => d.users), 1);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuth(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#fff', color: '#000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
    }}>
      <style>{'.site-footer,.bottom-nav,[aria-label="Toggle theme"]{display:none!important}'}</style>

      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f0f0f0',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em' }}>Readlyne</span>
            <span style={{ fontSize: 11, color: '#aeaeb2', fontWeight: 500 }}>Admin</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#34c759' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34c759', display: 'inline-block' }} />
              {在线} 在线
            </div>
            <nav style={{ display: 'flex', gap: 2 }}>
              {(['overview', 'users', 'queries', 'settings'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{
                    padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                    border: 'none', cursor: 'pointer', background: tab === t ? '#f5f5f5' : 'transparent',
                    color: tab === t ? '#000' : '#666',
                  }}
                >{t === 'overview' ? '总览' : t==='users'?'用户':t==='queries'?'查询':'设置'}</button>
              ))}
            </nav>
            <button onClick={handleLogout}
              style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                border: '1px solid #e5e5e5', cursor: 'pointer', background: 'transparent',
                color: '#8e8e93',
              }}
            >退出</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>
        {tab === 'overview' && (
          <>
            {s && (
              <div style={{ marginBottom: 48 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#8e8e93', letterSpacing: '0.05em', marginBottom: 4 }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                  <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {s.today.unique_users || 0}
                  </span>
                  <span style={{ fontSize: 15, color: '#8e8e93' }}>今日活跃用户</span>
                </div>
                <div style={{ display: 'flex', gap: 32, marginTop: 12 }}>
                  {[
                    { label: '分析', value: s.today.analyze_count },
                    { label: '回复', value: s.today.reply_count },
                    { label: '设备', value: s.installations },
                    { label: '付费', value: s.paid_users },
                  ].map(m => (
                    <div key={m.label} style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 18, fontWeight: 600 }}>{m.value}</span>
                      <span style={{ fontSize: 12, color: '#aeaeb2' }}>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {s && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, padding: '10px 0', borderTop: '1px solid #f0f0f0' }}>
                <span style={{ fontSize: 11, color: '#8e8e93', fontWeight: 500 }}>API 成本预估</span>
                <span style={{ background: '#f5f5f5', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>
                  今日约 <b>${((s.today.total_requests || 0) * 0.00015).toFixed(3)}</b>
                </span>
                <span style={{ background: '#f5f5f5', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>
                  本月约 <b>${((s.today.total_requests || 0) * 30 * 0.00015).toFixed(2)}</b>
                </span>
                <span style={{ fontSize: 10, color: '#aeaeb2' }}>基于 DeepSeek v4 均价，仅供参考</span>
              </div>
            )}

            {traffic.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#8e8e93' }}>最近 30 天</span>
                  <span style={{ fontSize: 11, color: '#aeaeb2' }}>
                    <span style={{ color: '#0066ff' }}>●</span> Users <span style={{ color: '#34c759', marginLeft: 12 }}>●</span> Requests
                  </span>
                </div>
                <div style={{ height: 240, position: 'relative' }}>
                  <svg width="100%" height="240" viewBox="0 0 1200 240" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    {[0,1,2,3,4].map(i => (
                      <line key={i} x1={0} y1={48*i+20} x2={1200} y2={48*i+20} stroke="#f5f5f5" strokeWidth={1} />
                    ))}
                    <path
                      d={traffic.map((d, i) => `${i===0?'M':'L'}${(i/(traffic.length-1))*1200},${240-(d.users/maxU)*200}`).join(' ')+`L${1200},240L0,240Z`}
                      fill="url(#userGrad)" opacity={0.15}
                    />
                    <polyline
                      points={traffic.map((d,i) => `${(i/(traffic.length-1))*1200},${240-(d.users/maxU)*200}`).join(' ')}
                      fill="none" stroke="#0066ff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                    />
                    <polyline
                      points={traffic.map((d,i) => `${(i/(traffic.length-1))*1200},${240-(d.requests/maxR)*200}`).join(' ')}
                      fill="none" stroke="#34c759" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0066ff" />
                        <stop offset="100%" stopColor="#0066ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            )}

            {countries.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#8e8e93' }}>用户地区</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {countries.map((c: any, i: number) => {
                    const maxC = Math.max(...countries.map(x => x.count), 1);
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: '#fafafa', borderRadius: 8, padding: '6px 12px',
                        fontSize: 12, border: '1px solid #f0f0f0',
                      }}>
                        <span style={{ fontWeight: 600 }}>{c.country === 'Unknown' || !c.country ? '其他' : c.country}</span>
                        <span style={{
                          background: '#0066ff', color: '#fff', fontSize: 10, fontWeight: 600,
                          padding: '1px 6px', borderRadius: 10, minWidth: 20, textAlign: 'center',
                          opacity: Math.max(0.4, c.count / maxC),
                        }}>{c.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 48 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#8e8e93' }}>最近设备</span>
                  <span style={{ fontSize: 11, color: '#aeaeb2' }}>{users.length} 条</span>
                </div>
                {users.length === 0 && <p style={{ fontSize: 13, color: '#aeaeb2' }}>暂无数据</p>}
                {users.map((u: any, i: number) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: i < users.length - 1 ? '1px solid #f5f5f5' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 28, height: 28, borderRadius: 6, background: '#f5f5f5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 600, color: '#666',
                      }}>{(u.installation_id || '?')[0]}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, fontFamily: 'monospace', color: '#444' }}>
                          {(u.installation_id || '').slice(0, 16)}
                        </div>
                        <div style={{ fontSize: 11, color: '#aeaeb2', marginTop: 1 }}>
                          {u.条_requests || 0} requests {(u.credits || 0) > 0 ? '· Paid' : ''}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: '#aeaeb2' }}>{fmtDate(u.updated_at)}</span>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#8e8e93' }}>最近错误</span>
                  <span style={{ fontSize: 11, color: '#aeaeb2' }}>{errors.length} 条</span>
                </div>
                {errors.length === 0 && <p style={{ fontSize: 13, color: '#aeaeb2' }}>暂无错误 🎉</p>}
                {errors.map((e: any, i: number) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, padding: '8px 0',
                    borderBottom: i < errors.length - 1 ? '1px solid #f5f5f5' : 'none',
                    fontSize: 12,
                  }}>
                    <span style={{ color: '#d70015', fontSize: 10, fontWeight: 600, minWidth: 38, paddingTop: 1 }}>ERROR</span>
                    <span style={{ color: '#666', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.message_snippet || '未知'}
                    </span>
                    <span style={{ color: '#aeaeb2', fontSize: 11, whiteSpace: 'nowrap' }}>{fmtDate(e.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'users' && <UsersPage />}
        {tab === 'queries' && <QueriesPage />}
        {tab === 'settings' && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#aeaeb2' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
            <p style={{ fontSize: 14, margin: 0 }}>设置 — 开发中</p>
          </div>
        )}
      </div>
    </div>
  );
}

function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    apiFetch('/web/admin/users').then(d => d.ok && setUsers(d.users || []));
  }, []);

  const filtered = users.filter(u => (u.installation_id || '').toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>Users</h1>
      <p style={{ fontSize: 13, color: '#8e8e93', margin: '0 0 24px' }}>{users.length} devices</p>
      <input
        placeholder="Search by ID…"
        value={q} onChange={e => setQ(e.target.value)}
        style={{
          width: 320, maxWidth: '100%', padding: '8px 12px',
          border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 13,
          outline: 'none', marginBottom: 20, background: '#fff', color: '#000',
        }}
      />
      <div style={{ overflowX: 'auto', border: '1px solid #e5e5e5', borderRadius: 10 }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              {['ID', '请求', '积分', '购买', '首次', '最近'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, color: '#8e8e93', fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u: any, i: number) => (
              <tr key={i} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 11, color: '#666' }}>{(u.installation_id || '').slice(0, 20)}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{u.条_requests || 0}</td>
                <td style={{ padding: '10px 12px', color: (u.credits || 0) > 0 ? '#34c759' : '#aeaeb2', fontWeight: 600 }}>{u.credits || 0}</td>
                <td style={{ padding: '10px 12px' }}>{(u.条_purchases || 0) > 0 ? `$${u.条_purchases}` : '—'}</td>
                <td style={{ padding: '10px 12px', color: '#8e8e93', fontSize: 11 }}>{fmtDate(u.created_at)}</td>
                <td style={{ padding: '10px 12px', color: '#8e8e93', fontSize: 11 }}>{fmtDate(u.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QueriesPage() {
  const [queries, setQueries] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/web/admin/queries?limit=30').then(d => d.ok && setQueries(d.queries || []));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>Queries</h1>
      <p style={{ fontSize: 13, color: '#8e8e93', margin: '0 0 24px' }}>{queries.length} 最近</p>
      {queries.length === 0 && <p style={{ fontSize: 13, color: '#aeaeb2' }}>暂无查询</p>}
      {queries.map((q: any, i: number) => (
        <div key={i} style={{
          padding: '12px 0', borderBottom: i < queries.length - 1 ? '1px solid #f5f5f5' : 'none',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aeaeb2', marginBottom: 4 }}>
            <span>{(q.installation_id || '').slice(0, 16)} · {q.mode}</span>
            <span>{fmtDate(q.created_at)}</span>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {q.message?.slice(0, 200) || '—'}
          </div>
        </div>
      ))}
    </div>
  );
}
