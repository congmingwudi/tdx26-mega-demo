import { useState, useRef, useEffect } from 'react';
import VoicePicker from './VoicePicker';
import type { VoiceSettings } from '../hooks/useVoiceover';

const SPEEDS = [1, 2, 3, 5, 10, 15, 30];

export default function Autoplay({
  playing,
  muted,
  interval,
  speaking,
  voiceoverBlocked,
  voiceSettings,
  slideIndex,
  totalSlides,
  slideLabels,
  onTogglePlay,
  onToggleMute,
  onIntervalChange,
  onVoiceSettingsChange,
  onVoicePreview,
  onGoToSlide,
}: {
  playing: boolean;
  muted: boolean;
  interval: number;
  speaking: boolean;
  voiceoverBlocked: boolean;
  voiceSettings: VoiceSettings;
  slideIndex: number;
  totalSlides: number;
  slideLabels: string[];
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onIntervalChange: (s: number) => void;
  onVoiceSettingsChange: (s: VoiceSettings) => void;
  onVoicePreview: (voiceId: string) => void;
  onGoToSlide: (index: number) => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 2147483499,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: '#111',
        borderRadius: 999,
        padding: 4,
        boxShadow:
          '0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.02em',
        color: '#fff',
      }}
    >
      {/* Play / Pause */}
      <button onClick={onTogglePlay} title={playing ? 'Pause' : 'Play'} style={btnStyle}>
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <rect x="3" y="2" width="4" height="12" rx="1" />
            <rect x="9" y="2" width="4" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2.5v11a.5.5 0 00.77.42l9-5.5a.5.5 0 000-.84l-9-5.5A.5.5 0 004 2.5z" />
          </svg>
        )}
      </button>

      <Divider />

      {/* Slide jump */}
      <SlideJump
        slideIndex={slideIndex}
        totalSlides={totalSlides}
        slideLabels={slideLabels}
        onGoToSlide={onGoToSlide}
      />

      <Divider />

      {/* Mute / Unmute — disabled when voiceover is blocked */}
      <button
        onClick={voiceoverBlocked ? undefined : onToggleMute}
        title={voiceoverBlocked ? 'Voiceover unavailable — refresh to retry' : (muted ? 'Unmute (M)' : 'Mute (M)')}
        style={{
          ...btnStyle,
          padding: '0 10px',
          gap: 5,
          fontSize: 11,
          color: voiceoverBlocked
            ? 'rgba(255,255,255,0.2)'
            : (muted ? 'rgba(255,255,255,0.35)' : (speaking ? '#FE9339' : 'rgba(255,255,255,0.72)')),
          background: !voiceoverBlocked && !muted && speaking ? 'rgba(254,147,57,0.15)' : 'transparent',
          cursor: voiceoverBlocked ? 'not-allowed' : 'pointer',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2L4 5.5H1.5v5H4L8 14V2z" fill={muted || voiceoverBlocked ? 'none' : 'currentColor'} />
          {!muted && !voiceoverBlocked && (
            <>
              <path d="M11 5.5a3.5 3.5 0 010 5" />
              <path d="M13 3.5a6.5 6.5 0 010 9" />
            </>
          )}
          {(muted || voiceoverBlocked) && (
            <path d="M11 5.5l4 5M15 5.5l-4 5" />
          )}
        </svg>
        <span>{voiceoverBlocked ? 'Unavailable' : (muted ? 'Muted' : (speaking ? 'Speaking…' : 'Voice'))}</span>
      </button>

      {/* Blocked banner */}
      {voiceoverBlocked && (
        <span style={{
          padding: '0 10px',
          fontSize: 10,
          color: 'rgba(255,100,100,0.8)',
          letterSpacing: '0.04em',
        }}>
          Voiceover unavailable · refresh to retry
        </span>
      )}

      {/* Voice picker */}
      <VoicePicker
        settings={voiceSettings}
        onSettingsChange={onVoiceSettingsChange}
        onPreview={onVoicePreview}
      />

      <Divider />

      {/* Speed selector — only visible when muted (timer-based) */}
      {muted && SPEEDS.map((s) => (
        <button
          key={s}
          onClick={() => onIntervalChange(s)}
          title={`${s}s per slide`}
          style={{
            ...btnStyle,
            minWidth: 28,
            fontSize: 11,
            color: s === interval ? '#fff' : 'rgba(255,255,255,0.45)',
            background: s === interval ? 'rgba(255,255,255,0.14)' : 'transparent',
          }}
        >
          {s}s
        </button>
      ))}

      {!muted && (
        <span style={{
          padding: '0 10px',
          fontSize: 10,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          Paced by voice
        </span>
      )}
    </div>
  );
}

function SlideJump({
  slideIndex,
  totalSlides,
  slideLabels,
  onGoToSlide,
}: {
  slideIndex: number;
  totalSlides: number;
  slideLabels: string[];
  onGoToSlide: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // Scroll active slide into view when dropdown opens
  useEffect(() => {
    if (open && activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'center' });
    }
  }, [open]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Jump to slide"
        style={{
          ...btnStyle,
          padding: '0 10px',
          gap: 4,
          fontSize: 11,
          minWidth: 52,
        }}
      >
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {pad(slideIndex + 1)} / {pad(totalSlides)}
        </span>
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" style={{ flexShrink: 0, opacity: 0.5 }}>
          <path d="M1 3l3 3 3-3" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          marginBottom: 8,
          width: 320,
          maxHeight: 420,
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontSize: 12,
          color: '#eee',
        }}>
          <div style={{
            padding: '10px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            flexShrink: 0,
          }}>
            Jump to Slide
          </div>
          <div style={{
            flex: 1, overflowY: 'auto', padding: 4,
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent',
          }}>
            {slideLabels.map((label, i) => {
              const active = i === slideIndex;
              return (
                <button
                  key={i}
                  ref={active ? activeRef : undefined}
                  onClick={() => { onGoToSlide(i); setOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '7px 10px',
                    background: active ? 'rgba(254,147,57,0.12)' : 'transparent',
                    border: 0,
                    borderRadius: 6,
                    color: active ? '#FE9339' : '#ddd',
                    cursor: 'pointer',
                    fontSize: 12,
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: 10,
                    color: active ? '#FE9339' : 'rgba(255,255,255,0.35)',
                    minWidth: 20,
                    flexShrink: 0,
                  }}>
                    {pad(i + 1)}
                  </span>
                  <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Divider() {
  return <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.18)', margin: '0 2px' }} />;
}

const btnStyle: React.CSSProperties = {
  appearance: 'none',
  background: 'transparent',
  border: 0,
  margin: 0,
  padding: 0,
  color: 'rgba(255,255,255,0.72)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 28,
  minWidth: 28,
  borderRadius: 999,
  transition: 'background 140ms ease, color 140ms ease',
};
