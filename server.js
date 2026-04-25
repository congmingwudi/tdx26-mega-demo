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

// Proxy: Claude streaming chat
app.post('/api/claude/chat', async (req, res) => {
  if (!anthropic) return res.status(503).json({ error: 'Anthropic API key not configured' });

  const { messages, systemPrompt } = req.body;
  if (!Array.isArray(messages)) return res.status(400).json({ error: 'messages must be an array' });

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.flushHeaders();

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-opus-4-7',
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

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
