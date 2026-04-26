import { useCallback, useEffect, useRef, useState } from 'react';
import { useClaude, type ChatMessage } from '../hooks/useClaude';
import { NARRATIVE } from '../data/narrative-data';
import { DEFAULT_MODEL, getModel } from '../data/models';
import ModelSelector from './ModelSelector';
import MermaidDiagram from './MermaidDiagram';
import { BUILD_FLOW_DIAGRAM, RUNTIME_DIAGRAM } from '../data/architecture-diagrams';

const CLAUDE_ORANGE = '#FF6B35';
const CLAUDE_GRADIENT = 'linear-gradient(135deg, #FF6B35 0%, #FF9A5C 100%)';

const DEMO_CORE = `TDX '26 System of Context Mega Demo — Agentic Health Enterprise Architecture. A patient's glucose monitor triggers real-time events through Salesforce Data 360's real-time data graph → Agentforce Care Agent (Slack alerts, appointment scheduling, EHR updates via MuleSoft MCP Server) → Tableau Next dashboards grounded by Data 360 semantic model → Data 360 Agent segments patients for Marketing Cloud Next outreach. Informatica MDM resolves the patient golden record. All governed by Data 360 PHI/HIPAA tagging and Shield Platform Encryption. Built with Claude Design + Claude Code, narrated by ElevenLabs voice clone, deployed to AWS App Runner.`;

function buildSystemPrompt(slideIndex: number, compact = false): string {
  const entry = NARRATIVE[slideIndex];
  const sayLines = entry?.sections
    .filter(s => s.kind === 'say')
    .map(s => s.text)
    .join(' ') ?? '';

  const slideCtx = `Current slide ${slideIndex + 1} — ${entry?.title ?? ''} (${entry?.phase ?? ''} / ${entry?.beat ?? ''}): ${sayLines}`;

  if (compact) {
    return `You are a knowledgeable Salesforce solutions architect answering questions about the ${DEMO_CORE}\n\n${slideCtx}\n\nBe specific and concise (2–4 sentences). Answer from the demo context above.`;
  }

  const allSay = NARRATIVE.map((e, i) =>
    `Slide ${i + 1} (${e.title}): ${e.sections.filter(s => s.kind === 'say').map(s => s.text).join(' ')}`
  ).join('\n');

  return `You are a helpful AI assistant embedded in the TDX '26 "System of Context" Mega Demo — a live Salesforce TrailblazerDX 2026 conference presentation about the Agentic Health Enterprise Architecture.

The presentation showcases how Salesforce Data 360, Agentforce, MuleSoft, Informatica, Tableau, Slack, Health Cloud, and Marketing Cloud work together in a healthcare scenario: a patient's continuous glucose monitor triggers real-time alerts, autonomous care agents, clinical dashboards, and patient outreach — all governed by Data 360.

## Current slide context (Slide ${slideIndex + 1}: ${entry?.title ?? ''})
Phase: ${entry?.phase ?? ''}
Beat: ${entry?.beat ?? ''}
Narration: ${sayLines}

## Full presentation overview
${allSay}

## Your role
Answer questions about what's shown in this demo — how the technology works, why specific design choices were made, and how it relates to real-world Salesforce implementations. Be specific and insightful. Keep answers concise (2–4 sentences unless asked to elaborate). You can reference other slides if relevant. Speak as a knowledgeable Salesforce/data architecture expert.`;
}

const ARCHITECTURE_TRIGGERS = [
  'how was this presentation',
  'how was this app built',
  'how was this demo built',
  'how was it built',
  'how did you build',
  'build flow',
  'runtime architecture',
  'how is this built',
];

function isArchitectureQuestion(text: string): boolean {
  const lower = text.toLowerCase();
  return ARCHITECTURE_TRIGGERS.some(t => lower.includes(t));
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
  diagrams?: boolean;
}

