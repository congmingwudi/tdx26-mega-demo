import { useCallback, useEffect, useRef, useState } from 'react';
import { NARRATIVE } from '../data/narrative-data';

// ---------- Provider interface ----------
// Swap this to switch from browser TTS to ElevenLabs / OpenAI later.

export interface VoiceoverProvider {
  speak(text: string): Promise<void>;
  stop(): void;
}

// ---------- Browser Speech API provider ----------

export interface BrowserVoiceSettings {
  voiceURI: string | null; // null = auto-pick
  rate: number;
  pitch: number;
}

const DEFAULT_SETTINGS: BrowserVoiceSettings = {
  voiceURI: null,
  rate: 1.0,
  pitch: 1.0,
};

function findVoice(uri: string | null): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  if (uri) {
    const match = voices.find(v => v.voiceURI === uri);
    if (match) return match;
  }
  // Auto-pick: prefer a natural-sounding English voice
  const preferred = [
    'Samantha', 'Karen', 'Moira', 'Fiona',        // macOS female voices (smooth)
    'Daniel', 'Alex',                                // macOS male voices
    'Google UK English Female', 'Google UK English Male',
    'Google US English',
    'Microsoft Zira', 'Microsoft Hazel',             // Windows female
    'Microsoft David', 'Microsoft Mark',             // Windows male
  ];
  for (const name of preferred) {
    const v = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'));
    if (v) return v;
  }
  return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
}

// Unlock the speech engine on the very first user gesture.
// Some browsers (Chrome, Safari) block speechSynthesis.speak() until
// a user-initiated utterance has been made.
let unlocked = false;
function ensureUnlocked() {
  if (unlocked) return;
  const utt = new SpeechSynthesisUtterance('');
  utt.volume = 0;
  speechSynthesis.speak(utt);
  unlocked = true;
}

export function createBrowserProvider(settings: BrowserVoiceSettings = DEFAULT_SETTINGS): VoiceoverProvider {
  return {
    speak(text: string) {
      return new Promise<void>((resolve) => {
        speechSynthesis.cancel();
        // Small delay after cancel — Chrome sometimes drops the next
        // utterance if it's queued in the same microtask as cancel().
        setTimeout(() => {
          const utt = new SpeechSynthesisUtterance(text);
          const voice = findVoice(settings.voiceURI);
          if (voice) utt.voice = voice;
          utt.rate = settings.rate;
          utt.pitch = settings.pitch;
          utt.volume = 1;
          utt.onend = () => resolve();
          utt.onerror = () => resolve();
          speechSynthesis.speak(utt);
        }, 50);
      });
    },
    stop() {
      speechSynthesis.cancel();
    },
  };
}

// ---------- Voice list hook ----------

export function useAvailableVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    function load() {
      const all = speechSynthesis.getVoices();
      // Only show English voices, sorted: local first, then alphabetical
      const en = all
        .filter(v => v.lang.startsWith('en'))
        .sort((a, b) => {
          if (a.localService !== b.localService) return a.localService ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      setVoices(en);
    }
    load();
    speechSynthesis.addEventListener('voiceschanged', load);
    return () => speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  return voices;
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
  const [settings, setSettings] = useState<BrowserVoiceSettings>(() => {
    try {
      const stored = localStorage.getItem('voiceover-settings');
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const providerRef = useRef<VoiceoverProvider>(createBrowserProvider(settings));
  const abortRef = useRef(false);
  const onDoneRef = useRef<(() => void) | null>(null);

  // Rebuild provider when settings change
  useEffect(() => {
    providerRef.current = createBrowserProvider(settings);
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
    ensureUnlocked();
    setEnabled(prev => {
      if (prev) stop();
      return !prev;
    });
  }, [stop]);

  // Preview: speak a short sample when voice changes
  const preview = useCallback((voiceURI: string) => {
    ensureUnlocked();
    const provider = createBrowserProvider({ ...settings, voiceURI });
    provider.speak('System of Context. One platform, one source of truth.');
  }, [settings]);

  useEffect(() => {
    return () => { providerRef.current.stop(); };
  }, []);

  return { enabled, setEnabled, speaking, speakSlide, stop, toggle, settings, setSettings, preview };
}
