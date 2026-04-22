import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
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

export default defineConfig({
  plugins: [react(), tailwindcss(), elevenLabsProxy()],
})
