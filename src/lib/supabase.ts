// Supabase REST client — direct fetch, no @supabase/supabase-js dependency
// This avoids build-time side effects from the library

const BASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function api(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}/rest/v1${path}`;
  const { body, ...rest } = options;
  return fetch(url, {
    ...rest,
    body: body as BodyInit,
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    } as Record<string, string>,
  });
}

export async function supabaseInsert(table: string, data: Record<string, any>) {
  if (!BASE_URL || !SERVICE_KEY) {
    console.warn('Supabase not configured — skipping DB write');
    return { data: null, error: { message: 'Not configured' } };
  }
  const res = await api(`/${table}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) return { data: null, error: { message: body?.message || `HTTP ${res.status}` } };
  return { data: Array.isArray(body) ? body[0] : body, error: null };
}

export async function supabaseSelectOne(table: string, column: string, value: string, select = '*') {
  if (!BASE_URL || !SERVICE_KEY) {
    return { data: null, error: { message: 'Not configured' } };
  }
  const res = await api(`/${table}?${column}=eq.${encodeURIComponent(value)}&select=${encodeURIComponent(select)}`);
  const body = await res.json().catch(() => null);
  if (!res.ok) return { data: null, error: { message: body?.message || `HTTP ${res.status}` } };
  return { data: Array.isArray(body) ? body[0] || null : body, error: body && Array.isArray(body) && body.length === 0 ? { message: 'Not found' } : null };
}

export async function supabaseUpdate(table: string, column: string, value: string, data: Record<string, any>) {
  if (!BASE_URL || !SERVICE_KEY) {
    return { data: null, error: { message: 'Not configured' } };
  }
  const res = await api(`/${table}?${column}=eq.${encodeURIComponent(value)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { data: null, error: { message: body?.message || `HTTP ${res.status}` } };
  }
  return { data: true, error: null };
}
