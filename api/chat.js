// ============================================================================
// PDFDesk - Vercel Serverless Function Proxy for NVIDIA NIM
// Solves browser CORS restrictions by proxying requests server-side
// ============================================================================

export default async function handler(req, res) {
  // Set CORS headers for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS immediately with 200 OK
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header.' });
    }

    const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    const nvidiaResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: payload,
    });

    const data = await nvidiaResponse.text();

    res.status(nvidiaResponse.status);
    res.setHeader('Content-Type', 'application/json');
    return res.send(data);
  } catch (error) {
    console.error('NVIDIA proxy error:', error);
    return res.status(500).json({
      error: error?.message || 'Internal proxy communication error',
    });
  }
}
