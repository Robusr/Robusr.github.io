// functions/api/chat.js — DeepSeek API proxy for Cloudflare Pages Functions
// Handles POST /api/chat. Zero dependencies — uses the Web Fetch API.

import { SYSTEM_PROMPT } from '../../prompt/system.js';

const MODEL      = 'deepseek-chat';
const MAX_TOKENS = 512;

export async function onRequestPost({ request, env }) {
  // Guard: missing API key
  if (!env.DEEPSEEK_API_KEY) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Parse and validate body
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { message } = body;
  if (!message || typeof message !== 'string' || message.length > 500) {
    return new Response(JSON.stringify({ error: 'Invalid message' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Call DeepSeek API (OpenAI-compatible)
  const upstream = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      max_tokens: MAX_TOKENS,
      stream: true,
    }),
  });

  if (!upstream.ok) {
    return new Response(JSON.stringify({ error: 'Upstream API error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Stream the SSE response directly back to the client
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
