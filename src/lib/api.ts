// Frontend API calls — always goes through our own API routes

function getInstallationId(): string {
  if (typeof window === 'undefined') return 'web-anonymous';
  let id = localStorage.getItem('readlyne_installation_id');
  if (!id) {
    id = 'web-' + crypto.randomUUID().slice(0, 12);
    localStorage.setItem('readlyne_installation_id', id);
  }
  return id;
}

export async function analyzeMessage(message: string, context = '') {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-installation-id': getInstallationId() },
    body: JSON.stringify({ message: message.trim(), context: context.trim() }),
  });
  return res.json();
}

export async function getReport(reportId: string) {
  const res = await fetch(`/api/report/${reportId}`, {
    headers: { 'x-installation-id': getInstallationId() },
  });
  return res.json();
}

export async function createCheckout(reportId: string) {
  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-installation-id': getInstallationId() },
    body: JSON.stringify({ report_id: reportId }),
  });
  return res.json();
}
