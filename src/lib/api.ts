// Local dev: 'http://localhost:16888'
// Production: 'https://readlyne-proxy.onrender.com'
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:16888';

function getInstallationId(): string {
  if (typeof window === 'undefined') return 'web-anonymous';
  let id = localStorage.getItem('readlyne_installation_id');
  if (!id) {
    id = 'web-' + crypto.randomUUID().slice(0, 12);
    localStorage.setItem('readlyne_installation_id', id);
  }
  return id;
}

export async function analyzeSubtext(message: string, personContext = '') {
  const res = await fetch(`${API_BASE}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-installation-id': getInstallationId(),
    },
    body: JSON.stringify({
      mode: 'analyze_subtext',
      input_text: message,
      person_context: personContext || undefined,
    }),
  });
  return res.json();
}

export async function generateAdvice(message: string, situation: string, personContext = '') {
  // For the reply mode, the proxy expects "situation" + "person_context".
  // We pass the user's message as the situation context.
  const res = await fetch(`${API_BASE}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-installation-id': getInstallationId(),
    },
    body: JSON.stringify({
      mode: 'generate_advice',
      input_text: situation || message,
      person_context: personContext || undefined,
    }),
  });
  return res.json();
}
