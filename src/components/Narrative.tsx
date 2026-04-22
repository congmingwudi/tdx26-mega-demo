import { useEffect, useState, useRef } from 'react';
import { NARRATIVE, type NarrativeEntry } from '../data/narrative-data';

export default function Narrative({ slideIndex }: { slideIndex: number }) {
  const [visible, setVisible] = useState(() => {
    try {
      const stored = localStorage.getItem('narrative-visible');
      return stored === null || stored === '1';
    } catch {
      return true;
    }
  });
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { localStorage.setItem('narrative-visible', visible ? '1' : '0'); } catch {}
  }, [visible]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [slideIndex]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t?.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setVisible(v => !v);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const data: NarrativeEntry | undefined = NARRATIVE[slideIndex];

  return (
    <>
      {/* Panel */}
      <div
        id="narrative"
        className={visible ? '' : 'hidden'}
        style={{
          position: 'fixed', top: 24, right: 24, width: 460,
          maxHeight: 'calc(100vh - 48px)',
          background: '#111', color: '#eee', borderRadius: 14,
          boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)',
          zIndex: 2147483500,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          transition: 'transform 260ms cubic-bezier(.2,.8,.2,1), opacity 200ms ease',
          fontSize: 14,
          ...(visible ? {} : {
            transform: 'translateX(calc(100% + 40px))',
            opacity: 0,
            pointerEvents: 'none' as const,
          }),
        }}
      >
        {/* Header */}
        <div style={{
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
          background: '#000', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
        }}>
          <span style={{
            fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: '#FE9339', fontWeight: 700,
          }}>
            {data?.phase || `Slide ${slideIndex + 1}`}
          </span>
          <span style={{
            fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)', marginLeft: 'auto',
          }}>
            {data?.beat || ''}
          </span>
          <button
            onClick={() => setVisible(false)}
            aria-label="Hide narrative"
            title="Hide (N)"
            style={{
              appearance: 'none', background: 'transparent', border: 0,
              color: 'rgba(255,255,255,0.55)', cursor: 'pointer',
              fontSize: 18, padding: '2px 6px', borderRadius: 4, lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {/* Title */}
        <div style={{
          padding: '14px 18px 6px', fontSize: 18, fontWeight: 600,
          letterSpacing: '-0.01em', color: '#fff', lineHeight: 1.25, flexShrink: 0,
        }}>
          {data?.title || 'No notes'}
        </div>

        {/* Time */}
        <div style={{
          padding: '0 18px 12px', fontSize: 12,
          color: 'rgba(255,255,255,0.5)', fontVariantNumeric: 'tabular-nums', flexShrink: 0,
        }}>
          {data?.time || ''}
        </div>

        {/* Body */}
        <div
          ref={bodyRef}
          style={{
            padding: '0 18px 16px', overflowY: 'auto', flex: 1,
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent',
          }}
        >
          {data ? data.sections.map((s, i) => (
            <div
              key={i}
              style={{
                ...(i > 0 ? {
                  marginTop: 14, paddingTop: 14,
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                } : {}),
              }}
            >
              {s.label && (
                <div style={{
                  fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                  fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8,
                }}>
                  {s.label}
                </div>
              )}
              {s.kind === 'persona' ? (
                <span style={{
                  display: 'inline-block', padding: '3px 9px',
                  background: 'rgba(254,147,57,0.15)', color: '#FE9339',
                  borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
                }}>
                  {s.text}
                </span>
              ) : (
                <div style={{
                  ...(s.kind === 'say' ? { fontSize: 15, lineHeight: 1.5, color: '#f0f0f0', whiteSpace: 'pre-wrap' as const } :
                     s.kind === 'do' ? { fontSize: 13, lineHeight: 1.45, color: 'rgba(255,255,255,0.75)' } :
                     { fontSize: 12, lineHeight: 1.45, color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' as const }),
                }}>
                  {s.text}
                </div>
              )}
            </div>
          )) : (
            <div style={{ fontSize: 12, lineHeight: 1.45, color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' }}>
              No narrative available for this slide.
            </div>
          )}
        </div>
      </div>

      {/* Toggle button */}
      {!visible && (
        <button
          onClick={() => setVisible(true)}
          title="Show speaker narrative overlay (N)"
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 2147483499,
            background: '#111', color: '#fff', border: 0, borderRadius: 999,
            padding: '10px 18px',
            fontFamily: '-apple-system, sans-serif',
            fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <span>Narrative</span>
          <span style={{
            background: 'rgba(255,255,255,0.14)', padding: '2px 6px', borderRadius: 3,
            fontFamily: 'ui-monospace, monospace', fontSize: 10,
          }}>
            N
          </span>
        </button>
      )}
    </>
  );
}
