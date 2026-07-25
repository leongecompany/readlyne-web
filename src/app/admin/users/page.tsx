'use client';

import { useState, useEffect, useMemo } from 'react';
import { getUsers, formatTime } from '@/lib/admin-api';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string>('total_requests');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    getUsers().then(d => d.ok && setUsers(d.users));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...users]
      .filter(u => (u.installation_id || '').includes(q))
      .sort((a, b) => {
        const av = a[sortKey] ?? '';
        const bv = b[sortKey] ?? '';
        if (typeof av === 'number') return sortDir === 'desc' ? bv - av : av - bv;
        return sortDir === 'desc' ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
      });
  }, [users, search, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortHeader = ({ label, field }: { label: string; field: string }) => (
    <th style={{
      padding: '8px 10px', textAlign: 'left', fontWeight: 500, color: '#8e8e93',
      cursor: 'pointer', borderBottom: '2px solid #e5e5e5', whiteSpace: 'nowrap',
    }} onClick={() => toggleSort(field)}>
      {label} {sortKey === field && <span style={{ color: '#0066ff' }}>{sortDir === 'desc' ? '↓' : '↑'}</span>}
    </th>
  );

  return (
    <div data-admin-root>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Users</h1>
        <p style={{ fontSize: 13, color: '#8e8e93', margin: '4px 0 0' }}>{users.length} users</p>
      </div>

      <input type="text" placeholder="搜索用户ID…"
        value={search} onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', maxWidth: 320, padding: '8px 12px', border: '1px solid #e5e5e5',
          borderRadius: 6, fontSize: 13, outline: 'none', marginBottom: 16, background: '#fff', color: '#000',
        }}
      />

      <div style={{ overflowX: 'auto', border: '1px solid #e5e5e5', borderRadius: 10 }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <SortHeader label="User ID" field="installation_id" />
              <SortHeader label="请求" field="total_requests" />
              <SortHeader label="Credits" field="credits" />
              <SortHeader label="购买" field="total_purchases" />
              <SortHeader label="注册" field="created_at" />
              <SortHeader label="活动" field="updated_at" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={i} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontSize: 11, color: '#666' }}>
                  {(u.installation_id || '').slice(0, 20)}…
                </td>
                <td style={{ padding: '8px 10px', fontWeight: 600 }}>{u.total_requests || 0}</td>
                <td style={{ padding: '8px 10px' }}>
                  <span style={{
                    color: (u.credits || 0) > 0 ? '#34c759' : '#aeaeb2', fontWeight: 600,
                  }}>{u.credits || 0}</span>
                </td>
                <td style={{ padding: '8px 10px' }}>
                  {(u.total_purchases || 0) > 0
                    ? <span style={{ color: '#34c759', fontWeight: 600 }}>${u.total_purchases}</span>
                    : <span style={{ color: '#aeaeb2' }}>—</span>}
                </td>
                <td style={{ padding: '8px 10px', color: '#8e8e93', fontSize: 11 }}>{formatTime(u.created_at)}</td>
                <td style={{ padding: '8px 10px', color: '#8e8e93', fontSize: 11 }}>{formatTime(u.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
