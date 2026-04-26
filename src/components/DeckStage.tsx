import { useCallback, useEffect, useRef, useState } from 'react';
import '../deck-stage.js';
import { SLIDE_LABELS, DARK_SLIDES, TOTAL_SLIDES } from '../data/slides';
import { SPEAKER_NOTES } from '../data/slides';
import Narrative from './Narrative';
import Autoplay from './Autoplay';
import { useVoiceover, unlockAudio } from '../hooks/useVoiceover';
import SlideHighlight from './SlideHighlight';
import SlideLinks from './SlideLinks';
import AskClaude from './AskClaude';
import KioskMode from './KioskMode';
import ArchSlide from './ArchSlide';
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
import { logPlay, logAskClaude, logKiosk } from '../hooks/useLogger';

export default function DeckStage() {
  useDataCloudInit();
  const deckRef = useRef<HTMLElement>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [interval, setInterval_] = useState(3);
  const [askClaudeOpen, setAskClaudeOpen] = useState(false);
  const [kioskOpen, setKioskOpen] = useState(false);
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
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setAskClaudeOpen(o => { if (!o) logAskClaude(slideIndex); return !o; });
        return;
      }
      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setKioskOpen(o => { if (!o) logKiosk(slideIndex); return !o; });
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
    unlockAudio(); // Must run synchronously in the click handler
    setPlaying(p => {
      if (!p) {
        const idx = deckRef.current ? (deckRef.current as any).index : 0;
        trackPlay(idx);
        logPlay(idx);
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
    unlockAudio();
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

  // Slide 42 (index 41) is a custom React-rendered slide — no background image.
  // Slide 43 (index 42) reuses page-42.jpg since the arch slide has no image file.
  const ARCH_SLIDE_INDEX = 41;

  // Custom image overrides: key = 0-based index, value = filename in /rendered/
  const CUSTOM_IMAGES: Record<number, string> = {
    6:  'trapped-data.png',
    9:  'arch-realtime-events.png',
    11: 'arch-tableau.png',
    12: 'arch-marketing.png',
    23: 'slackbot.png',
    24: 'update-patient-record.png',
    40: 'this-presentation-app.png',
  };

  const slides = Array.from({ length: TOTAL_SLIDES }, (_, i) => {
    const imgNum = i > ARCH_SLIDE_INDEX ? i : i + 1; // shift image numbers after arch slide
    const num = String(i).padStart(2, '0');
    const imgNumStr = String(imgNum).padStart(2, '0');
    const imgSrc = CUSTOM_IMAGES[i] ?? `page-${imgNumStr}.jpg`;
    const label = SLIDE_LABELS[i];
    const isDark = DARK_SLIDES.has(i + 1);

    if (i === ARCH_SLIDE_INDEX) {
      return (
        <section
          key={i}
          className="slide-img dark"
          data-screen-label={`${num} ${label}`}
        >
          <ArchSlide />
          {i === slideIndex && <SlideLinks slideIndex={slideIndex} />}
          <div className="slide-chrome">
            <span>{label}</span>
            <span>{num} / {TOTAL_SLIDES - 1}</span>
          </div>
        </section>
      );
    }

    return (
      <section
        key={i}
        className={`slide-img${isDark ? ' dark' : ''}`}
        style={{ backgroundImage: `url("/rendered/${imgSrc}")` }}
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
        voiceoverBlocked={voiceover.voiceoverBlocked}
        voiceSettings={voiceover.settings}
        slideIndex={slideIndex}
        totalSlides={TOTAL_SLIDES}
        slideLabels={SLIDE_LABELS}
        askClaudeOpen={askClaudeOpen}
        onTogglePlay={togglePlay}
        onToggleMute={toggleMute}
        onIntervalChange={setInterval_}
        onVoiceSettingsChange={voiceover.setSettings}
        onVoicePreview={voiceover.preview}
        onAskClaude={() => setAskClaudeOpen(o => {
          if (!o) logAskClaude(slideIndex);
          return !o;
        })}
        onKioskMode={() => { logKiosk(slideIndex); setKioskOpen(true); }}
        onGoToSlide={(i) => {
          trackSlideJump(slideIndex, i);
          setPlaying(false);
          voiceover.stop();
          const deck = deckRef.current as any;
          if (deck) deck.goTo(i);
        }}
      />

      {askClaudeOpen && (
        <AskClaude slideIndex={slideIndex} onClose={() => setAskClaudeOpen(false)} />
      )}

      {kioskOpen && (
        <KioskMode
          onClose={() => setKioskOpen(false)}
          onGoToSlide={(i) => {
            const deck = deckRef.current as any;
            if (deck) deck.goTo(i);
          }}
        />
      )}
    </>
  );
}
