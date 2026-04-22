import { useCallback, useEffect, useRef, useState } from 'react';
import '../deck-stage.js';
import { SLIDE_LABELS, DARK_SLIDES, TOTAL_SLIDES } from '../data/slides';
import { SPEAKER_NOTES } from '../data/slides';
import Narrative from './Narrative';
import Autoplay from './Autoplay';
import { useVoiceover } from '../hooks/useVoiceover';

export default function DeckStage() {
  const deckRef = useRef<HTMLElement>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [interval, setInterval_] = useState(3);
  const voiceover = useVoiceover();
  const playingRef = useRef(false);
  playingRef.current = playing;

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSlideIndex(detail.index);
    };
    deck.addEventListener('slidechange', handler);
    return () => deck.removeEventListener('slidechange', handler);
  }, []);

  // Speak narrative when slide changes and voiceover is enabled.
  // Also re-triggers when playing starts so speech-driven advancement kicks in.
  useEffect(() => {
    if (!voiceover.enabled) return;
    voiceover.speakSlide(slideIndex, () => {
      if (!playingRef.current) return;
      const deck = deckRef.current as any;
      if (!deck) return;
      if (deck.index >= deck.length - 1) {
        setPlaying(false);
        return;
      }
      deck.next();
    });
  }, [slideIndex, voiceover.enabled, playing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance slides on a timer (only when voiceover is OFF)
  useEffect(() => {
    if (!playing || voiceover.enabled) return;
    const deck = deckRef.current as any;
    if (!deck) return;

    const id = window.setInterval(() => {
      if (deck.index >= deck.length - 1) {
        setPlaying(false);
        return;
      }
      deck.next();
    }, interval * 1000);

    return () => window.clearInterval(id);
  }, [playing, interval, voiceover.enabled]);

  // Stop autoplay + voiceover on manual navigation; V toggles voiceover
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t?.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        voiceover.toggle();
        return;
      }
      if (['ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', ' ', 'Home', 'End'].includes(e.key) || /^[0-9r]$/i.test(e.key)) {
        setPlaying(false);
        voiceover.stop();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [voiceover.stop, voiceover.toggle]);

  const togglePlay = useCallback(() => {
    setPlaying(p => {
      if (!p) {
        const deck = deckRef.current as any;
        if (deck && deck.index >= deck.length - 1) {
          deck.goTo(0);
        }
      } else {
        voiceover.stop();
      }
      return !p;
    });
  }, [voiceover.stop]);

  const slides = Array.from({ length: TOTAL_SLIDES }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    const label = SLIDE_LABELS[i];
    const isDark = DARK_SLIDES.has(i + 1);

    return (
      <section
        key={i}
        className={`slide-img${isDark ? ' dark' : ''}`}
        style={{ backgroundImage: `url("/rendered/page-${num}.jpg")` }}
        data-screen-label={`${num} ${label}`}
      >
        <div className="slide-chrome">
          <span>{label}</span>
          <span>{num} / {TOTAL_SLIDES}</span>
        </div>
      </section>
    );
  });

  return (
    <>
      {/* Speaker notes JSON for deck-stage to read */}
      <script
        type="application/json"
        id="speaker-notes"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SPEAKER_NOTES) }}
      />

      <deck-stage ref={deckRef} width="1920" height="1080">
        {slides}
      </deck-stage>

      <Narrative slideIndex={slideIndex} />
      <Autoplay
        playing={playing}
        interval={interval}
        voiceoverEnabled={voiceover.enabled}
        voiceoverSpeaking={voiceover.speaking}
        voiceSettings={voiceover.settings}
        onToggle={togglePlay}
        onIntervalChange={setInterval_}
        onVoiceoverToggle={voiceover.toggle}
        onVoiceSettingsChange={voiceover.setSettings}
        onVoicePreview={voiceover.preview}
      />
    </>
  );
}
