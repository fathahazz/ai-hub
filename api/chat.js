export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { endpoint, apiKey, model, messages, capabilities } = req.body;

  if (!apiKey || !messages) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const baseEndpoint = endpoint || 'https://api.openai.com/v1';
  const chatEndpoint = `${baseEndpoint.replace(/\/$/, '')}/chat/completions`;

  try {
    const response = await fetch(chatEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o',
        messages,
        stream: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API Error' });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
