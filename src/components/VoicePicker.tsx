import { useState, useRef, useEffect } from 'react';
import {
  fetchElevenLabsVoices,
  type VoiceSettings,
  type ElevenLabsVoice,
} from '../hooks/useVoiceover';

export default function VoicePicker({
  settings,
  onSettingsChange,
  onPreview,
}: {
  settings: VoiceSettings;
  onSettingsChange: (s: VoiceSettings) => void;
  onPreview: (voiceId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Load voices when dropdown opens
  useEffect(() => {
    if (!open || voices.length > 0) return;
    setLoading(true);
    setError('');
    fetchElevenLabsVoices()
      .then(v => { setVoices(v); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [open, voices.length]);

  const selectedVoice = voices.find(v => v.voice_id === settings.voiceId);
  const displayName = selectedVoice?.name ?? (settings.voiceId ? 'ElevenLabs' : 'Select voice');

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Choose voice"
        style={{
          ...btnStyle,
          padding: '0 10px',
          fontSize: 11,
          gap: 4,
          maxWidth: 180,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName}
        </span>
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" style={{ flexShrink: 0, opacity: 0.5 }}>
          <path d="M1 3l3 3 3-3" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          marginBottom: 8,
          width: 360,
          maxHeight: 480,
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
          {/* Header */}
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
            ElevenLabs Voices
          </div>

          {/* Voice list */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: 4, minHeight: 100,
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent',
          }}>
            {loading && (
              <div style={{ padding: '20px 14px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                Loading voices...
              </div>
            )}
            {error && (
              <div style={{ padding: '20px 14px', color: '#f87171', textAlign: 'center', fontSize: 11 }}>
                {error}
              </div>
            )}
            {!loading && !error && voices.map(v => {
              const gender = v.labels?.gender ?? '';
              const lang = v.labels?.language ?? v.labels?.accent ?? '';
              const detail = [gender, lang].filter(Boolean).join(' · ');
              return (
                <VoiceRow
                  key={v.voice_id}
                  name={v.name}
                  detail={detail}
                  selected={settings.voiceId === v.voice_id}
                  onClick={() => {
                    onSettingsChange({ ...settings, voiceId: v.voice_id });
                    onPreview(v.voice_id);
                    setOpen(false);
                  }}
                  onPreviewClick={v.preview_url ? (e) => {
                    e.stopPropagation();
                    new Audio(v.preview_url).play();
                  } : undefined}
                />
              );
            })}
          </div>

          {/* Stability + Clarity sliders */}
          <div style={{
            padding: '10px 14px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            gap: 16,
          }}>
            <SliderControl
              label="Stability"
              value={settings.stability}
              min={0} max={1} step={0.05}
              format={v => v.toFixed(2)}
              onChange={stability => onSettingsChange({ ...settings, stability })}
            />
            <SliderControl
              label="Clarity"
              value={settings.similarityBoost}
              min={0} max={1} step={0.05}
              format={v => v.toFixed(2)}
              onChange={similarityBoost => onSettingsChange({ ...settings, similarityBoost })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function VoiceRow({ name, detail, selected, onClick, onPreviewClick }: {
  name: string; detail: string; selected: boolean; onClick: () => void;
  onPreviewClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '7px 10px',
        background: selected ? 'rgba(254,147,57,0.12)' : 'transparent',
        border: 0,
        borderRadius: 6,
        color: selected ? '#FE9339' : '#ddd',
        cursor: 'pointer',
        fontSize: 12,
        textAlign: 'left',
        fontFamily: 'inherit',
      }}
    >
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      {detail && (
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>
          {detail}
        </span>
      )}
      {onPreviewClick && (
        <span
          onClick={onPreviewClick}
          title="Preview sample"
          style={{
            fontSize: 10, color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
            padding: '2px 4px', borderRadius: 4, flexShrink: 0,
          }}
        >
          &#9654;
        </span>
      )}
    </button>
  );
}

function SliderControl({ label, value, min, max, step, format, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.5)', fontWeight: 600,
      }}>
        <span>{label}</span>
        <span style={{ fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums' }}>
          {format(value)}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#FE9339' }}
      />
    </label>
  );
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
  fontFamily: 'inherit',
  fontWeight: 600,
  letterSpacing: '0.02em',
};
