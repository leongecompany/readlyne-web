// Admin API — real data from backend
const API_BASE = process.env.NEXT_PUBLIC_WEB_API_BASE_URL || 'https://readlyne-proxy.onrender.com';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('token') || '';
}

async function adminFetch(path: string): Promise<any> {
  const token = getToken();
  if (!token) return { ok: false };
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'x-admin-token': token },
      signal: AbortSignal.timeout(8000),
    });
    return res.json();
  } catch {
    return { ok: false, error: 'NETWORK_ERROR' };
  }
}

export async function getStats() { return adminFetch('/web/admin/stats'); }
export async function getTraffic(days = 30) { return adminFetch(`/web/admin/traffic?days=${days}`); }
export async function getOnline() { return adminFetch('/web/admin/online'); }
export async function getUsers() { return adminFetch('/web/admin/users'); }
export async function getRevenue() { return adminFetch('/web/admin/revenue'); }
export async function getQueries(params = '') { return adminFetch(`/web/admin/queries?limit=50${params}`); }

export function formatTime(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}
