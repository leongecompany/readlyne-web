'use client';

import { useState, useEffect } from 'react';
import { getRevenue, formatTime } from '@/lib/admin-api';

export default function AdminRevenue() {
  const [rev, setRev] = useState<any>(null);

  useEffect(() => {
    getRevenue().then(d => d.ok && setRev(d));
  }, []);

  if (!rev) return <div style={{ padding: 40, textAlign: 'center', color: '#8e8e93' }}>Loading…</div>;

  return (
    <div data-admin-root>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Revenue</h1>
        <p style={{ fontSize: 13, color: '#8e8e93', margin: '4px 0 0' }}>Stripe 付款记录</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <Box label="今日" value={`A$${(rev.today / 100).toFixed(2)}`} />
        <Box label="本周" value={`A$${(rev.week / 100).toFixed(2)}`} />
        <Box label="本月" value={`A$${(rev.month / 100).toFixed(2)}`} />
        <Box label="付款人数" value={rev.payers} />
        <Box label="退款" value={rev.refunds} color="#ff3b30" />
        <Box label="记录数" value={rev.records.length} />
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #e5e5e5', borderRadius: 10 }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['时间', '金额 (分)', '状态', '用户ID'].map(h => (
                <th key={h} style={{
                  padding: '10px 14px', textAlign: 'left', fontWeight: 500,
                  color: '#8e8e93', borderBottom: '2px solid #e5e5e5',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rev.records.map((r: any, i: number) => (
              <tr key={r.id} style={{ borderBottom: i < rev.records.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                <td style={{ padding: '10px 14px', color: '#8e8e93', fontSize: 11 }}>{formatTime(r.time)}</td>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{r.amount}</td>
                <td style={{ padding: '10px 14px' }}>
                  <Badge status={r.status} />
                </td>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: '#666' }}>
                  {(r.installation_id || '').slice(0, 16)}…
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Box({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: 8, padding: '14px 20px', minWidth: 100 }}>
      <div style={{ fontSize: 11, color: '#8e8e93', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: color || '#000' }}>{value}</div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; fg: string; label: string }> = {
    paid: { bg: '#e8f5e9', fg: '#248a3d', label: 'Paid' },
    pending: { bg: '#fff4e0', fg: '#c93400', label: 'Pending' },
    refunded: { bg: '#fce8e6', fg: '#d70015', label: 'Refunded' },
    failed: { bg: '#fff0f0', fg: '#d70015', label: 'Failed' },
  };
  const c = colors[status] || { bg: '#f5f5f7', fg: '#666', label: status };
  return <span style={{ background: c.bg, color: c.fg, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>{c.label}</span>;
}
