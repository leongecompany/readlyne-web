'use client';

import { useState, useMemo } from 'react';
import { recentUsers, formatTime } from '@/lib/admin-mock';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'analyzeCount' | 'replyCount' | 'lastSeen'>('lastSeen');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...recentUsers]
      .filter(u => u.id.includes(q) || u.country.toLowerCase().includes(q))
      .sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
        }
        return sortDir === 'desc'
          ? String(bVal).localeCompare(String(aVal))
          : String(aVal).localeCompare(String(bVal));
      });
  }, [search, sortKey, sortDir]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  return (
    <div data-admin-root>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Users</h1>
        <p style={{ fontSize: 13, color: '#8e8e93', margin: '4px 0 0' }}>{recentUsers.length} users</p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="搜索用户ID或国家…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', maxWidth: 320, padding: '8px 12px', border: '1px solid #e5e5e5',
          borderRadius: 6, fontSize: 13, outline: 'none', marginBottom: 16,
          background: '#fff', color: '#000',
        }}
      />

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              {[
                { key: 'id', label: 'User ID' },
                { key: 'country', label: '国家' },
                { key: 'lang', label: '语言' },
                { key: 'firstSeen', label: '首次访问' },
                { key: 'analyzeCount', label: '分析', sortable: true },
                { key: 'replyCount', label: '回复', sortable: true },
                { key: 'paid', label: '付费' },
              ].map(col => (
                <th key={col.key} style={{
                  padding: '8px 10px', textAlign: 'left', fontWeight: 500, color: '#8e8e93',
                  cursor: col.sortable ? 'pointer' : 'default',
                  borderBottom: '2px solid #e5e5e5',
                }}
                  onClick={() => col.sortable && toggleSort(col.key as any)}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span style={{ marginLeft: 4, color: '#0066ff' }}>{sortDir === 'desc' ? '↓' : '↑'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontSize: 11, color: '#666' }}>{u.id}</td>
                <td style={{ padding: '8px 10px' }}>{u.country}</td>
                <td style={{ padding: '8px 10px' }}>{u.lang === 'cn' ? '中文' : 'EN'}</td>
                <td style={{ padding: '8px 10px', color: '#8e8e93', fontSize: 11 }}>{formatTime(u.firstSeen)}</td>
                <td style={{ padding: '8px 10px', fontWeight: 600 }}>{u.analyzeCount}</td>
                <td style={{ padding: '8px 10px' }}>{u.replyCount}</td>
                <td style={{ padding: '8px 10px' }}>
                  {u.paid
                    ? <span style={{ color: '#34c759', fontWeight: 600, fontSize: 10 }}>PAID</span>
                    : <span style={{ color: '#aeaeb2' }}>—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
