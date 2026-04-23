import { useCallback, useEffect, useRef, useState } from 'react';
import { NARRATIVE, type HighlightRegion, type SaySegment } from '../data/narrative-data';

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

      // Cancel any in-flight request or playing audio from this provider
      abortController?.abort();
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio = null;
      }

      abortController = new AbortController();

      let resp: Response;
      try {
        resp = await fetch(`/api/elevenlabs/tts/${settings.voiceId}`, {
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
      } catch (e: any) {
        if (e.name === 'AbortError') return;
        throw e;
      }

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
      abortController = null;
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
  const preferred = PREFERRED_VOICE_IDS
    .map(id => voices.find(v => v.voice_id === id))
    .filter((v): v is ElevenLabsVoice => v != null);
  const rest = voices.filter(v => !PREFERRED_SET.has(v.voice_id));
  return [...preferred, ...rest];
}

// ---------- Main hook ----------

interface SlideScript {
  // If segments are present, speak them one by one with highlight callbacks.
  // Otherwise, speak the full text as a single block.
  segments?: SaySegment[];
  fullText: string;
}

function getSlideScript(index: number): SlideScript | null {
  const entry = NARRATIVE[index];
  if (!entry) return null;
  const saySections = entry.sections.filter(s => s.kind === 'say');
  if (saySections.length === 0) return null;

  // If any say section has segments, use those
  for (const s of saySections) {
    if (s.segments && s.segments.length > 0) {
      return { segments: s.segments, fullText: s.text };
    }
  }

  const fullText = saySections.map(s => s.text).join('\n\n');
  return { fullText };
}

export function useVoiceover() {
  const [speaking, setSpeaking] = useState(false);
  const [highlight, setHighlight] = useState<HighlightRegion | null>(null);
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
    providerRef.current.stop();
    providerRef.current = createElevenLabsProvider(settings);
    setSpeaking(false);
    setHighlight(null);
    try { localStorage.setItem('voiceover-settings', JSON.stringify(settings)); } catch {}
  }, [settings]);

  const stop = useCallback(() => {
    abortRef.current = true;
    providerRef.current.stop();
    setSpeaking(false);
    setHighlight(null);
  }, []);

  const speakSlide = useCallback((index: number, onDone?: () => void) => {
    providerRef.current.stop();
    abortRef.current = false;
    onDoneRef.current = onDone ?? null;
    setHighlight(null);
    const script = getSlideScript(index);

    if (!script) {
      setSpeaking(false);
      onDone?.();
      return;
    }

    setSpeaking(true);

    if (script.segments && script.segments.length > 0) {
      // Speak segments sequentially with highlights
      (async () => {
        for (const seg of script.segments!) {
          if (abortRef.current) return;
          setHighlight(seg.highlight ?? null);
          await providerRef.current.speak(seg.text);
          if (abortRef.current) return;
        }
        setHighlight(null);
        if (!abortRef.current) {
          setSpeaking(false);
          onDoneRef.current?.();
        }
      })();
    } else {
      // Single block speech
      providerRef.current.speak(script.fullText).then(() => {
        if (!abortRef.current) {
          setSpeaking(false);
          onDoneRef.current?.();
        }
      });
    }
  }, []);

  const preview = useCallback((voiceId: string) => {
    providerRef.current.stop();
    setSpeaking(false);
    setHighlight(null);
    const provider = createElevenLabsProvider({ ...settings, voiceId });
    provider.speak('System of Context. One platform, one source of truth.');
  }, [settings]);

  useEffect(() => {
    return () => { providerRef.current.stop(); };
  }, []);

  return { speaking, highlight, speakSlide, stop, settings, setSettings, preview };
}
