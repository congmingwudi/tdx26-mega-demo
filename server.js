import express from 'express';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;
const API_KEY = process.env.ELEVENLABS_API_KEY;

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

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
