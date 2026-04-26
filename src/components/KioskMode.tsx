import { useCallback, useEffect, useRef, useState } from 'react';
import { useClaude, type ChatMessage } from '../hooks/useClaude';
import { NARRATIVE } from '../data/narrative-data';
import { SLIDE_LABELS, TOTAL_SLIDES } from '../data/slides';
import { DEFAULT_MODEL, getModel } from '../data/models';
import ModelSelector from './ModelSelector';

const CLAUDE_ORANGE = '#FF6B35';

const KIOSK_COMPACT = `You are a friendly Salesforce solutions architect staffing the Data 360 Campground booth at TDX '26. Answer questions about the System of Context Mega Demo: a healthcare scenario where a patient's glucose monitor triggers Salesforce Data 360's real-time data graph → Agentforce Care Agent (Slack alerts, appointment scheduling, EHR updates via MuleSoft MCP Server) → Tableau Next dashboards grounded by Data 360 semantic model → Data 360 Agent segments for Marketing Cloud Next. Informatica MDM resolves the patient golden record. Governed by PHI/HIPAA tagging and Shield Platform Encryption. This web app was built with Claude Design + Claude Code + ElevenLabs voice clone, deployed to AWS App Runner. Be specific, enthusiastic, and concise (3–5 sentences). Don't discuss pricing or availability — direct those to the booth team.`;

function buildKioskSystemPrompt(compact = false): string {
  if (compact) return KIOSK_COMPACT;

  const slideOverview = NARRATIVE.map((e, i) =>
    `Slide ${i + 1} — ${e.title} [${e.phase} / ${e.beat}]: ${e.sections.filter(s => s.kind === 'say').map(s => s.text).join(' ')}`
  ).join('\n\n');

  return `You are a friendly, expert AI demo guide at the Salesforce TrailblazerDX 2026 conference, stationed at the Data 360 Campground booth. Visitors at this kiosk can ask you anything about the "System of Context" Mega Demo they just watched or are about to watch.

## About this demo
This demo presents the Agentic Health Enterprise Architecture — a healthcare scenario where:
- A patient's continuous glucose monitor sends real-time alerts
- Salesforce Data 360's real-time data graph processes the event
- Agentforce Care Agent takes autonomous action (Slack alert, appointment scheduling, EHR update)
- A Patient 360 MCP Server published on MuleSoft provides governed tools to agents
- Tableau Next dashboards grounded by Data 360's semantic model give analytics visibility
- Data 360 Agent creates patient segments for Marketing Cloud Next outreach
- Informatica MDM resolves the patient golden record
- All governed by Data 360's PHI/HIPAA tagging and Shield Platform Encryption

## Technologies covered
Salesforce Platform, Health Cloud, Agentforce, Agentforce Builder, Agentforce Registry, Data 360 (Real-Time Data Graph, Semantic Model Builder, D360 Agent), Slack, Tableau Next, Marketing Cloud Next, MuleSoft (MCP Server on Exchange), Informatica Customer 360 MDM, Shield Platform Encryption, Privacy Center.

## Full slide-by-slide narrative
${slideOverview}

## How this presentation was built (meta layer)
This web app was itself built entirely with AI tooling — it's a live demonstration of the build process it describes:
1. **Claude Design** (claude.ai/design) — the PDF presentation and per-slide speaker scripts were uploaded. Claude Design merged them into an HTML prototype with a custom <deck-stage> web component and a narrative overlay panel showing speaker lines and stage directions per slide.
2. **Claude Code** (claude.ai/code) — took the Claude Design handoff bundle and rebuilt it as a React 19 + TypeScript + Vite app with Tailwind CSS v4. Added autoplay controls and ElevenLabs TTS voiceover with a cloned voice of the presenter (Ryan Cox), so the deck literally narrates itself in his voice.
3. **ElevenLabs** — voice cloning. The default voice "Ryan" is a clone of the presenter. The ElevenLabs API key is kept server-side in an Express proxy; it never reaches the browser.
4. **Docker + AWS App Runner** — Claude Code also packaged the app in a multi-stage Docker image (Node 22 + Express on port 8080), pushed to Amazon ECR, and deployed to AWS App Runner with HTTPS and auto-scaling — all from the CLI without leaving the conversation.
5. **AWS Logging Service** — a serverless companion (AWS SAM: Lambda + API Gateway) built by Claude Code. It receives structured log events from the app, writes them to CloudWatch Logs (90-day retention), and posts Slack notifications to a #logs channel. The app logs play events (browser, timezone, screen size) and any voiceover failures.
6. **This very chat** — the "Ask Claude" panel and this Kiosk mode are also built by Claude Code, using the Anthropic SDK (claude-opus-4-7) with streaming, via a server-side Express proxy so the API key stays secure.

The app is deployed at bit.ly/tdx26-mega-demo. The GitHub repos are github.com/congmingwudi/tdx26-mega-demo (this app) and github.com/congmingwudi/patient360-glucose-monitor (the glucose simulator).

## Your persona
- Friendly, enthusiastic, and knowledgeable — like a senior Salesforce solutions architect who loves this stuff
- Give concrete, specific answers — not generic marketing speak
- If someone asks about pricing, contracts, or availability, say you focus on the technical demo and suggest they visit the booth team
- Keep answers to 3–5 sentences unless someone asks you to go deeper
- When someone asks "what is this?", give them the 30-second overview of the demo
- When someone asks how this presentation was built, give the full meta story — Claude Design → Claude Code → ElevenLabs → Docker/App Runner → logging Lambda → and then gesture at yourself ("and this very chat is powered by Claude via the same Claude Code session")
- You can suggest they watch specific slides to see something in action`;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "How was this presentation itself built?",
  "What is this demo showing?",
  "How does Agentforce know what to do?",
  "What is Data 360 and why does it matter?",
  "How does the MuleSoft MCP Server work?",
  "What makes this architecture 'agentic'?",
  "How is patient data kept secure?",
];

