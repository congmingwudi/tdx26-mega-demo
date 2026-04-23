// Clickable link overlays for specific slides.
// Coordinates are percentages of the 1920x1080 design canvas.

interface SlideLink {
  href: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

const SLIDE_LINKS: Record<number, SlideLink[]> = {
  // Slide 42 (index 41) — Resources
  41: [
    // bit.ly/tdx26-mega-demo
    { href: 'https://bit.ly/tdx26-mega-demo', top: 20, left: 2, width: 25, height: 7 },
    // github.com/congmingwudi/tdx26-mega-demo
    { href: 'https://github.com/congmingwudi/tdx26-mega-demo', top: 31, left: 48, width: 50, height: 7 },
    // github.com/congmingwudi/patient360-glucose-monitor
    { href: 'https://github.com/congmingwudi/patient360-glucose-monitor', top: 48, left: 48, width: 50, height: 7 },
    // linkedin.com/in/tadryancox
    { href: 'https://linkedin.com/in/tadryancox', top: 81, left: 48, width: 40, height: 7 },
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
          onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; }}
        />
      ))}
    </>
  );
}