export default function AskClaude({
  slideIndex,
  onClose,
}: {
  slideIndex: number;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [modelId, setModelId] = useState(DEFAULT_MODEL.id);
  const { chat, stop, streaming, waiting } = useClaude();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom as messages grow
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);

    const history: ChatMessage[] = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Show architecture diagrams immediately for build-related questions while LLM thinks.
    if (isArchitectureQuestion(text)) {
      setMessages(prev => [...prev, { role: 'assistant', content: '', diagrams: true }]);
    }

    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }]);

    const compact = getModel(modelId).provider === 'salesforce';
    const systemPrompt = buildSystemPrompt(slideIndex, compact);

    chat(
      history,
      systemPrompt,
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
              content: `Sorry, I couldn't connect to Claude right now. (${err})`,
              streaming: false,
            };
          }
          return copy;
        });
      },
    );
  }, [input, messages, streaming, slideIndex, chat]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
    if (e.key === 'Escape') onClose();
  };

  const slideEntry = NARRATIVE[slideIndex];
  const slideName = slideEntry ? `Slide ${slideIndex + 1}: ${slideEntry.title}` : `Slide ${slideIndex + 1}`;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        right: 24,
        width: 400,
        maxHeight: 'calc(100vh - 120px)',
        background: '#0f0f0f',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,107,53,0.15)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: 13,
        color: '#e8e8e8',
        zIndex: 2147483500,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <ClaudeLogo size={22} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>Solution Guide</div>
          <div style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.35)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{slideName}</div>
        </div>
        <ModelSelector modelId={modelId} onChange={id => { setModelId(id); setMessages([]); }} />
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 0,
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 6,
            lineHeight: 1,
            fontSize: 16,
          }}
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.1) transparent',
        }}
      >
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.3)',
            fontSize: 12,
            padding: '24px 16px',
          }}>
            <ClaudeLogo size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Ask me anything about this slide</div>
            <div style={{ fontSize: 11, lineHeight: 1.5 }}>
              I'm grounded in the full demo narrative and can explain the technology, architecture, and design choices.
            </div>
            <SuggestedQuestions slideIndex={slideIndex} onAsk={(q) => { setInput(q); inputRef.current?.focus(); }} />
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!msg.diagrams && (
              <div style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: msg.role === 'user' ? 'rgba(255,255,255,0.35)' : CLAUDE_ORANGE,
                marginBottom: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                {msg.role === 'assistant' && <ClaudeLogo size={12} />}
                {msg.role === 'user' ? 'You' : 'Claude'}
              </div>
            )}
            {msg.diagrams ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <MermaidDiagram chart={BUILD_FLOW_DIAGRAM} label="Build Flow" />
                <MermaidDiagram chart={RUNTIME_DIAGRAM} label="Runtime Architecture" />
              </div>
            ) : (
              <div style={{
                lineHeight: 1.55,
                color: msg.role === 'user' ? 'rgba(255,255,255,0.85)' : '#e8e8e8',
                background: msg.role === 'user' ? 'rgba(255,255,255,0.05)' : 'transparent',
                borderRadius: msg.role === 'user' ? 8 : 0,
                padding: msg.role === 'user' ? '8px 10px' : 0,
                whiteSpace: 'pre-wrap',
              }}>
                {msg.streaming && waiting && !msg.content ? (
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', fontSize: 12 }}>
                    Thinking…
                  </span>
                ) : renderMarkdown(msg.content)}
                {msg.streaming && !waiting && (
                  <span style={{
                    display: 'inline-block',
                    width: 6,
                    height: 13,
                    background: CLAUDE_ORANGE,
                    marginLeft: 2,
                    borderRadius: 1,
                    animation: 'blink 0.8s step-end infinite',
                  }} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 12px 12px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        flexShrink: 0,
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about this slide…"
          rows={1}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            color: '#fff',
            fontSize: 13,
            padding: '8px 12px',
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.5,
            maxHeight: 100,
            overflow: 'auto',
          }}
        />
        <button
          onClick={streaming ? stop : send}
          disabled={!streaming && !input.trim()}
          style={{
            background: streaming ? 'rgba(255,107,53,0.15)' : (!input.trim() ? 'rgba(255,255,255,0.06)' : CLAUDE_GRADIENT),
            border: streaming ? `1px solid ${CLAUDE_ORANGE}` : '1px solid transparent',
            borderRadius: 10,
            color: streaming ? CLAUDE_ORANGE : (!input.trim() ? 'rgba(255,255,255,0.25)' : '#fff'),
            cursor: !streaming && !input.trim() ? 'not-allowed' : 'pointer',
            padding: '8px 14px',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'inherit',
            transition: 'all 140ms ease',
            whiteSpace: 'nowrap',
            height: 36,
          }}
        >
          {streaming ? 'Stop' : 'Ask'}
        </button>
      </div>

      {/* Powered by Claude */}
      <div style={{
        padding: '6px 16px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        fontSize: 10,
        color: 'rgba(255,255,255,0.2)',
        flexShrink: 0,
      }}>
        <span>Powered by</span>
        <span style={{ color: CLAUDE_ORANGE, fontWeight: 600 }}>Claude</span>
        <span>·</span>
        <span>claude.ai</span>
      </div>

      <style>{`@keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }`}</style>
    </div>
  );
}

