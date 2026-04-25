import { useCallback, useEffect, useRef, useState } from 'react';
import { NARRATIVE, type HighlightRegion, type SaySegment } from '../data/narrative-data';
import { logError } from './useLogger';

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

// ---------- Audio unlock ----------
// Browsers block audio playback until a user gesture has triggered at least
// one audio play. We unlock by playing a silent audio on the first click.
let audioUnlocked = false;
const audioContext = typeof AudioContext !== 'undefined' ? new AudioContext() : null;
// Shared audio element created during the user gesture. iOS Safari unlocks a
// specific HTMLAudioElement when play() is called from a gesture; reusing this
// same element for all TTS keeps it permanently unlocked across slides.
let sharedAudio: HTMLAudioElement | null = null;

export function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  // Resume AudioContext (Chrome requires this from a user gesture)
  if (audioContext?.state === 'suspended') {
    audioContext.resume();
  }
  // Create and retain the audio element during the gesture so iOS keeps it unlocked.
  sharedAudio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
  sharedAudio.play().catch(() => {});
}

// ---------- ElevenLabs provider ----------

function createElevenLabsProvider(
  settings: VoiceSettings,
  onBlocked: () => void,
): VoiceoverProvider {
  let abortController: AbortController | null = null;
  // Track whether stop() was called so the play promise knows to bail out
  let stopped = false;

  function getAudio(): HTMLAudioElement {
    // Reuse the element unlocked during the gesture; fall back to a new one
    // if unlockAudio was never called (e.g. desktop where gesture isn't required).
    if (sharedAudio) return sharedAudio;
    sharedAudio = new Audio();
    return sharedAudio;
  }

  return {
    async speak(text: string) {
      if (!settings.voiceId) return;

      // Cancel any in-flight request or playing audio from this provider
      abortController?.abort();
      stopped = false;
      const audio = getAudio();
      audio.pause();
      audio.removeAttribute('src');

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
        const msg = `ElevenLabs TTS fetch failed: ${e?.message ?? e}`;
        console.error('[ElevenLabs]', msg);
        logError(msg);
        onBlocked();
        await new Promise(() => {}); // never resolves — caller must abort
        return;
      }

      if (!resp.ok) {
        const detail = `HTTP ${resp.status}`;
        const msg = `ElevenLabs TTS request failed: ${detail}`;
        console.error('[ElevenLabs]', msg);
        logError(msg, detail);
        onBlocked();
        await new Promise(() => {}); // never resolves — caller must abort
        return;
      }

      if (stopped) return;

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);

      return new Promise<void>((resolve) => {
        audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          const msg = 'ElevenLabs audio playback error';
          console.error('[ElevenLabs]', msg);
          logError(msg);
          onBlocked();
          // Do not resolve — prevents rapid-fire advancement on mobile
        };
        audio.src = url;
        audio.currentTime = 0;
        audio.play().catch((err) => {
          URL.revokeObjectURL(url);
          const msg = `ElevenLabs audio.play() failed: ${err?.message ?? err}`;
          console.error('[ElevenLabs]', msg);
          logError(msg);
          onBlocked();
          // Do not resolve — prevents rapid-fire advancement on mobile
        });
      });
    },
    stop() {
      stopped = true;
      abortController?.abort();
      abortController = null;
      if (sharedAudio) {
        sharedAudio.pause();
        sharedAudio.onended = null;
        sharedAudio.onerror = null;
        sharedAudio.removeAttribute('src');
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
  segments?: SaySegment[];
  fullText: string;
}

function getSlideScript(index: number): SlideScript | null {
  const entry = NARRATIVE[index];
  if (!entry) return null;
  const saySections = entry.sections.filter(s => s.kind === 'say');
  if (saySections.length === 0) return null;

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
  const [voiceoverBlocked, setVoiceoverBlocked] = useState(false);
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

  const onBlocked = useCallback(() => setVoiceoverBlocked(true), []);
  const providerRef = useRef<VoiceoverProvider>(createElevenLabsProvider(settings, onBlocked));
  const abortRef = useRef(false);
  const onDoneRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    providerRef.current.stop();
    providerRef.current = createElevenLabsProvider(settings, onBlocked);
    setSpeaking(false);
    setHighlight(null);
    try { localStorage.setItem('voiceover-settings', JSON.stringify(settings)); } catch {}
  }, [settings, onBlocked]);

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
    const provider = createElevenLabsProvider({ ...settings, voiceId }, onBlocked);
    provider.speak('System of Context. One platform, one source of truth.');
  }, [settings, onBlocked]);

  useEffect(() => {
    return () => { providerRef.current.stop(); };
  }, []);

  return { speaking, voiceoverBlocked, highlight, speakSlide, stop, settings, setSettings, preview };
}
