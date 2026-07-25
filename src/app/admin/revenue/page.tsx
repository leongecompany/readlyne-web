'use client';

import { revenueRecords, formatTime, formatCurrency } from '@/lib/admin-mock';

export default function AdminRevenue() {
  const total = revenueRecords.reduce((s, r) => s + (r.status === 'paid' ? r.amount : 0), 0);
  const paid = revenueRecords.filter(r => r.status === 'paid').length;
  const refunded = revenueRecords.filter(r => r.status === 'refunded').length;
  const failed = revenueRecords.filter(r => r.status === 'failed').length;

  return (
    <div data-admin-root>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Revenue</h1>
        <p style={{ fontSize: 13, color: '#8e8e93', margin: '4px 0 0' }}>Stripe 付款记录</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <SummaryBox label="总收入" value={`A$${total.toFixed(2)}`} />
        <SummaryBox label="成功付款" value={paid} />
        <SummaryBox label="退款" value={refunded} color="#ff3b30" />
        <SummaryBox label="失败" value={failed} color="#ff9500" />
        <SummaryBox label="总笔数" value={revenueRecords.length} />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e5e5e5', borderRadius: 10 }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              {['时间', '金额', '货币', '状态', '用户ID'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500, color: '#8e8e93', borderBottom: '2px solid #e5e5e5' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {revenueRecords.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: i < revenueRecords.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                <td style={{ padding: '10px 14px', color: '#8e8e93', fontSize: 11 }}>{formatTime(r.time)}</td>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{formatCurrency(r.amount, r.currency)}</td>
                <td style={{ padding: '10px 14px', color: '#666' }}>{r.currency}</td>
                <td style={{ padding: '10px 14px' }}>
                  <StatusBadge status={r.status} />
                </td>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: '#666' }}>{r.userId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryBox({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{
      background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: 8,
      padding: '14px 20px', minWidth: 100,
    }}>
      <div style={{ fontSize: 11, color: '#8e8e93', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: color || '#000' }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; fg: string; label: string }> = {
    paid: { bg: '#e8f5e9', fg: '#248a3d', label: 'Paid' },
    pending: { bg: '#fff4e0', fg: '#c93400', label: 'Pending' },
    refunded: { bg: '#fce8e6', fg: '#d70015', label: 'Refunded' },
    failed: { bg: '#fff0f0', fg: '#d70015', label: 'Failed' },
  };
  const c = colors[status] || { bg: '#f5f5f7', fg: '#666', label: status };
  return (
    <span style={{
      background: c.bg, color: c.fg, fontSize: 10, fontWeight: 600,
      padding: '2px 8px', borderRadius: 4,
    }}>{c.label}</span>
  );
}
