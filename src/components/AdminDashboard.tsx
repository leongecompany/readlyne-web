'use client';

import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_WEB_API_BASE_URL || 'https://readlyne-proxy.onrender.com';

type Tab = 'overview' | 'traffic' | 'queries' | 'users' | 'feedback' | 'geo';

/* ====== Types ====== */

type Stats = {
  today: {
    total_requests: number; unique_users: number;
    success_count: number; error_count: number;
    analyze_count: number; reply_count: number; deep_count: number;
  };
  total: { total_all_time: number; total_users_all_time: number };
  countries: { country: string; count: number }[];
  installations: number;
  paid_users: number;
};

type TrafficDay = { day: string; requests: number; users: number; analyze: number; reply: number; deep_strategy: number };

type QueryRow = {
  id: number; created_at: string; installation_id: string;
  message: string; context: string; locale: string;
  mode: string; status: string; ip: string;
};

type UserRow = {
  installation_id: string; credits: number; free_uses: number; reply_free_uses: number;
  created_at: string; updated_at: string;
  total_requests: number; today_requests: number;
  last_mode: string; last_active: string; total_purchases: number;
};

type FeedbackRow = { time: string; installation_id_hash: string; ip: string; text: string };

/* ====== Auth: token from URL only ====== */

function getAdminToken(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get('token') || '';
}

async function adminFetch(path: string): Promise<any> {
  const token = getAdminToken();
  if (!token) return { ok: false };
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'x-admin-token': token },
  });
  return res.json();
}

