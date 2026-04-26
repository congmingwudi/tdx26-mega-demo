import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

let initialized = false;
function ensureInit() {
  if (initialized) return;
  initialized = true;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    darkMode: true,
    themeVariables: {
      background: 'transparent',
      primaryColor: '#1a1a1a',
      primaryTextColor: '#e8e8e8',
      primaryBorderColor: 'rgba(255,107,53,0.4)',
      lineColor: 'rgba(255,107,53,0.5)',
      secondaryColor: '#0f0f0f',
      tertiaryColor: '#111',
      edgeLabelBackground: '#0f0f0f',
      clusterBkg: 'rgba(255,107,53,0.06)',
      clusterBorder: 'rgba(255,107,53,0.25)',
      titleColor: '#FF6B35',
      nodeTextColor: '#e8e8e8',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: '13px',
    },
    flowchart: { curve: 'basis', padding: 16 },
  });
}

let idCounter = 0;

export default function MermaidDiagram({ chart, label }: { chart: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mermaid-${++idCounter}`);

  useEffect(() => {
    ensureInit();
    const el = ref.current;
    if (!el) return;

    const id = idRef.current;
    mermaid.render(id, chart).then(({ svg }) => {
      el.innerHTML = svg;
      const svgEl = el.querySelector('svg');
      if (svgEl) {
        // Remove fixed pixel dimensions so the SVG scales to fill the container.
        // Keep viewBox so aspect ratio is preserved.
        svgEl.removeAttribute('width');
        svgEl.removeAttribute('height');
        svgEl.style.width = '100%';
        svgEl.style.height = 'auto';
        svgEl.style.display = 'block';
      }
    }).catch((err) => {
      setError(String(err));
    });
  }, [chart]);

  if (error) return null;

  return (
    <div style={{ marginTop: 8, marginBottom: 4, width: '100%' }}>
      {label && (
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'rgba(255,107,53,0.7)',
          marginBottom: 6,
        }}>
          {label}
        </div>
      )}
      <div
        ref={ref}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,107,53,0.15)',
          borderRadius: 10,
          padding: '16px 12px',
          overflowX: 'auto',
          overflowY: 'hidden',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}
