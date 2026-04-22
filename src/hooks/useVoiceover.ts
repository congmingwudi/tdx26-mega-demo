import { useCallback, useEffect, useRef, useState } from 'react';
import { NARRATIVE } from '../data/narrative-data';

// ---------- Provider interface ----------

export interface VoiceoverProvider {
  speak(text: string): Promise<void>;
  stop(): void;
}

// ---------- Voice settings ----------

export interface VoiceSettings {
  voiceId: string;
  stability: number;
  similarityBoost: number;
}

const DEFAULT_VOICE_ID = 'qOA2jMCVRi5PGB7vdYns'; // Ryan

const DEFAULT_SETTINGS: VoiceSettings = {
  voiceId: DEFAULT_VOICE_ID,
  stability: 0.5,
  similarityBoost: 0.75,
};

// ---------- ElevenLabs provider ----------

function createElevenLabsProvider(settings: VoiceSettings): VoiceoverProvider {
  let audio: HTMLAudioElement | null = null;
  let abortController: AbortController | null = null;

  return {
    async speak(text: string) {
      if (!settings.voiceId) return;
      abortController = new AbortController();
      const resp = await fetch(`/api/elevenlabs/tts/${settings.voiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: settings.stability,
            similarity_boost: settings.similarityBoost,
          },
        }),
        signal: abortController.signal,
      });

      if (!resp.ok) {
        console.error('[ElevenLabs] TTS request failed:', resp.status, await resp.text());
        return;
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      audio = new Audio(url);

      return new Promise<void>((resolve) => {
        audio!.onended = () => { URL.revokeObjectURL(url); audio = null; resolve(); };
        audio!.onerror = () => { URL.revokeObjectURL(url); audio = null; resolve(); };
        audio!.play().catch(() => { URL.revokeObjectURL(url); audio = null; resolve(); });
      });
    },
    stop() {
      abortController?.abort();
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio = null;
      }
    },
  };
}

// ---------- ElevenLabs voice list ----------

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  preview_url: string;
}

// Preferred voices pinned to the top of the list, in order
const PREFERRED_VOICE_IDS = [
  'qOA2jMCVRi5PGB7vdYns', // Ryan (cloned)
  '56bWURjYFHyYyVf490Dp', // Emma
  'UgBBYS2sOqTuMpoF3BR0', // Mark
  'DMyrgzQFny3JI1Y1paM5', // Donovan
  'WyFXw4PzMbRnp8iLMJwY', // Juliet
  '5GZaeOOG7yqLdoTRsaa6', // Happy Australian Woman
];

const PREFERRED_SET = new Set(PREFERRED_VOICE_IDS);

export async function fetchElevenLabsVoices(): Promise<ElevenLabsVoice[]> {
  const resp = await fetch('/api/elevenlabs/voices');
  if (!resp.ok) throw new Error(`Failed to fetch voices: ${resp.status}`);
  const data = await resp.json();
  const voices: ElevenLabsVoice[] = data.voices ?? [];
  // Pin preferred voices to the top in the specified order, then the rest
  const preferred = PREFERRED_VOICE_IDS
    .map(id => voices.find(v => v.voice_id === id))
    .filter((v): v is ElevenLabsVoice => v != null);
  const rest = voices.filter(v => !PREFERRED_SET.has(v.voice_id));
  return [...preferred, ...rest];
}

// ---------- Main hook ----------

function getSlideScript(index: number): string {
  const entry = NARRATIVE[index];
  if (!entry) return '';
  const sayTexts = entry.sections
    .filter(s => s.kind === 'say')
    .map(s => s.text);
  return sayTexts.length > 0 ? sayTexts.join('\n\n') : '';
}

export function useVoiceover() {
  const [enabled, setEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    try {
      const stored = localStorage.getItem('voiceover-settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.voiceId) return parsed;
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const providerRef = useRef<VoiceoverProvider>(createElevenLabsProvider(settings));
  const abortRef = useRef(false);
  const onDoneRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    providerRef.current = createElevenLabsProvider(settings);
    try { localStorage.setItem('voiceover-settings', JSON.stringify(settings)); } catch {}
  }, [settings]);

  const stop = useCallback(() => {
    abortRef.current = true;
    providerRef.current.stop();
    setSpeaking(false);
  }, []);

  const speakSlide = useCallback((index: number, onDone?: () => void) => {
    abortRef.current = false;
    onDoneRef.current = onDone ?? null;
    const text = getSlideScript(index);

    if (!text) {
      setSpeaking(false);
      onDone?.();
      return;
    }

    setSpeaking(true);
    providerRef.current.speak(text).then(() => {
      if (!abortRef.current) {
        setSpeaking(false);
        onDoneRef.current?.();
      }
    });
  }, []);

  const toggle = useCallback(() => {
    setEnabled(prev => {
      if (prev) stop();
      return !prev;
    });
  }, [stop]);

  const preview = useCallback((voiceId: string) => {
    const provider = createElevenLabsProvider({ ...settings, voiceId });
    provider.speak('System of Context. One platform, one source of truth.');
  }, [settings]);

  useEffect(() => {
    return () => { providerRef.current.stop(); };
  }, []);

  return { enabled, setEnabled, speaking, speakSlide, stop, toggle, settings, setSettings, preview };
}
