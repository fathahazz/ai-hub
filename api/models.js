export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { endpoint, apiKey } = req.body;

  if (!apiKey) return res.status(400).json({ error: 'Missing API key' });

  const baseEndpoint = endpoint || 'https://api.openai.com/v1';
  const modelsEndpoint = `${baseEndpoint.replace(/\/$/, '')}/models`;

  try {
    const response = await fetch(modelsEndpoint, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Failed to fetch models' });
    }

    const models = (data.data || [])
      .map(m => m.id)
      .sort();

    return res.status(200).json({ models });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
