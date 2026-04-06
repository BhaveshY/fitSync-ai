import type { VercelRequest, VercelResponse } from 'vercel';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash-lite';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not set in environment');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { prompt, responseMimeType } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const body: any = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    if (responseMimeType) {
      body.generationConfig = {
        responseMimeType,
      };
    }

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error('Gemini API error:', geminiRes.status, errorText);
      return res.status(geminiRes.status).json({ error: 'Gemini API error', details: errorText });
    }

    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
