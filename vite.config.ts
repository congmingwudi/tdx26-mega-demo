import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import Anthropic from '@anthropic-ai/sdk'
import type { Plugin } from 'vite'

// Dev-only plugin: proxy ElevenLabs API calls so the key never reaches the browser.
function elevenLabsProxy(): Plugin {
  let apiKey = '';

  return {
    name: 'elevenlabs-proxy',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, '');
      apiKey = env.ELEVENLABS_API_KEY || '';
      if (!apiKey) console.warn('[elevenlabs-proxy] ELEVENLABS_API_KEY not set in .env');
    },
    configureServer(server) {
      server.middlewares.use('/api/elevenlabs', async (req, res, next) => {
        if (!apiKey) {
          res.statusCode = 503;
          res.end(JSON.stringify({ error: 'ElevenLabs API key not configured' }));
          return;
        }

        // GET /api/elevenlabs/voices
        if (req.url === '/voices' && req.method === 'GET') {
          try {
            const resp = await fetch('https://api.elevenlabs.io/v1/voices', {
              headers: { 'xi-api-key': apiKey },
            });
            const data = await resp.text();
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = resp.status;
            res.end(data);
          } catch {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: 'Failed to reach ElevenLabs API' }));
          }
          return;
        }

        // POST /api/elevenlabs/tts/:voiceId
        const ttsMatch = req.url?.match(/^\/tts\/([^/?]+)/);
        if (ttsMatch && req.method === 'POST') {
          const voiceId = ttsMatch[1];
          const chunks: Buffer[] = [];
          req.on('data', (c: Buffer) => chunks.push(c));
          req.on('end', async () => {
            try {
              const body = Buffer.concat(chunks).toString();
              const resp = await fetch(
                `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
                {
                  method: 'POST',
                  headers: {
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'audio/mpeg',
                  },
                  body,
                },
              );
              if (!resp.ok) {
                res.statusCode = resp.status;
                res.end(await resp.text());
                return;
              }
              res.setHeader('Content-Type', 'audio/mpeg');
              const buffer = await resp.arrayBuffer();
              res.end(Buffer.from(buffer));
            } catch {
              res.statusCode = 502;
              res.end(JSON.stringify({ error: 'Failed to reach ElevenLabs API' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

function claudeProxy(): Plugin {
  let anthropic: Anthropic | null = null;

  return {
    name: 'claude-proxy',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, '');
      const key = env.ANTHROPIC_API_KEY || '';
      if (!key) { console.warn('[claude-proxy] ANTHROPIC_API_KEY not set in .env'); return; }
      anthropic = new Anthropic({ apiKey: key });
    },
    configureServer(server) {
      server.middlewares.use('/api/claude', async (req, res, next) => {
        if (req.url !== '/chat' || req.method !== 'POST') { next(); return; }

        if (!anthropic) {
          res.statusCode = 503;
          res.end(JSON.stringify({ error: 'Anthropic API key not configured' }));
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', (c: Buffer) => chunks.push(c));
        req.on('end', async () => {
          const body = JSON.parse(Buffer.concat(chunks).toString());
          const { messages, systemPrompt, modelId } = body;

          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');

          try {
            const stream = anthropic!.messages.stream({
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
          } catch (err: unknown) {
            res.write(`data: ${JSON.stringify({ error: (err as Error)?.message ?? 'Claude API error' })}\n\n`);
          }
          res.end();
        });
      });
    },
  };
}

function sfModelsProxy(): Plugin {
  let sfClientId = '';
  let sfClientSecret = '';
  let sfDomain = '';
  let sfToken = '';
  let sfTokenExpiry = 0;

  async function getToken() {
    if (sfToken && Date.now() < sfTokenExpiry) return sfToken;
    const resp = await fetch(`${sfDomain}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: sfClientId,
        client_secret: sfClientSecret,
      }),
    });
    if (!resp.ok) throw new Error(`SF OAuth failed: ${resp.status}`);
    const data = await resp.json() as { access_token: string };
    sfToken = data.access_token;
    sfTokenExpiry = Date.now() + 29 * 60 * 1000;
    return sfToken;
  }

  return {
    name: 'sf-models-proxy',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, '');
      sfClientId = env.SF_CLIENT_ID || '';
      sfClientSecret = env.SF_CLIENT_SECRET || '';
      sfDomain = env.SF_DOMAIN || '';
      if (!sfClientId) console.warn('[sf-models-proxy] SF_CLIENT_ID not set — Salesforce models disabled');
    },
    configureServer(server) {
      server.middlewares.use('/api/sf-models', async (req, res, next) => {
        if (req.url !== '/chat' || req.method !== 'POST') { next(); return; }

        if (!sfClientId || !sfClientSecret || !sfDomain) {
          res.statusCode = 503;
          res.end(JSON.stringify({ error: 'Salesforce Models API credentials not configured' }));
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', (c: Buffer) => chunks.push(c));
        req.on('end', async () => {
          const body = JSON.parse(Buffer.concat(chunks).toString());
          const { messages, systemPrompt, modelId } = body;

          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');

          try {
            const token = await getToken();
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
              res.write(`data: ${JSON.stringify({ error: `SF Models API error (${sfResp.status}): ${errText}` })}\n\n`);
              res.end();
              return;
            }

            const data = await sfResp.json() as { generationDetails?: { generations: { content: string }[] }; generations?: { content: string }[]; choices?: { message: { content: string } }[] };
            const text = data?.generationDetails?.generations?.[0]?.content ?? data?.generations?.[0]?.content ?? data?.choices?.[0]?.message?.content ?? '';
            const words = text.split(/(?<=\s)/);
            const CHUNK_SIZE = 5;
            for (let i = 0; i < words.length; i += CHUNK_SIZE) {
              const chunk = words.slice(i, i + CHUNK_SIZE).join('');
              res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
              if (typeof (res as any).flush === 'function') (res as any).flush();
              await new Promise(r => setTimeout(r, 12));
            }
            res.write('data: [DONE]\n\n');
          } catch (err: unknown) {
            res.write(`data: ${JSON.stringify({ error: (err as Error)?.message ?? 'SF Models API error' })}\n\n`);
          }
          res.end();
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), elevenLabsProxy(), claudeProxy(), sfModelsProxy()],
})
