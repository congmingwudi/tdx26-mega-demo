import type { HighlightRegion } from '../data/narrative-data';

export default function SlideHighlight({ region }: { region: HighlightRegion | null }) {
  if (!region) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: `${region.top}%`,
        left: `${region.left}%`,
        width: `${region.width}%`,
        height: `${region.height}%`,
        border: '5px solid rgba(37, 99, 235, 0.85)',
        borderRadius: 14,
        background: 'rgba(37, 99, 235, 0.08)',
        boxShadow: '0 0 40px rgba(37, 99, 235, 0.3), inset 0 0 20px rgba(37, 99, 235, 0.04)',
        pointerEvents: 'none',
        zIndex: 1,
        transition: 'all 400ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    />
  );
}
