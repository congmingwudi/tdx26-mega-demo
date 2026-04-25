// Custom-rendered slide 42: "App Architecture — How It Was Built"
// Rendered at 1920×1080 inside <deck-stage>. No background image — fully live HTML/CSS.

const ORANGE = '#FF6B35';
const ORANGE_DIM = 'rgba(255,107,53,0.18)';
const ORANGE_BORDER = 'rgba(255,107,53,0.35)';
const MUTED = 'rgba(255,255,255,0.45)';
const DIM = 'rgba(255,255,255,0.18)';
const CARD = 'rgba(255,255,255,0.05)';
const CARD_BORDER = 'rgba(255,255,255,0.1)';

// ── Typography helpers ──────────────────────────────────────────────────────

const label = (text: string, color = MUTED, size = 18) => (
  <span style={{ fontSize: size, fontWeight: 600, color, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
    {text}
  </span>
);

// ── Arrow SVG ───────────────────────────────────────────────────────────────

function Arrow({ vertical = false, label: lbl }: { vertical?: boolean; label?: string }) {
  if (vertical) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        {lbl && <span style={{ fontSize: 14, color: MUTED, fontWeight: 500 }}>{lbl}</span>}
        <svg width="2" height="28" viewBox="0 0 2 28">
          <line x1="1" y1="0" x2="1" y2="22" stroke={DIM} strokeWidth="1.5" />
          <path d="M-3 22 L1 28 L5 22" fill="none" stroke={DIM} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
      {lbl && <span style={{ fontSize: 14, color: MUTED, fontWeight: 500 }}>{lbl}</span>}
      <svg width="32" height="2" viewBox="0 0 32 2" style={{ overflow: 'visible' }}>
        <line x1="0" y1="1" x2="26" y2="1" stroke={DIM} strokeWidth="1.5" />
        <path d="M26 -4 L32 1 L26 6" fill="none" stroke={DIM} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ── Box component ───────────────────────────────────────────────────────────

function Box({
  title, subtitle, highlight = false, children,
  style: extraStyle,
}: {
  title: string;
  subtitle?: string;
  highlight?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{
      background: highlight ? ORANGE_DIM : CARD,
      border: `1px solid ${highlight ? ORANGE_BORDER : CARD_BORDER}`,
      borderRadius: 10,
      padding: '10px 14px',
      minWidth: 0,
      ...extraStyle,
    }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: highlight ? ORANGE : '#fff', lineHeight: 1.2 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: MUTED, marginTop: 2, lineHeight: 1.3 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

// ── Group container ─────────────────────────────────────────────────────────

function Group({ title, children, style: extraStyle }: {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: 14,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 10,
      ...extraStyle,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: MUTED, letterSpacing: '0.07em', textTransform: 'uppercase' as const, marginBottom: 2 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

// ── Build Flow (top diagram) ─────────────────────────────────────────────────

function BuildFlow() {
  const steps = [
    { n: '1', tool: 'Claude Design', action: 'PDF + speaker script → HTML prototype', highlight: true },
    { n: '2', tool: 'Claude Code', action: 'React 19 + TS + Tailwind + ElevenLabs TTS', highlight: true },
    { n: '3', tool: 'Claude Code', action: 'Docker → Amazon ECR → AWS App Runner', highlight: true },
    { n: '4', tool: 'Claude Code', action: 'Lambda + API Gateway logging → CloudWatch + Slack', highlight: true },
    { n: '5', tool: 'Claude Code', action: 'Ask Claude panel + Kiosk mode (this chat!)', highlight: true },
  ];

  return (
    <Group title="Build process — 5 steps, all Claude">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as const }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              background: s.highlight ? ORANGE_DIM : CARD,
              border: `1px solid ${s.highlight ? ORANGE_BORDER : CARD_BORDER}`,
              borderRadius: 9,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}>
              <span style={{
                background: ORANGE,
                color: '#fff',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 800,
                width: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: 1,
              }}>{s.n}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: ORANGE }}>{s.tool}</div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 1, lineHeight: 1.35 }}>{s.action}</div>
              </div>
            </div>
            {i < steps.length - 1 && <Arrow />}
          </div>
        ))}
      </div>
    </Group>
  );
}

