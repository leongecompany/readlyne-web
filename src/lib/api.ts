// Frontend API calls — goes through Render backend
const API_BASE = process.env.NEXT_PUBLIC_WEB_API_BASE_URL || 'http://localhost:16888';

function getInstallationId(): string {
  if (typeof window === 'undefined') return 'web-anonymous';
  let id = localStorage.getItem('readlyne_installation_id');
  if (!id) {
    id = 'web-' + crypto.randomUUID().slice(0, 12);
    localStorage.setItem('readlyne_installation_id', id);
  }
  return id;
}

const headers = () => ({
  'Content-Type': 'application/json',
  'x-installation-id': getInstallationId(),
});

export async function analyzeMessage(message: string, context = '') {
  const res = await fetch(`${API_BASE}/web/analyze`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ message: message.trim(), context: context.trim() }),
  });
  return res.json();
}

export async function getReplySuggestions(message: string, context = '') {
  const res = await fetch(`${API_BASE}/web/reply`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ message: message.trim(), context: context.trim() }),
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
}) {
  const res = await fetch(`${API_BASE}/web/deep-strategy`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

// 查询服务端剩余 credits
export async function getCredits(): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/web/credits`, {
      headers: headers(),
    });
    const data = await res.json();
    return data.ok ? data.credits : 0;
  } catch { return 0; }
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

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/v1/health`);
  return res.json();
}
