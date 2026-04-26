import { useEffect, useRef, useState } from 'react';
import { MODELS, type ModelOption } from '../data/models';

const ORANGE = '#FF6B35';
const BG = '#1a1a1a';
const BORDER = 'rgba(255,255,255,0.1)';
const MUTED = 'rgba(255,255,255,0.35)';

// Group models by their group label, preserving insertion order
function groupModels() {
  const groups: { label: string; models: ModelOption[] }[] = [];
  const seen = new Map<string, number>();
  for (const m of MODELS) {
    if (!seen.has(m.group)) {
      seen.set(m.group, groups.length);
      groups.push({ label: m.group, models: [] });
    }
    groups[seen.get(m.group)!].models.push(m);
  }
  return groups;
}

const GROUPS = groupModels();

export default function ModelSelector({
  modelId,
  onChange,
}: {
  modelId: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = MODELS.find(m => m.id === modelId) ?? MODELS[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Stop keyboard events from bubbling to deck navigation
  const onKeyDown = (e: React.KeyboardEvent) => e.stopPropagation();

  const providerDot = (m: ModelOption) => {
    const color = m.provider === 'claude' ? ORANGE : 'rgba(255,255,255,0.25)';
    return (
      <span style={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
        marginTop: 1,
      }} />
    );
  };

  return (
    <div ref={ref} style={{ position: 'relative' }} onKeyDown={onKeyDown}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Select model"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: open ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(255,255,255,0.18)' : BORDER}`,
          borderRadius: 8,
          color: '#fff',
          cursor: 'pointer',
          padding: '5px 10px 5px 8px',
          fontSize: 12,
          fontFamily: 'inherit',
          fontWeight: 500,
          transition: 'background 140ms ease',
          whiteSpace: 'nowrap',
        }}
      >
        {providerDot(selected)}
        <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selected.label}
        </span>
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" style={{ opacity: 0.4, flexShrink: 0 }}>
          <path d={open ? 'M1 5l3-3 3 3' : 'M1 3l3 3 3-3'} />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 6,
          width: 240,
          maxHeight: 400,
          background: BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 10,
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
        }}>
          <div style={{
            padding: '8px 12px',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            color: MUTED,
            borderBottom: `1px solid rgba(255,255,255,0.06)`,
            flexShrink: 0,
          }}>
            Select Model
          </div>
          <div style={{
            overflowY: 'auto',
            padding: '4px 0',
            scrollbarWidth: 'thin' as const,
            scrollbarColor: 'rgba(255,255,255,0.1) transparent',
          }}>
            {GROUPS.map(group => (
              <div key={group.label}>
                <div style={{
                  padding: '6px 12px 3px',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  color: 'rgba(255,255,255,0.2)',
                }}>
                  {group.label}
                </div>
                {group.models.map(m => {
                  const active = m.id === modelId;
                  return (
                    <button
                      key={m.id}
                      onClick={() => { onChange(m.id); setOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '7px 12px',
                        background: active ? 'rgba(255,107,53,0.1)' : 'transparent',
                        border: 0,
                        color: active ? ORANGE : 'rgba(255,255,255,0.7)',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontFamily: 'inherit',
                        textAlign: 'left' as const,
                        transition: 'background 100ms ease',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {providerDot(m)}
                      <span style={{ flex: 1 }}>{m.label}</span>
                      {active && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill={ORANGE}>
                          <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{
            padding: '7px 12px',
            borderTop: `1px solid rgba(255,255,255,0.06)`,
            fontSize: 10,
            color: 'rgba(255,255,255,0.2)',
            flexShrink: 0,
            display: 'flex',
            gap: 10,
          }}>
            <span><span style={{ color: ORANGE }}>●</span> Claude direct</span>
            <span><span style={{ color: 'rgba(255,255,255,0.3)' }}>●</span> Salesforce Models API</span>
          </div>
        </div>
      )}
    </div>
  );
}
