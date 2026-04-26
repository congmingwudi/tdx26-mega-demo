import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;
const API_KEY = process.env.ELEVENLABS_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

// Salesforce Models API credentials
const SF_CLIENT_ID     = process.env.SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
const SF_DOMAIN        = process.env.SF_DOMAIN; // e.g. https://myorg.my.salesforce.com

// In-memory OAuth token cache (token expires in 30 min; we refresh 60s early)
let sfToken = null;
let sfTokenExpiry = 0;

async function getSfToken() {
  if (sfToken && Date.now() < sfTokenExpiry) return sfToken;
  if (!SF_CLIENT_ID || !SF_CLIENT_SECRET || !SF_DOMAIN) return null;

  const resp = await fetch(`${SF_DOMAIN}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: SF_CLIENT_ID,
      client_secret: SF_CLIENT_SECRET,
    }),
  });
  if (!resp.ok) throw new Error(`SF OAuth failed: ${resp.status} ${await resp.text()}`);
  const data = await resp.json();
  sfToken = data.access_token;
  sfTokenExpiry = Date.now() + (29 * 60 * 1000); // 29 min
  return sfToken;
}

if (!API_KEY) {
  console.error('ELEVENLABS_API_KEY is not set. ElevenLabs voices will not work.');
}

app.use(express.json());

// Proxy: list voices
app.get('/api/elevenlabs/voices', async (req, res) => {
  if (!API_KEY) return res.status(503).json({ error: 'ElevenLabs API key not configured' });
  try {
    const resp = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': API_KEY },
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach ElevenLabs API' });
  }
});

// Proxy: text-to-speech
app.post('/api/elevenlabs/tts/:voiceId', async (req, res) => {
  if (!API_KEY) return res.status(503).json({ error: 'ElevenLabs API key not configured' });
  try {
    const resp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${req.params.voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify(req.body),
      },
    );
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).send(text);
    }
    res.set('Content-Type', 'audio/mpeg');
    const buffer = await resp.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach ElevenLabs API' });
  }
});

// Proxy: Claude streaming chat (direct Anthropic API)
app.post('/api/claude/chat', async (req, res) => {
  if (!anthropic) return res.status(503).json({ error: 'Anthropic API key not configured' });

  const { messages, systemPrompt, modelId } = req.body;
  if (!Array.isArray(messages)) return res.status(400).json({ error: 'messages must be an array' });

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.flushHeaders();

  try {
    const stream = anthropic.messages.stream({
      model: modelId || 'claude-opus-4-7',
      max_tokens: 1024,
      system: systemPrompt || 'You are a helpful assistant.',
      messages,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message || 'Claude API error' })}\n\n`);
  }

  res.end();
});

// Proxy: Salesforce Models API chat (non-streaming — SF API returns full response)
app.post('/api/sf-models/chat', async (req, res) => {
  if (!SF_CLIENT_ID || !SF_CLIENT_SECRET || !SF_DOMAIN) {
    return res.status(503).json({ error: 'Salesforce Models API credentials not configured' });
  }

  const { messages, systemPrompt, modelId } = req.body;
  if (!Array.isArray(messages) || !modelId) {
    return res.status(400).json({ error: 'messages and modelId are required' });
  }

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.flushHeaders();

  try {
    const token = await getSfToken();

    // Build the messages array — prepend system as a system-role message
    const allMessages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...messages,
    ];

    const sfResp = await fetch(
      `https://api.salesforce.com/einstein/platform/v1/models/${modelId}/chat-generations`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-sfdc-app-context': 'EinsteinGPT',
          'x-client-feature-id': 'ai-platform-models-connected-app',
        },
        body: JSON.stringify({ messages: allMessages }),
      },
    );

    if (!sfResp.ok) {
      const errText = await sfResp.text();
      res.write(`data: ${JSON.stringify({ error: `Salesforce Models API error (${sfResp.status}): ${errText}` })}\n\n`);
      res.end();
      return;
    }

    const data = await sfResp.json();

    // SF Models API returns: { generationDetails: { generations: [{ content: "..." }] } }
    const text = data?.generationDetails?.generations?.[0]?.content ?? data?.generations?.[0]?.content ?? data?.choices?.[0]?.message?.content ?? '';

    // SF doesn't support streaming, so simulate it by emitting ~5 words at a time
    // with a small delay and an explicit flush so the browser receives chunks progressively.
    const words = text.split(/(?<=\s)/);
    const CHUNK_SIZE = 5;
    for (let i = 0; i < words.length; i += CHUNK_SIZE) {
      const chunk = words.slice(i, i + CHUNK_SIZE).join('');
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      if (typeof res.flush === 'function') res.flush();
      await new Promise(r => setTimeout(r, 12));
    }

    res.write('data: [DONE]\n\n');
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message || 'Salesforce Models API error' })}\n\n`);
  }

  res.end();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
