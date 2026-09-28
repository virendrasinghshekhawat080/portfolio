/** Local development AI backend. Secrets remain server-side; never import this file into React. */
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const PORTFOLIO_INSTRUCTIONS = `You are a friendly Hindi/Hinglish/English general-purpose voice assistant embedded in Virendra Singh Shekhawat's portfolio. Answer the VISITOR'S actual question, not just fixed portfolio links. Reply in the visitor's language, with helpful accurate information. For recipes, give the complete ingredients and numbered cooking steps with approximate time and safe cooking guidance. For simple geography and factual questions, answer clearly and directly. For any information that can change over time (e.g. current Rajasthan district count, news, government, prices) ALWAYS use the web_search tool when available; provide the date or explain if no current source was found. For lengthy replies, use readable short paragraphs and brief numbered steps. Do not invent facts, web searches, or sources. Search online when the user requests recent/current information or asks you to look something up AND web search is available. If search is unavailable, explain that the information may be outdated. You are not ChatGPT itself.
Portfolio facts ONLY if a portfolio question comes up: Virendra Singh Shekhawat is in Jaipur, a Frontend/MERN developer with B.Tech CSE at Shree Balaji College of Engineering & Technology, Jaipur; interned at Techno Derivation; projects include MyStore e-commerce, ecommerce-sit, TaskFlow and Expense Tracker. Do not invent personal facts about visitors or named private persons. Navigation is handled by frontend voice commands, not this model. Never solicit API keys, credentials or secrets.`;

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

async function readJson(req) {
  const chunks = [];
  let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > 16_000) {
      const error = new Error('too-large');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('invalid-json');
    error.status = 400;
    throw error;
  }
}

export function createChatServer({
  apiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_MODEL || 'gpt-4.1-mini',
  fetchAI = globalThis.fetch,
  maxPerMinute = 15,
  webSearch = process.env.WEB_SEARCH_ENABLED !== "0",
  allowedOrigins = process.env.ALLOWED_ORIGIN || "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174",
} = {}) {
  const key = typeof apiKey === 'string' ? apiKey.trim() : '';
  const ready = Boolean(key && !/^(replace_|your_|sk-your|paste_)/i.test(key));
  const hits = new Map();
  const origins = new Set(String(allowedOrigins).split(',').map(x => x.trim().replace(/\/$/, '')).filter(Boolean));
  return createServer(async (req, res) => {
    const origin = req.headers.origin;
    if (origin && !origins.has(origin)) return json(res, 403, { reply: 'This website origin is not allowed. Configure ALLOWED_ORIGIN in backend .env.' });
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    const pathname = new URL(req.url || '/', 'http://localhost').pathname;
    if (req.method === 'GET' && pathname === '/api/health') {
      return json(res, 200, { ready, mode: ready ? 'ai-ready' : 'setup-required', message: ready ? 'AI backend configured' : 'Add OPENAI_API_KEY to the backend .env file to enable general AI chat.' });
    }
    if (req.method !== 'POST' || pathname !== '/api/chat') {
      return json(res, 404, { reply: 'Not found' });
    }
    if (!req.headers['content-type']?.startsWith('application/json')) {
      return json(res, 415, { reply: 'JSON content type required.' });
    }
    const ip = req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    if (hits.size > 1000) hits.clear();
    const recent = (hits.get(ip) || []).filter(at => now - at < 60_000);
    if (recent.length >= maxPerMinute) return json(res, 429, { reply: 'थोड़ा रुककर फिर बात करें।' });
    recent.push(now);
    hits.set(ip, recent);

    let data;
    try {
      data = await readJson(req);
    } catch (error) {
      return json(res, error.status || 400, { reply: error.status === 413 ? 'सवाल बहुत लंबा है। कृपया छोटा सवाल पूछिए।' : 'सवाल का JSON सही नहीं है।' });
    }
    const message = typeof data?.message === 'string' ? data.message.trim().slice(0, 1200) : '';
    if (!message) return json(res, 400, { reply: 'पहले अपना सवाल लिखें या बोलें।' });
    if (!ready) return json(res, 503, { reply: 'वेबसाइट के Voice Commands अभी काम करेंगे। सामान्य AI सवालों के लिए backend की .env फाइल में अपनी API key सेट करें, फिर npm.cmd run chat दोबारा चलाएँ।' });

    const history = Array.isArray(data.history) ? data.history.slice(-8)
      .filter(item => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
      .map(item => ({ role: item.role, content: item.content.slice(0, 1000) })) : [];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const upstream = await fetchAI('https://api.openai.com/v1/responses', {
        method: 'POST',
        signal: controller.signal,
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, instructions: PORTFOLIO_INSTRUCTIONS, input: [...history, { role: 'user', content: message }], max_output_tokens: 780, store: false, ...(webSearch ? { tools: [{ type: "web_search" }] } : {}) }),
      });
      const result = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        console.error('AI service HTTP status:', upstream.status, result.error?.code || 'unknown');
        return json(res, 502, { reply: upstream.status === 401 ? 'AI API key सही नहीं है। Backend की .env फाइल में key जाँचें।' : 'AI सेवा से अभी जवाब नहीं मिला। API credits, key और backend logs जाँचें।' });
      }
      const texts = (result.output || [])
        .flatMap(part => (part.content || []).filter(p => p.type === 'output_text'));
      const reply = texts.map(p => p.text).join('\n').trim().slice(0, 4000);
      const sources = [];
      for (const segment of texts) {
        for (const annotation of segment.annotations || []) {
          if (annotation.type !== 'url_citation' || typeof annotation.url !== 'string') continue;
          try {
            const u = new URL(annotation.url);
            if (u.protocol !== 'https:' && u.protocol !== 'http:') continue;
            if (!sources.some(item => item.url === u.href)) sources.push({ url: u.href, title: String(annotation.title || u.hostname).slice(0, 100) });
          } catch { /* invalid source url */ }
        }
      }
      return json(res, 200, { reply: reply || 'अभी जवाब नहीं मिला। फिर पूछिए।', sources: sources.slice(0, 3) });
    } catch (error) {
      console.error('AI request failed:', error.name);
      return json(res, 502, { reply: error.name === 'AbortError' ? 'AI जवाब देने में समय लग रहा है। थोड़ा बाद में कोशिश करें।' : 'AI से कनेक्शन नहीं हो पाया। इंटरनेट और backend जाँचें।' });
    } finally {
      clearTimeout(timeout);
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (existsSync('.env') && typeof process.loadEnvFile === 'function') process.loadEnvFile('.env');
  const port = Number(process.env.PORT || process.env.CHAT_PORT || 3001);
  const host = process.env.HOST || '127.0.0.1';
  const apiKey = process.env.OPENAI_API_KEY;
  createChatServer({ apiKey }).listen(port, host, () => {
    console.log(`Voice AI backend: http://${host}:${port} • ${apiKey && !/replace_with/i.test(apiKey) ? 'API key supplied' : 'SETUP REQUIRED: configure OPENAI_API_KEY in .env'}`);
  });
}
