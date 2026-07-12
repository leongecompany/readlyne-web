const PROXY_URL = process.env.READLYNE_PROXY_URL || 'http://localhost:16888';

export async function callProxy(mode: string, inputText: string, personContext?: string) {
  const url = `${PROXY_URL}/api/v1/chat`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-installation-id': 'readlyne-web-server',
    },
    body: JSON.stringify({
      mode,
      input_text: inputText,
      person_context: personContext || undefined,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Proxy error ${res.status}: ${errText.slice(0, 200)}`);
  }

  return res.json();
}
