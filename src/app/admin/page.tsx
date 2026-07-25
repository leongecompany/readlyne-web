'use client';

import { useState } from 'react';
import {
  stats, dailyStats, featureRanking, recentUsers,
  revenueSummary, errorRecords, formatTime, formatCurrency,
} from '@/lib/admin-mock';

/* ─── Helpers ─── */
function Sparkline({ data, color = '#0066ff' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const w = 120, h = 32;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({ icon, label, value, sub, trend }: { icon: string; label: string; value: string | number; sub?: string; trend?: { up: boolean; pct: string } }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10,
      padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        {trend && (
          <span style={{ fontSize: 11, color: trend.up ? '#34c759' : '#ff3b30', fontWeight: 500 }}>
            {trend.up ? '↑' : '↓'} {trend.pct}
          </span>
        )}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#8e8e93' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#aeaeb2' }}>{sub}</div>}
    </div>
  );
}

/* ─── Main Component ─── */
export default function AdminOverview() {
  const [selectedUsers, setSelectedUsers] = useState(recentUsers.slice(0, 5));

  return (
    <div data-admin-root>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#8e8e93', margin: '4px 0 0' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* 6 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
        <StatCard icon="👤" label="总访客" value={stats.totalVisitors} trend={{ up: true, pct: '12%' }} />
        <StatCard icon="🆕" label="新用户" value={stats.newUsers} sub="今日" />
        <StatCard icon="📊" label="今日分析" value={stats.todayAnalyzes} sub="+15% 较昨日" />
        <StatCard icon="💬" label="今日回复" value={stats.todayReplies} sub="+8% 较昨日" />
        <StatCard icon="💰" label="今日收入" value={`A$${stats.todayRevenue.toFixed(2)}`} trend={{ up: true, pct: '23%' }} />
        <StatCard icon="😊" label="活跃用户" value={stats.todayActiveUsers} sub="今日" />
      </div>

      {/* Chart + Rankings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 32 }}>
        {/* Chart */}
        <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, padding: '20px 22px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>最近30天趋势</h2>
          <div style={{ height: 200, position: 'relative' }}>
            <svg width="100%" height="200" viewBox="0 0 600 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((pct, i) => (
                <line key={i} x1="0" y1={200 - (pct / 100) * 180} x2="600" y2={200 - (pct / 100) * 180}
                  stroke="#f0f0f0" strokeWidth={1} />
              ))}
              {/* User line */}
              <polyline
                points={dailyStats.map((d, i) => `${(i / 29) * 600},${200 - (d.users / 40) * 180}`).join(' ')}
                fill="none" stroke="#0066ff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              {/* Analyze line */}
              <polyline
                points={dailyStats.map((d, i) => `${(i / 29) * 600},${200 - (d.analyzes / 60) * 180}`).join(' ')}
                fill="none" stroke="#34c759" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: 11, color: '#8e8e93' }}>
            <span><span style={{ color: '#0066ff', fontWeight: 600 }}>━</span> 用户数</span>
            <span><span style={{ color: '#34c759', fontWeight: 600 }}>━</span> 分析次数</span>
          </div>
        </div>

        {/* Rankings */}
        <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, padding: '20px 22px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>功能使用排行</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {featureRanking.map((f, i) => (
              <div key={f.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#666' }}>{i + 1}. {f.name}</span>
                  <span style={{ fontWeight: 600 }}>{f.count} <span style={{ fontWeight: 400, color: '#8e8e93' }}>({f.pct}%)</span></span>
                </div>
                <div style={{ background: '#f0f0f0', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${f.pct}%`, height: '100%', background: '#0066ff', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Users + Revenue + Errors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        {/* Recent Users */}
        <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>最近用户</h2>
            <span style={{ fontSize: 11, color: '#8e8e93' }}>共 {recentUsers.length} 条</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentUsers.slice(0, 8).map((u) => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 10px', borderRadius: 6, background: '#fafafa', fontSize: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: 11, color: '#666' }}>{u.id}</span>
                  <span style={{ color: '#8e8e93' }}>{u.country}</span>
                  <span style={{ color: '#8e8e93' }}>{u.lang === 'cn' ? '中文' : 'EN'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#8e8e93' }}>{['分析', '回复', '深度'][Math.floor(Math.random() * 3)]}</span>
                  {u.paid && <span style={{ color: '#34c759', fontSize: 10, fontWeight: 600 }}>PAID</span>}
                  <span style={{ fontSize: 10, color: '#aeaeb2' }}>{formatTime(u.lastSeen)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Summary */}
        <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, padding: '20px 22px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 14px' }}>收入概览</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <RevenueMini label="今日" value={`A$${revenueSummary.today.toFixed(2)}`} />
            <RevenueMini label="本周" value={`A$${revenueSummary.thisWeek.toFixed(2)}`} />
            <RevenueMini label="本月" value={`A$${revenueSummary.thisMonth.toFixed(2)}`} />
            <div style={{ background: '#fafafa', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#8e8e93', marginBottom: 4 }}>付款/退款</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{revenueSummary.payers} <span style={{ fontSize: 12, fontWeight: 400, color: '#ff3b30' }}>/ {revenueSummary.refunds}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Errors */}
      <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, padding: '20px 22px', marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>最近错误</h2>
          <span style={{ fontSize: 11, color: '#8e8e93' }}>最近 20 条</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {errorRecords.slice(0, 8).map((e) => (
            <div key={e.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 10px', borderRadius: 6, fontSize: 12,
              background: '#fafafa',
            }}>
              <span style={{ color: '#ff3b30', fontSize: 10, fontWeight: 600, width: 40 }}>ERROR</span>
              <span style={{ flex: 1, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {e.message}
              </span>
              <span style={{ color: '#aeaeb2', fontSize: 11, width: 80, textAlign: 'right' }}>{e.endpoint}</span>
              <span style={{ color: '#aeaeb2', fontSize: 10, width: 70, textAlign: 'right' }}>{formatTime(e.time)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RevenueMini({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#fafafa', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#8e8e93', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
