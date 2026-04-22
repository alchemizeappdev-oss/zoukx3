export const config = { runtime: 'edge' };

const HF_MODELS = {
  uncensored: 'mistralai/Mistral-7B-Instruct-v0.3',
  prime: 'meta-llama/Llama-3.1-8B-Instruct',
  code: 'Qwen/Qwen2.5-Coder-7B-Instruct',
  deep: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
  vision: 'meta-llama/Llama-3.2-11B-Vision-Instruct',
};

// In-memory rate limit: 20 requests per minute per IP
const rateLimitMap = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60_000;
  const max = 20;
  const entry = rateLimitMap.get(ip) ?? { count: 0, start: now };
  if (now - entry.start > windowMs) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  rateLimitMap.set(ip, entry);
  return true;
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response('Too Many Requests', { status: 429 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  const { model, messages } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response('Bad Request: messages required', { status: 400 });
  }
  if (messages.length > 50) {
    return new Response('Bad Request: too many messages', { status: 400 });
  }

  // Sanitize — only pass role + content, nothing else
  const sanitized = messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content ?? '').slice(0, 8000),
  }));

  const modelId = HF_MODELS[model] ?? HF_MODELS.uncensored;

  let hfRes;
  try {
    hfRes = await fetch(
      `https://api-inference.huggingface.co/models/${modelId}/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelId,
          messages: sanitized,
          max_tokens: 1024,
          stream: true,
        }),
      }
    );
  } catch (e) {
    console.error('HF fetch failed:', e.message);
    return new Response('Upstream unreachable', { status: 502 });
  }

  if (!hfRes.ok) {
    console.error('HF error status:', hfRes.status);
    return new Response('Upstream error', { status: 502 });
  }

  return new Response(hfRes.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
