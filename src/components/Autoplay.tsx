import VoicePicker from './VoicePicker';
import type { BrowserVoiceSettings } from '../hooks/useVoiceover';

const SPEEDS = [1, 2, 3, 5, 10, 15, 30];

export default function Autoplay({
  playing,
  interval,
  voiceoverEnabled,
  voiceoverSpeaking,
  voiceSettings,
  onToggle,
  onIntervalChange,
  onVoiceoverToggle,
  onVoiceSettingsChange,
  onVoicePreview,
}: {
  playing: boolean;
  interval: number;
  voiceoverEnabled: boolean;
  voiceoverSpeaking: boolean;
  voiceSettings: BrowserVoiceSettings;
  onToggle: () => void;
  onIntervalChange: (s: number) => void;
  onVoiceoverToggle: () => void;
  onVoiceSettingsChange: (s: BrowserVoiceSettings) => void;
  onVoicePreview: (voiceURI: string) => void;
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
      <button onClick={onToggle} title={playing ? 'Pause' : 'Play'} style={btnStyle}>
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

      {/* Voiceover toggle */}
      <button
        onClick={onVoiceoverToggle}
        title={voiceoverEnabled ? 'Disable voiceover (V)' : 'Enable voiceover (V)'}
        style={{
          ...btnStyle,
          padding: '0 10px',
          gap: 5,
          fontSize: 11,
          color: voiceoverEnabled ? '#FE9339' : 'rgba(255,255,255,0.45)',
          background: voiceoverEnabled ? 'rgba(254,147,57,0.15)' : 'transparent',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2L4 5.5H1.5v5H4L8 14V2z" fill={voiceoverEnabled ? 'currentColor' : 'none'} />
          {voiceoverEnabled && (
            <>
              <path d="M11 5.5a3.5 3.5 0 010 5" />
              <path d="M13 3.5a6.5 6.5 0 010 9" />
            </>
          )}
          {!voiceoverEnabled && (
            <path d="M11 5.5l4 5M15 5.5l-4 5" />
          )}
        </svg>
        <span>{voiceoverEnabled ? (voiceoverSpeaking ? 'Speaking…' : 'Voice ON') : 'Voice'}</span>
      </button>

      {/* Voice picker — always available */}
      <VoicePicker
        settings={voiceSettings}
        onSettingsChange={onVoiceSettingsChange}
        onPreview={onVoicePreview}
      />

      <Divider />

      {/* Speed selector — only visible when voiceover is OFF */}
      {!voiceoverEnabled && SPEEDS.map((s) => (
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

      {voiceoverEnabled && (
        <span style={{
          padding: '0 10px',
          fontSize: 10,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          Auto-paced by speech
        </span>
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
