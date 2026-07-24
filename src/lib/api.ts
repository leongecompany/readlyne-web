// Frontend API calls — goes through Render backend
const API_BASE = process.env.NEXT_PUBLIC_WEB_API_BASE_URL || 'https://readlyne-proxy.onrender.com';

function getInstallationId(): string {
  if (typeof window === 'undefined') return 'web-anonymous';
  // Try localStorage first (fast)
  let id = localStorage.getItem('readlyne_installation_id');
  if (id) return id;
  // Try IndexedDB (survives cache clear)
  try {
    const request = indexedDB.open('readlyne_store', 1);
    request.onsuccess = () => {
      const db = request.result;
      if (db.objectStoreNames.contains('state')) {
        const tx = db.transaction('state', 'readonly');
        const store = tx.objectStore('state');
        const getReq = store.get('installation_id');
        getReq.onsuccess = () => {
          if (getReq.result) localStorage.setItem('readlyne_installation_id', getReq.result);
        };
      }
    };
    request.onupgradeneeded = () => {
      request.result.createObjectStore('state');
    };
  } catch {}
  // Fallback: create new persistent ID
  id = 'web-' + crypto.randomUUID().slice(0, 12);
  localStorage.setItem('readlyne_installation_id', id);
  // Also store in IndexedDB
  try {
    const request = indexedDB.open('readlyne_store', 1);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('state')) {
        db.close();
        const reopen = indexedDB.open('readlyne_store', 2);
        reopen.onupgradeneeded = () => { reopen.result.createObjectStore('state'); };
        reopen.onsuccess = () => {
          const tx = reopen.result.transaction('state', 'readwrite');
          tx.objectStore('state').put(id, 'installation_id');
        };
      } else {
        const tx = db.transaction('state', 'readwrite');
        tx.objectStore('state').put(id, 'installation_id');
      }
    };
    request.onupgradeneeded = () => {
      request.result.createObjectStore('state');
    };
  } catch {}
  return id;
}

// Generate stable operation UUID for retry idempotency
function makeRequestId(): string {
  if (typeof window === 'undefined' || !window.crypto?.randomUUID) {
    return 'web-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
  }
  return window.crypto.randomUUID();
}

const headers = () => {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-installation-id': getInstallationId(),
  };
  return h;
};

export async function analyzeMessage(message: string, context = '', locale = 'cn', operationId?: string) {
  const res = await fetch(`${API_BASE}/web/analyze`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      message: message.trim(),
      context: context.trim(),
      locale,
      operation_id: operationId,
    }),
  });
  return res.json();
}

export async function getReplySuggestions(message: string, context = '', locale = 'cn', operationId?: string) {
  const res = await fetch(`${API_BASE}/web/reply`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      message: message.trim(),
      context: context.trim(),
      operation_id: operationId,
    }),
  });
  return res.json();
}

export async function createCheckout(reportId: string) {
  const res = await fetch(`${API_BASE}/web/create-checkout`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ report_id: reportId }),
  });
  return res.json();
}

export async function getReport(reportId: string) {
  const res = await fetch(`${API_BASE}/web/report/${reportId}`, {
    headers: headers(),
  });
  return res.json();
}

export async function deepStrategy(data: {
  message: string;
  context: string;
  userGoal: string;
  preview?: boolean;
  locale?: string;
  operation_id?: string;
}) {
  const opId = data.operation_id || makeRequestId();
  const res = await fetch(`${API_BASE}/web/deep-strategy`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ ...data, locale: data.locale || 'cn', operation_id: opId }),
  });
  return res.json();
}

// 查询服务端剩余 credits
export async function getCredits(): Promise<{ credits: number; free_remaining: number }> {
  try {
    const res = await fetch(`${API_BASE}/web/credits`, {
      headers: headers(),
    });
    const data = await res.json();
    return data.ok ? { credits: data.credits || 0, free_remaining: data.free_remaining ?? 10 } : { credits: 0, free_remaining: 0 };
  } catch { return { credits: 0, free_remaining: 0 }; }
}

// 手动验证 Stripe session 并恢复 credits（webhook fallback）
export async function claimCredits(sessionId: string) {
  const res = await fetch(`${API_BASE}/web/claim-credits`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ session_id: sessionId }),
  });
  return res.json();
}

// 提交用户反馈
export async function submitFeedback(text: string) {
  const res = await fetch(`${API_BASE}/web/feedback`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ text }),
  });
  return res.json();
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/v1/health`);
  return res.json();
}

export async function createStandardCheckout() {
  const res = await fetch(API_BASE + "/web/create-standard-checkout", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({}),
  });
  return res.json();
}
