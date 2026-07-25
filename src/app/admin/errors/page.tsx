'use client';

import { useState, useEffect } from 'react';
import { formatTime } from '@/lib/admin-api';

const API_BASE = process.env.NEXT_PUBLIC_WEB_API_BASE_URL || 'https://readlyne-proxy.onrender.com';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('token') || '';
}

export default function AdminErrors() {
  const [errors, setErrors] = useState<any[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_BASE}/web/admin/errors`, { headers: { 'x-admin-token': token } })
      .then(r => r.json())
      .then(d => d.ok && setErrors(d.errors))
      .catch(() => {});
  }, []);

  return (
    <div data-admin-root>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Errors</h1>
        <p style={{ fontSize: 13, color: '#8e8e93', margin: '4px 0 0' }}>{errors.length} 条错误记录</p>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #e5e5e5', borderRadius: 10 }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['时间', '用户ID', '模式', '错误'].map(h => (
                <th key={h} style={{
                  padding: '10px 14px', textAlign: 'left', fontWeight: 500,
                  color: '#8e8e93', borderBottom: '2px solid #e5e5e5',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {errors.map((e, i) => (
              <tr key={e.id} style={{ borderBottom: i < errors.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                <td style={{ padding: '10px 14px', color: '#8e8e93', fontSize: 11, whiteSpace: 'nowrap' }}>{formatTime(e.created_at)}</td>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: '#666' }}>
                  {(e.installation_id || '').slice(0, 16)}…
                </td>
                <td style={{ padding: '10px 14px', fontSize: 11, color: '#666' }}>{e.mode}</td>
                <td style={{ padding: '10px 14px', color: '#d70015', fontSize: 11 }}>
                  {e.message_snippet || 'Unknown error'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {errors.length === 0 && (
        <p style={{ textAlign: 'center', color: '#aeaeb2', fontSize: 13, marginTop: 40 }}>暂无错误记录 🎉</p>
      )}
    </div>
  );
}
