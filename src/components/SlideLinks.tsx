// Clickable link overlays for specific slides.
// Coordinates are percentages of the 1920x1080 design canvas.

import { trackLinkClick } from '../hooks/useDataCloud';

interface SlideLink {
  href: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

const SLIDE_LINKS: Record<number, SlideLink[]> = {
  // Slide 43 (index 42) — Resources
  42: [
    // bit.ly/tdx26-mega-demo (top-left link + QR code area)
    { href: 'https://bit.ly/tdx26-mega-demo', top: 10, left: 2, width: 38, height: 75 },
    // github.com/congmingwudi/tdx26-mega-demo
    { href: 'https://github.com/congmingwudi/tdx26-mega-demo', top: 28, left: 42, width: 55, height: 12 },
    // github.com/congmingwudi/patient360-glucose-monitor
    { href: 'https://github.com/congmingwudi/patient360-glucose-monitor', top: 48, left: 42, width: 55, height: 12 },
    // linkedin.com/in/tadryancox
    { href: 'https://linkedin.com/in/tadryancox', top: 72, left: 42, width: 45, height: 12 },
  ],
};

export default function SlideLinks({ slideIndex }: { slideIndex: number }) {
  const links = SLIDE_LINKS[slideIndex];
  if (!links) return null;

  return (
    <>
      {links.map((link, i) => (
        <a
          key={i}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'absolute',
            top: `${link.top}%`,
            left: `${link.left}%`,
            width: `${link.width}%`,
            height: `${link.height}%`,
            zIndex: 3,
            cursor: 'pointer',
            // Invisible but hoverable
            background: 'transparent',
            borderRadius: 4,
            transition: 'background 150ms ease',
          }}
          onClick={() => trackLinkClick(link.href, slideIndex)}
          onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; }}
        />
      ))}
    </>
  );
}
