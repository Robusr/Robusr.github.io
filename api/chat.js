// api/chat.js — DeepSeek API proxy for Robusr's Utopia
// Zero external dependencies — uses Node.js 18+ native fetch

import { readFileSync } from 'fs';
import { join } from 'path';

const SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), 'prompt', 'system.md'), 'utf-8'
);

// Simple in-memory rate limiter: max 1 request per 30s per IP
// State resets on cold starts — acceptable for a personal homepage
const rateLimit = new Map();
const RATE_WINDOW = 30_000; // 30 seconds

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const last = rateLimit.get(ip) || 0;
  if (Date.now() - last < RATE_WINDOW) {
    return res.status(429).json({ error: 'Too fast. Wait a moment.' });
  }
  rateLimit.set(ip, Date.now());

  // Parse body
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { message } = body;
  if (!message || typeof message !== 'string' || message.length > 500) {
    return res.status(400).json({ error: 'Invalid message' });
  }

  // Call DeepSeek API (OpenAI-compatible)
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      max_tokens: 512,
      stream: true,
    }),
  });

  if (!response.ok) {
    return res.status(502).json({ error: 'Upstream API error' });
  }

  // Stream the SSE response directly back to the client
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch {
    res.end();
  }
}
