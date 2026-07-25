'use client';

import { errorRecords, formatTime } from '@/lib/admin-mock';

export default function AdminErrors() {
  return (
    <div data-admin-root>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Errors</h1>
        <p style={{ fontSize: 13, color: '#8e8e93', margin: '4px 0 0' }}>最近 {errorRecords.length} 条错误记录</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <ErrorSummary label="API 错误" value="12" />
        <ErrorSummary label="Stripe 错误" value="5" />
        <ErrorSummary label="数据库错误" value="3" />
        <ErrorSummary label="其他" value="2" />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e5e5e5', borderRadius: 10 }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              {['时间', '错误信息', '接口', '操作'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500, color: '#8e8e93', borderBottom: '2px solid #e5e5e5' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {errorRecords.map((e, i) => (
              <tr key={e.id} style={{ borderBottom: i < errorRecords.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                <td style={{ padding: '10px 14px', color: '#8e8e93', fontSize: 11, whiteSpace: 'nowrap' }}>{formatTime(e.time)}</td>
                <td style={{ padding: '10px 14px', color: '#d70015', fontSize: 11 }}>
                  {e.message}
                </td>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: '#666' }}>{e.endpoint}</td>
                <td style={{ padding: '10px 14px' }}>
                  <button style={{
                    background: 'none', border: '1px solid #e5e5e5', borderRadius: 4,
                    padding: '3px 10px', fontSize: 11, color: '#666', cursor: 'pointer',
                  }}>查看</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ErrorSummary({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{
      background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: 8,
      padding: '14px 20px', minWidth: 100,
    }}>
      <div style={{ fontSize: 11, color: '#8e8e93', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: color || '#d70015' }}>{value}</div>
    </div>
  );
}