/* ====== Component ====== */
export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data
  const [stats, setStats] = useState<Stats | null>(null);
  const [traffic, setTraffic] = useState<TrafficDay[]>([]);
  const [queries, setQueries] = useState<QueryRow[]>([]);
  const [queriesTotal, setQueriesTotal] = useState(0);
  const [queriesOffset, setQueriesOffset] = useState(0);
  const [queriesMode, setQueriesMode] = useState('');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [trafficDays, setTrafficDays] = useState(7);

  // Verify token on mount
  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setError('请在 URL 中添加 ?token=<管理密码>');
      setChecking(false);
      return;
    }
    adminFetch('/web/admin/stats').then(data => {
      if (data.ok) {
        setAuthed(true);
        setStats(data);
      } else {
        setError('密码错误或服务器未响应');
      }
      setChecking(false);
    });
  }, []);

  // Load data based on active tab
  const loadData = useCallback(async (activeTab: Tab) => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'overview': {
          const s = await adminFetch('/web/admin/stats');
          if (s.ok) setStats(s);
          break;
        }
        case 'traffic': {
          const t = await adminFetch(`/web/admin/traffic?days=${trafficDays}`);
          if (t.ok) setTraffic(t.days);
          break;
        }
        case 'queries': {
          const modeParam = queriesMode ? `&mode=${queriesMode}` : '';
          const q = await adminFetch(`/web/admin/queries?limit=50&offset=${queriesOffset}${modeParam}`);
          if (q.ok) { setQueries(q.queries); setQueriesTotal(q.total); }
          break;
        }
        case 'users': {
          const u = await adminFetch('/web/admin/users');
          if (u.ok) { setUsers(u.users); setUsersTotal(u.total); }
          break;
        }
        case 'feedback': {
          const f = await adminFetch('/web/admin/feedback');
          if (f.ok) setFeedback(f.feedback);
          break;
        }
        case 'geo': {
          const s = await adminFetch('/web/admin/stats');
          if (s.ok) setStats(s);
          break;
        }
      }
    } catch (e) { /* ignore */ }
    setLoading(false);
  }, [trafficDays, queriesOffset, queriesMode]);

  // Load on tab change
  useEffect(() => {
    if (authed) loadData(tab);
  }, [authed, tab, loadData]);

  if (checking) {
    return (
      <div style={{ maxWidth: 400, margin: '80px auto', padding: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>验证中…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div style={{ maxWidth: 480, margin: '80px auto', padding: 20, textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>🔒 Readlyne 管理后台</h2>
        <div style={{
          background: '#fff5f5', border: '1px solid #ffd7d5', borderRadius: 12,
          padding: '16px 20px',
        }}>
          <p style={{ fontSize: 14, color: '#d70015', margin: 0 }}>
            {error || '无法访问'}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>
            访问需要有效的 token 参数：<br />
            <code style={{ fontSize: 11 }}>readlyne.com/dashboard?token=&lt;管理密码&gt;</code>
          </p>
        </div>
      </div>
    );
  }

  const maxTraffic = Math.max(...traffic.map(d => d.requests), 1);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>📊 Readlyne 管理后台</h2>
        <button
          onClick={() => loadData(tab)}
          disabled={loading}
          style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--card-border)',
            padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
          }}
        >
          {loading ? '加载中…' : '🔄 刷新'}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { key: 'overview', label: '📈 总览' },
          { key: 'traffic', label: '📊 流量' },
          { key: 'queries', label: '💬 查询' },
          { key: 'users', label: '👤 用户' },
          { key: 'feedback', label: '📧 反馈' },
          { key: 'geo', label: '🌍 地区' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key as Tab); }}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: tab === t.key ? '1.5px solid var(--accent)' : '1px solid var(--card-border)',
              background: tab === t.key ? '#e8f0fe' : 'transparent',
              color: tab === t.key ? 'var(--accent)' : 'var(--text)',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ====== Overview Tab ====== */}
      {tab === 'overview' && stats && (
        <div>
          <Section title="今日数据">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <StatCard label="总请求" value={stats.today.total_requests} />
              <StatCard label="活跃用户" value={stats.today.unique_users} />
              <StatCard label="成功" value={stats.today.success_count} color="#34c759" />
              <StatCard label="失败" value={stats.today.error_count} color={stats.today.error_count > 5 ? '#ff3b30' : '#8e8e93'} />
              <StatCard label="分析" value={stats.today.analyze_count} />
              <StatCard label="回复" value={stats.today.reply_count} />
              <StatCard label="深度策略" value={stats.today.deep_count} />
              <StatCard label="付费用户" value={stats.paid_users} color="#0060df" />
              <StatCard label="注册设备" value={stats.installations} />
            </div>
          </Section>

          <Section title="累计数据">
            <div style={{ display: 'flex', gap: 10 }}>
              <StatCard label="历史总请求" value={stats.total.total_all_time} />
              <StatCard label="历史总用户" value={stats.total.total_users_all_time} />
            </div>
          </Section>

          {stats.countries && stats.countries.length > 0 && (
            <Section title="地区分布（今日）">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {stats.countries.map((c, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', background: 'var(--bg-secondary)',
                    border: '1px solid var(--card-border)', borderRadius: 8,
                  }}>
                    <span style={{ fontSize: 14 }}>{(c.country === 'Unknown' || !c.country) ? '未知' : c.country}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>{c.count}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="快速操作">
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" onClick={() => setTab('queries')} style={{ fontSize: 13, padding: '8px 16px' }}>
                查看用户查询
              </button>
              <button className="btn-secondary" onClick={() => setTab('users')} style={{ fontSize: 13, padding: '8px 16px' }}>
                查看用户列表
              </button>
            </div>
          </Section>
        </div>
      )}

      {/* ====== Traffic Tab ====== */}
      {tab === 'traffic' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[7, 14, 30].map(d => (
              <button key={d}
                onClick={() => setTrafficDays(d)}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12,
                  border: trafficDays === d ? '1.5px solid var(--accent)' : '1px solid var(--card-border)',
                  background: trafficDays === d ? '#e8f0fe' : 'transparent',
                  color: trafficDays === d ? 'var(--accent)' : 'var(--text)',
                  cursor: 'pointer', fontWeight: 600,
                }}
              >
                过去{d}天
              </button>
            ))}
          </div>

          <Section title="每日请求量">
            {traffic.length === 0 && <EmptyText />}
            {traffic.map((d, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  <span>{d.day?.slice(5) || '今日'}</span>
                  <span>{d.requests} 请求 / {d.users} 用户</span>
                </div>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 6, height: 20, overflow: 'hidden' }}>
                  <div style={{
                    width: `${(d.requests / maxTraffic) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #0060df, #409cff)',
                    borderRadius: 6,
                    minWidth: d.requests > 0 ? '4px' : 0,
                    transition: 'width 0.3s',
                  }} />
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  <span>分析 {d.analyze}</span>
                  <span>回复 {d.reply}</span>
                  <span>深度 {d.deep_strategy}</span>
                </div>
              </div>
            ))}
          </Section>
        </div>
      )}

      {/* ====== Queries Tab ====== */}
      {tab === 'queries' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>过滤：</span>
            {[{ v: '', l: '全部' }, { v: 'analyze', l: '分析' }, { v: 'reply', l: '回复' }, { v: 'deep_strategy', l: '深度' }].map(m => (
              <button key={m.v}
                onClick={() => { setQueriesMode(m.v); setQueriesOffset(0); }}
                style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 12,
                  border: queriesMode === m.v ? '1.5px solid var(--accent)' : '1px solid var(--card-border)',
                  background: queriesMode === m.v ? '#e8f0fe' : 'transparent',
                  color: queriesMode === m.v ? 'var(--accent)' : 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                {m.l}
              </button>
            ))}
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>共 {queriesTotal} 条</span>
          </div>

          {queries.length === 0 && <EmptyText />}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {queries.map((q) => (
              <div key={q.id} style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--card-border)',
                borderRadius: 10, padding: '10px 12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: 'var(--text-tertiary)' }}>
                  <span>
                    {new Date(q.created_at).toLocaleString('zh-CN', {
                      month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                  <span>
                    [{q.mode}] {q.installation_id?.slice(0, 12)}
                  </span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {q.message?.slice(0, 500)}
                  {q.message?.length > 500 && '…'}
                </div>
                {q.context && (
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                    背景: {q.context?.slice(0, 200)}{q.context?.length > 200 && '…'}
                  </div>
                )}
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>
                  {q.status === 'error' && <span style={{ color: '#ff3b30' }}>⚠️ 失败 </span>}
                  {q.locale === 'en' ? '英文' : '中文'} · IP: {q.ip || '-'}
                </div>
              </div>
            ))}
          </div>

          {queriesTotal > 50 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <button className="btn-secondary" disabled={queriesOffset === 0}
                onClick={() => setQueriesOffset(Math.max(0, queriesOffset - 50))}
                style={{ fontSize: 12, padding: '6px 14px', opacity: queriesOffset === 0 ? 0.5 : 1 }}
              >
                上一页
              </button>
              <span style={{ fontSize: 12, alignSelf: 'center', color: 'var(--text-secondary)' }}>
                {queriesOffset / 50 + 1} / {Math.ceil(queriesTotal / 50)}
              </span>
              <button className="btn-secondary" disabled={queriesOffset + 50 >= queriesTotal}
                onClick={() => setQueriesOffset(queriesOffset + 50)}
                style={{ fontSize: 12, padding: '6px 14px', opacity: queriesOffset + 50 >= queriesTotal ? 0.5 : 1 }}
              >
                下一页
              </button>
            </div>
          )}
        </div>
      )}

      {/* ====== Users Tab ====== */}
      {tab === 'users' && (
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>共 {usersTotal} 个注册设备</p>
          {users.length === 0 && <EmptyText />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {users.map((u, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', background: 'var(--bg-secondary)',
                border: '1px solid var(--card-border)', borderRadius: 8,
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, fontFamily: 'monospace' }}>
                    {u.installation_id?.slice(0, 16)}…
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    注册 {new Date(u.created_at).toLocaleDateString('zh-CN')}
                    {u.last_active && ` · 最后活跃 ${new Date(u.last_active).toLocaleDateString('zh-CN')}`}
                    {u.last_mode && ` · ${u.last_mode}`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    💰{u.credits} · 📊{u.total_requests}
                    {u.total_purchases > 0 && <span style={{ color: '#34c759' }}> · 💳+${u.total_purchases}</span>}
                  </div>
                  {u.today_requests > 0 && (
                    <div style={{ fontSize: 11, color: '#0060df' }}>今日 +{u.today_requests}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====== Feedback Tab ====== */}
      {tab === 'feedback' && (
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>共 {feedback.length} 条反馈</p>
          {feedback.length === 0 && <EmptyText />}
          {feedback.map((f, i) => (
            <div key={i} style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--card-border)',
              borderRadius: 10, padding: '12px 14px', marginBottom: 8,
            }}>
              <div style={{ fontSize: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{f.text}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                {new Date(f.time).toLocaleString('zh-CN')} · {f.installation_id_hash || '-'} · {f.ip || '-'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ====== Geo Tab ====== */}
      {tab === 'geo' && stats && (
        <div>
          {stats.countries && stats.countries.length > 0 ? (
            <>
              <Section title="地区分布（今日）">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {stats.countries.map((c, i) => {
                    const maxC = Math.max(...stats.countries.map(x => x.count), 1);
                    const pct = (c.count / maxC) * 100;
                    return (
                      <div key={i} style={{
                        padding: '8px 12px', background: 'var(--bg-secondary)',
                        border: '1px solid var(--card-border)', borderRadius: 8,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 500 }}>
                            {(c.country === 'Unknown' || !c.country) ? '未知' : c.country}
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>{c.count}</span>
                        </div>
                        <div style={{ background: 'var(--card-border)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                          <div style={{
                            width: `${pct}%`, height: '100%',
                            background: 'linear-gradient(90deg, #ff9500, #ffcc02)',
                            borderRadius: 4, transition: 'width 0.3s',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>
                数据来源: ip-api.com
              </p>
            </>
          ) : <EmptyText />}
        </div>
      )}
    </div>
  );
}

/* ====== Helper Components ====== */

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--card-border)',
      borderRadius: 10, padding: '12px 10px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || 'var(--text)' }}>
        {value.toLocaleString()}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 10px' }}>{title}</h3>
      {children}
    </div>
  );
}

function EmptyText() {
  return <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', padding: 20 }}>暂无数据</p>;
}
