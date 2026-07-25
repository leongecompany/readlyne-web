'use client';

import { useState, useEffect } from 'react';
import { getStats, getTraffic, getOnline, getUsers, getRevenue, formatTime } from '@/lib/admin-api';

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [traffic, setTraffic] = useState<any[]>([]);
  const [online, setOnline] = useState<number>(0);
  const [users, setUsers] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);

  useEffect(() => {
    getStats().then(d => d.ok && setStats(d));
    getTraffic(30).then(d => d.ok && setTraffic(d.days));
    getOnline().then(d => d.ok && setOnline(d.online));
    getUsers().then(d => d.ok && setUsers(d.users.slice(0, 20)));
    getRevenue().then(d => d.ok && setRevenue(d));
  }, []);

  const maxTraffic = Math.max(...traffic.map(d => d.requests), 1);
  const userMax = Math.max(...traffic.map(d => d.users), 1);
  const popularMode = (stats?.countries || []).slice(0, 3);

  if (!stats) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#8e8e93' }}>Loading…</div>;
  }

  return (
    <div data-admin-root>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#8e8e93', margin: '4px 0 0' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* 6 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
        <StatCard icon="👤" label="总访客" value={stats.installations} />
        <StatCard icon="🆕" label="新用户" value={stats.today.unique_users} sub="今日" />
        <StatCard icon="📊" label="今日分析" value={stats.today.analyze_count} />
        <StatCard icon="💬" label="今日回复" value={stats.today.reply_count} />
        <StatCard icon="💰" label="今日收入" value={revenue ? `A$${(revenue.today / 100).toFixed(2)}` : '…'} />
        <StatCard icon="😊" label="活跃用户" value={stats.today.unique_users} sub={online > 0 ? `🟢 ${online} 在线` : '今日'} />
      </div>

      {/* Chart + Countries */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, marginBottom: 32 }}>
        <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, padding: '20px 22px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>最近30天趋势</h2>
          {traffic.length > 0 && (
            <>
              <div style={{ height: 200, position: 'relative' }}>
                <svg width="100%" height="200" viewBox="0 0 600 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                  {[0, 1, 2, 3, 4].map(i => (
                    <line key={i} x1="0" y1={40 * i} x2="600" y2={40 * i} stroke="#f0f0f0" strokeWidth={1} />
                  ))}
                  <polyline
                    points={traffic.map((d, i) => `${(i / (traffic.length - 1)) * 600},${200 - (d.users / userMax) * 180}`).join(' ')}
                    fill="none" stroke="#0066ff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <polyline
                    points={traffic.map((d, i) => `${(i / (traffic.length - 1)) * 600},${200 - (d.requests / maxTraffic) * 180}`).join(' ')}
                    fill="none" stroke="#34c759" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: 11, color: '#8e8e93' }}>
                <span><span style={{ color: '#0066ff', fontWeight: 600 }}>━</span> 用户数 (峰值 {userMax})</span>
                <span><span style={{ color: '#34c759', fontWeight: 600 }}>━</span> 请求量 (峰值 {maxTraffic})</span>
              </div>
            </>
          )}
          {traffic.length === 0 && <p style={{ color: '#aeaeb2', fontSize: 12 }}>暂无数据</p>}
        </div>

        <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, padding: '20px 22px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>地区分布</h2>
          {(popularMode.length > 0 ? popularMode : [{ country: '暂无数据', count: 0 }]).map((c: any, i: number) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: '#666' }}>{c.country === 'Unknown' || !c.country ? '其他' : c.country}</span>
                <span style={{ fontWeight: 600 }}>{c.count}</span>
              </div>
              {c.count > 0 && (
                <div style={{ background: '#f0f0f0', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{
                    width: `${(c.count / Math.max(...(stats.countries || []).map((x: any) => x.count), 1)) * 100}%`,
                    height: '100%', background: '#0066ff', borderRadius: 4,
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Users + Revenue */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>最近用户</h2>
            <span style={{ fontSize: 11, color: '#8e8e93' }}>{users.length} 条</span>
          </div>
          {users.slice(0, 8).map((u, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 10px', borderRadius: 6, background: '#fafafa', fontSize: 12, marginBottom: 4,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: 11, color: '#666' }}>
                  {(u.installation_id || '').slice(0, 12)}
                </span>
                <span style={{ color: '#8e8e93' }}>{['分析', '回复', '深度'][['analyze', 'reply', 'deep_strategy'].indexOf(u.last_mode || '')] || '-'}</span>
                {(u.credits || 0) > 0 && <span style={{ color: '#34c759', fontSize: 10, fontWeight: 600 }}>PAID</span>}
              </div>
              <span style={{ fontSize: 11, color: '#8e8e93' }}>📊{u.total_requests || 0}</span>
            </div>
          ))}
          {users.length === 0 && <p style={{ color: '#aeaeb2', fontSize: 12 }}>暂无数据</p>}
        </div>

        <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, padding: '20px 22px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 14px' }}>收入概览</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <MiniBox label="今日" value={revenue ? `A$${(revenue.today / 100).toFixed(2)}` : '…'} />
            <MiniBox label="本周" value={revenue ? `A$${(revenue.week / 100).toFixed(2)}` : '…'} />
            <MiniBox label="本月" value={revenue ? `A$${(revenue.month / 100).toFixed(2)}` : '…'} />
            <div style={{ background: '#fafafa', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#8e8e93', marginBottom: 4 }}>付款/退款</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                {revenue?.payers || 0}
                <span style={{ fontSize: 12, fontWeight: 400, color: '#ff3b30' }}> / {revenue?.refunds || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic by day (mini) */}
      {traffic.length > 0 && (
        <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, padding: '20px 22px', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>每日统计</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {traffic.slice(-14).map((d: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <span style={{ width: 50, color: '#8e8e93' }}>{(d.day || '').slice(5) || '-'}</span>
                <div style={{ flex: 1, height: 14, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
                  <div style={{
                    width: `${(d.users / userMax) * 100}%`, height: '100%',
                    background: '#0066ff', borderRadius: 3, minWidth: d.users > 0 ? 4 : 0,
                  }} />
                  <div style={{
                    width: `${(d.requests / maxTraffic) * 100}%`, height: '100%',
                    background: '#34c759', borderRadius: 3, minWidth: d.requests > 0 ? 4 : 0,
                  }} />
                </div>
                <span style={{ width: 60, textAlign: 'right', color: '#666' }}>
                  {d.users}u / {d.requests}r
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10,
      padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#8e8e93' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#aeaeb2' }}>{sub}</div>}
    </div>
  );
}

function MiniBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#fafafa', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#8e8e93', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