export default function KioskMode({
  onClose,
  onGoToSlide,
}: {
  onClose: () => void;
  onGoToSlide: (index: number) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [modelId, setModelId] = useState(DEFAULT_MODEL.id);
  const { chat, stop, streaming } = useClaude();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Escape key closes kiosk
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const send = useCallback((text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || streaming) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);

    const history: ChatMessage[] = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }]);

    const compact = getModel(modelId).provider === 'salesforce';
    chat(
      history,
      buildKioskSystemPrompt(compact),
      modelId,
      (chunk) => {
        setMessages(prev => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === 'assistant') {
            copy[copy.length - 1] = { ...last, content: last.content + chunk };
          }
          return copy;
        });
      },
      () => {
        setMessages(prev => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === 'assistant') {
            copy[copy.length - 1] = { ...last, streaming: false };
          }
          return copy;
        });
      },
      (err) => {
        setMessages(prev => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === 'assistant') {
            copy[copy.length - 1] = {
              ...last,
              content: `I couldn't connect to Claude right now. (${err}) Please try again.`,
              streaming: false,
            };
          }
          return copy;
        });
      },
    );
  }, [input, messages, streaming, chat]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); send(); }
  };

  const reset = () => {
    stop();
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.92)',
      backdropFilter: 'blur(8px)',
      zIndex: 2147483600,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      color: '#e8e8e8',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flexShrink: 0,
      }}>
        <KioskLogo />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.01em' }}>
            Solution Guide
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
            TDX '26 System of Context Mega Demo
          </div>
        </div>

        {/* Model selector */}
        <ModelSelector modelId={modelId} onChange={id => { setModelId(id); setMessages([]); }} />

        {/* Slide quick-jump */}
        <SlideSelector onGoToSlide={(i) => { onGoToSlide(i); onClose(); }} />

        <button
          onClick={reset}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            padding: '6px 12px',
            fontSize: 11,
            fontFamily: 'inherit',
            fontWeight: 600,
          }}
        >
          New chat
        </button>

        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            padding: '6px 10px',
            fontSize: 11,
            fontFamily: 'inherit',
          }}
        >
          ESC to exit
        </button>
      </div>

      {/* Chat area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: conversation */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.1) transparent',
            }}
          >
            {messages.length === 0 ? (
              <WelcomeScreen onAsk={(q) => send(q)} />
            ) : (
              messages.map((msg, i) => (
                <div key={i} style={{
                  maxWidth: 720,
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: msg.role === 'user' ? 'rgba(255,255,255,0.3)' : CLAUDE_ORANGE,
                    marginBottom: 5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}>
                    {msg.role === 'assistant' && <MiniLogo />}
                    {msg.role === 'user' ? 'You' : 'Claude'}
                  </div>
                  <div style={{
                    background: msg.role === 'user' ? 'rgba(255,255,255,0.07)' : 'rgba(255,107,53,0.06)',
                    border: msg.role === 'user' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,107,53,0.12)',
                    borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '4px 12px 12px 12px',
                    padding: '12px 16px',
                    lineHeight: 1.6,
                    fontSize: 14,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.content}
                    {msg.streaming && (
                      <span style={{
                        display: 'inline-block',
                        width: 7,
                        height: 14,
                        background: CLAUDE_ORANGE,
                        marginLeft: 2,
                        borderRadius: 1,
                        animation: 'blink 0.8s step-end infinite',
                      }} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '16px 32px 20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask anything about this demo…"
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                color: '#fff',
                fontSize: 15,
                padding: '12px 18px',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={() => streaming ? stop() : send()}
              disabled={!streaming && !input.trim()}
              style={{
                background: streaming
                  ? 'transparent'
                  : (!input.trim() ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${CLAUDE_ORANGE} 0%, #FF9A5C 100%)`),
                border: streaming ? `1px solid ${CLAUDE_ORANGE}` : '1px solid transparent',
                borderRadius: 12,
                color: streaming ? CLAUDE_ORANGE : (!input.trim() ? 'rgba(255,255,255,0.2)' : '#fff'),
                cursor: !streaming && !input.trim() ? 'not-allowed' : 'pointer',
                padding: '12px 24px',
                fontSize: 14,
                fontWeight: 700,
                fontFamily: 'inherit',
                transition: 'all 140ms ease',
              }}
            >
              {streaming ? '■ Stop' : 'Ask →'}
            </button>
          </div>
        </div>

        {/* Right sidebar: suggested questions (shown when messages exist) */}
        {messages.length > 0 && (
          <div style={{
            width: 220,
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            padding: '20px 16px',
            overflowY: 'auto',
            flexShrink: 0,
          }}>
            <div style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)',
              marginBottom: 10,
            }}>
              Try asking
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  style={{
                    background: 'rgba(255,107,53,0.07)',
                    border: '1px solid rgba(255,107,53,0.15)',
                    borderRadius: 8,
                    color: 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    padding: '7px 10px',
                    fontSize: 11,
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    lineHeight: 1.4,
                    transition: 'background 140ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,107,53,0.13)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,107,53,0.07)')}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }`}</style>
    </div>
  );
}

function WelcomeScreen({ onAsk }: { onAsk: (q: string) => void }) {
  return (
    <div style={{ maxWidth: 640, margin: '40px auto', textAlign: 'center' }}>
      <KioskLogo size={48} style={{ margin: '0 auto 20px' }} />
      <h2 style={{ fontWeight: 800, fontSize: 22, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        Solution Guide
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.6, margin: '0 0 32px' }}>
        Ask me anything about this demo — how the technology works,
        why specific design choices were made, or how you'd implement this at your company.
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        textAlign: 'left',
      }}>
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => onAsk(q)}
            style={{
              background: 'rgba(255,107,53,0.08)',
              border: '1px solid rgba(255,107,53,0.2)',
              borderRadius: 10,
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              padding: '12px 14px',
              fontSize: 12,
              fontFamily: 'inherit',
              textAlign: 'left',
              lineHeight: 1.45,
              transition: 'background 140ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,107,53,0.14)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,107,53,0.08)')}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function SlideSelector({ onGoToSlide }: { onGoToSlide: (i: number) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          color: 'rgba(255,255,255,0.5)',
          cursor: 'pointer',
          padding: '6px 12px',
          fontSize: 11,
          fontFamily: 'inherit',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        Go to slide
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" style={{ opacity: 0.5 }}>
          <path d="M1 3l3 3 3-3" />
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 6,
          width: 280,
          maxHeight: 360,
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
        }}>
          <div style={{
            padding: '8px 12px',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}>Slides</div>
          <div style={{ overflowY: 'auto', padding: 4, scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            {SLIDE_LABELS.slice(0, TOTAL_SLIDES).map((label, i) => (
              <button
                key={i}
                onClick={() => { onGoToSlide(i); setOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '6px 10px',
                  background: 'transparent',
                  border: 0,
                  borderRadius: 6,
                  color: '#ccc',
                  cursor: 'pointer',
                  fontSize: 11,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', minWidth: 18, fontVariantNumeric: 'tabular-nums' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KioskLogo({ size = 28, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, ...style }}>
      <defs>
        <linearGradient id="kg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="100%" stopColor="#FF9A5C" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#kg)" />
      <path d="M15.5 8.5C14.5 7.5 13.3 7 12 7C9.2 7 7 9.2 7 12C7 14.8 9.2 17 12 17C13.3 17 14.5 16.5 15.5 15.5"
        stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function MiniLogo() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill="#FF6B35" />
      <path d="M15.5 8.5C14.5 7.5 13.3 7 12 7C9.2 7 7 9.2 7 12C7 14.8 9.2 17 12 17C13.3 17 14.5 16.5 15.5 15.5"
        stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