// ── Runtime Architecture (bottom diagram) ───────────────────────────────────

function RuntimeArch() {
  return (
    <Group title="Runtime architecture">
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 10 }}>

        {/* Browser */}
        <div style={{
          background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 10, padding: '10px 14px',
          display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180, flexShrink: 0,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Browser</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>React App</div>
          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>
            Slide deck<br />
            Narrative overlay<br />
            Autoplay controls<br />
            Ask Claude panel<br />
            Kiosk mode
          </div>
        </div>

        <Arrow label="HTTP" />

        {/* App Runner */}
        <div style={{
          background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 10, padding: '10px 14px',
          display: 'flex', flexDirection: 'column', gap: 8, flex: 1,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
            AWS App Runner · us-east-1
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Box title="Express :8080" subtitle="Static dist/ assets" style={{ flex: 1 }} />
            <Box title="ElevenLabs Proxy" subtitle="POST /api/elevenlabs/tts" highlight style={{ flex: 1 }} />
            <Box title="Claude Proxy" subtitle="POST /api/claude/chat  SSE stream" highlight style={{ flex: 1 }} />
          </div>
        </div>

        <Arrow label="API" />

        {/* External APIs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160, flexShrink: 0 }}>
          <Box title="ElevenLabs" subtitle="Voice synthesis (cloned)" highlight />
          <Box title="Anthropic" subtitle="claude-opus-4-7 streaming" highlight />
        </div>

        <Arrow label="POST /log" />

        {/* Logging */}
        <div style={{
          background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 10, padding: '10px 14px',
          display: 'flex', flexDirection: 'column', gap: 8, minWidth: 170, flexShrink: 0,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
            AWS · us-west-2
          </div>
          <Box title="API Gateway" subtitle="X-Api-Key auth" />
          <Box title="Lambda" subtitle="mega-demo-logger" />
          <Box title="CloudWatch + Slack" subtitle="Play events · errors" />
        </div>

      </div>
    </Group>
  );
}

// ── Main slide ───────────────────────────────────────────────────────────────

export default function ArchSlide() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      padding: '52px 72px 48px',
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      gap: 32,
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <defs>
              <linearGradient id="ag" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={ORANGE} />
                <stop offset="100%" stopColor="#FF9A5C" />
              </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="10" fill="url(#ag)" />
            <path d="M15.5 8.5C14.5 7.5 13.3 7 12 7C9.2 7 7 9.2 7 12C7 14.8 9.2 17 12 17C13.3 17 14.5 16.5 15.5 15.5"
              stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
          <h1 style={{ margin: 0, fontSize: 42, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
            How This App Was Built
          </h1>
        </div>
        <span style={{ fontSize: 18, color: MUTED, fontStyle: 'italic' }}>
          The demo builds itself — with Claude
        </span>
      </div>

      {/* Build flow */}
      <BuildFlow />

      {/* Runtime architecture */}
      <RuntimeArch />

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        borderTop: `1px solid ${DIM}`,
        paddingTop: 16,
      }}>
        <div style={{ display: 'flex', gap: 32 }}>
          {[
            ['Frontend', 'React 19 · TypeScript · Vite 8 · Tailwind CSS v4'],
            ['Voiceover', 'ElevenLabs · cloned presenter voice · server-side proxy'],
            ['Chat', 'claude-opus-4-7 · Anthropic SDK · SSE streaming'],
            ['Deploy', 'Docker · Amazon ECR · AWS App Runner · SAM Lambda'],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 12, fontWeight: 700, color: ORANGE, letterSpacing: '0.05em' }}>{k}</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {label('Powered by', MUTED, 13)}
          <span style={{ fontSize: 14, fontWeight: 700, color: ORANGE }}>Claude</span>
          <span style={{ fontSize: 13, color: DIM }}>·</span>
          <span style={{ fontSize: 13, color: MUTED }}>claude.ai</span>
        </div>
      </div>

    </div>
  );
}
