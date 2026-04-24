import { useCallback, useEffect, useRef, useState } from 'react';
import '../deck-stage.js';
import { SLIDE_LABELS, DARK_SLIDES, TOTAL_SLIDES } from '../data/slides';
import { SPEAKER_NOTES } from '../data/slides';
import Narrative from './Narrative';
import Autoplay from './Autoplay';
import { useVoiceover } from '../hooks/useVoiceover';
import SlideHighlight from './SlideHighlight';
import SlideLinks from './SlideLinks';
import {
  useDataCloudInit,
  trackSlideView,
  trackPlay,
  trackPause,
  trackMute,
  trackUnmute,
  trackSlideJump,
  trackPresentationComplete,
} from '../hooks/useDataCloud';

export default function DeckStage() {
  useDataCloudInit();
  const deckRef = useRef<HTMLElement>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [interval, setInterval_] = useState(3);
  const voiceover = useVoiceover();
  const playingRef = useRef(false);
  playingRef.current = playing;
  const mutedRef = useRef(false);
  mutedRef.current = muted;

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSlideIndex(detail.index);
      trackSlideView(detail.index);
      if (detail.index === detail.total - 1) {
        trackPresentationComplete(detail.total);
      }
    };
    deck.addEventListener('slidechange', handler);
    return () => deck.removeEventListener('slidechange', handler);
  }, []);

  const advanceSlide = useCallback(() => {
    const deck = deckRef.current as any;
    if (!deck) return;
    if (deck.index >= deck.length - 1) {
      setPlaying(false);
      voiceover.stop();
      return;
    }
    deck.next();
  }, [voiceover.stop]);

  // Speak when slide changes while playing and unmuted
  useEffect(() => {
    if (!playing || muted) {
      voiceover.stop();
      return;
    }
    voiceover.speakSlide(slideIndex, () => {
      if (playingRef.current && !mutedRef.current) advanceSlide();
    });
  }, [slideIndex, playing, muted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer-based advancement when playing + muted
  useEffect(() => {
    if (!playing || !muted) return;
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
  }, [playing, muted, interval]);

  // Stop on manual navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t?.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setMuted(m => !m);
        return;
      }
      if (['ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', ' ', 'Home', 'End'].includes(e.key) || /^[0-9r]$/i.test(e.key)) {
        setPlaying(false);
        voiceover.stop();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [voiceover.stop]);

  const togglePlay = useCallback(() => {
    setPlaying(p => {
      if (!p) {
        trackPlay(deckRef.current ? (deckRef.current as any).index : 0);
        const deck = deckRef.current as any;
        if (deck && deck.index >= deck.length - 1) {
          deck.goTo(0);
        }
      } else {
        trackPause(deckRef.current ? (deckRef.current as any).index : 0);
        voiceover.stop();
      }
      return !p;
    });
  }, [voiceover.stop]);

  const toggleMute = useCallback(() => {
    setMuted(m => {
      if (!m) {
        trackMute();
        voiceover.stop();
      } else {
        trackUnmute();
      }
      return !m;
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
        {i === slideIndex && <SlideHighlight region={voiceover.highlight} />}
        {i === slideIndex && <SlideLinks slideIndex={slideIndex} />}
        <div className="slide-chrome">
          <span>{label}</span>
          <span>{num} / {TOTAL_SLIDES}</span>
        </div>
      </section>
    );
  });

  return (
    <>
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
        muted={muted}
        interval={interval}
        speaking={voiceover.speaking}
        voiceSettings={voiceover.settings}
        slideIndex={slideIndex}
        totalSlides={TOTAL_SLIDES}
        slideLabels={SLIDE_LABELS}
        onTogglePlay={togglePlay}
        onToggleMute={toggleMute}
        onIntervalChange={setInterval_}
        onVoiceSettingsChange={voiceover.setSettings}
        onVoicePreview={voiceover.preview}
        onGoToSlide={(i) => {
          trackSlideJump(slideIndex, i);
          setPlaying(false);
          voiceover.stop();
          const deck = deckRef.current as any;
          if (deck) deck.goTo(i);
        }}
      />
    </>
  );
}