function SuggestedQuestions({ slideIndex, onAsk }: { slideIndex: number; onAsk: (q: string) => void }) {
  const entry = NARRATIVE[slideIndex];
  if (!entry) return null;

  const questions = getSuggestedQuestions(slideIndex, entry.phase);

  return (
    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {questions.map((q, i) => (
        <button
          key={i}
          onClick={() => onAsk(q)}
          style={{
            background: 'rgba(255,107,53,0.08)',
            border: '1px solid rgba(255,107,53,0.2)',
            borderRadius: 8,
            color: 'rgba(255,255,255,0.65)',
            fontSize: 11,
            padding: '6px 10px',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'inherit',
            lineHeight: 1.4,
            transition: 'background 140ms ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,107,53,0.14)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,107,53,0.08)')}
        >
          {q}
        </button>
      ))}
    </div>
  );
}

function getSuggestedQuestions(_slideIndex: number, phase: string): string[] {
  const base = [
    "What's the key takeaway from this slide?",
    "How does this fit into the broader demo story?",
  ];
  const phaseMap: Record<string, string[]> = {
    'Framing': ["Why does Salesforce use a 'System of Context' framing?", "How does Data 360 differ from a traditional data warehouse?"],
    'Opening': ["What problem is this demo solving?", "Who is the target audience for this demo?"],
    'Real-Time Data': ["How does the real-time data graph work technically?", "What latency can we expect end-to-end?"],
    'Agent Flow': ["How does the Care Agent decide what action to take?", "What guardrails prevent the agent from making bad decisions?"],
    'Semantic Model': ["What's the difference between a semantic model and a data model?", "How does this ground agent responses?"],
    'Segmentation': ["How does D360 segmentation compare to traditional SQL-based segments?", "How quickly can segments be activated?"],
    'Governance': ["How is PHI/HIPAA compliance enforced here?", "Who controls access to patient data?"],
    'MuleSoft': ["What is an MCP Server and how does MuleSoft publish one?", "How does the agent discover available tools?"],
    'Behind the Scenes': ["How was this presentation app built?", "What did Claude Code actually do here vs. a human developer?"],
    'Closing': ["What would a customer need to get started with this architecture?", "What's the fastest path to value here?"],
    'Resources': ["How was this presentation itself built?", "Where can I find the source code?"],
  };
  for (const [key, qs] of Object.entries(phaseMap)) {
    if (phase.toLowerCase().includes(key.toLowerCase())) return [...qs, ...base].slice(0, 3);
  }
  return [...base, "What Salesforce products are involved in this step?"].slice(0, 3);
}

function renderMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ fontWeight: 700, color: '#fff' }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function ClaudeLogo({ size = 20, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="100%" stopColor="#FF9A5C" />
        </linearGradient>
      </defs>
      {/* Simplified Claude "C" mark */}
      <circle cx="12" cy="12" r="10" fill="url(#cg)" />
      <path
        d="M15.5 8.5C14.5 7.5 13.3 7 12 7C9.2 7 7 9.2 7 12C7 14.8 9.2 17 12 17C13.3 17 14.5 16.5 15.5 15.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
