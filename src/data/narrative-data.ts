// A highlight region on the slide, shown while a segment is spoken.
// Coordinates are percentages of the 1920x1080 design canvas.
export interface HighlightRegion {
  top: number;
  left: number;
  width: number;
  height: number;
}

// When a "say" section has segments, the text is spoken in parts,
// each with an optional highlight region shown on the slide.
export interface SaySegment {
  text: string;
  highlight?: HighlightRegion;
}

export interface NarrativeSection {
  label?: string;
  kind: 'note' | 'say' | 'do' | 'persona';
  text: string;
  segments?: SaySegment[]; // if present, overrides text for voiceover
}

export interface NarrativeEntry {
  phase: string;
  beat: string;
  title: string;
  time: string;
  sections: NarrativeSection[];
}

export const NARRATIVE: NarrativeEntry[] = [
  // 0 · Page 1 — Title
  {
    phase: "Opening",
    beat: "Stage entrance",
    title: "Data 360 Campground · Mega Demo",
    time: "0:00",
    sections: [
      { label: "Say", kind: "say",
        text: "Welcome to the Data 360 Campground Mega Demo, built for Salesforce TrailblazerDX 2026. This showcase walks through the Agentic Health Enterprise Architecture end to end — from real-time patient data to autonomous care agents. A big thank you to the incredible team who helped bring this to life. Let's get started." }
    ]
  },

  // 1 · Page 2 — Architecture overview
  {
    phase: "Framing",
    beat: "The stack",
    title: "Salesforce Agentic Enterprise Architecture",
    time: "0:15",
    sections: [
      { label: "Frame", kind: "say",
        text: "Salesforce has the platforms, unified on one architecture, to bring the Agentic Enterprise to life." },
      { label: "Direction", kind: "note",
        text: "Orient the audience on the stack before we dive into the healthcare demo." }
    ]
  },

  // 2 · Page 3 — Architecture · Context
  {
    phase: "Framing",
    beat: "Context layer",
    title: "System of Context — Data 360",
    time: "0:20",
    sections: [
      { label: "Say", kind: "say",
        text: "At the foundation is our system of context, powered by Data 360, where every signal across the enterprise is turned into action for agents." }
    ]
  },

  // 3 · Page 4 — Architecture · Work
  {
    phase: "Framing",
    beat: "Work layer",
    title: "System of Work — Customer 360",
    time: "0:30",
    sections: [
      { label: "Say", kind: "say",
        text: "Then, there's our system of work -- the core Salesforce platform --27 years of proven workflows running your business." }
    ]
  },

  // 4 · Page 5 — Architecture · Agency
  {
    phase: "Framing",
    beat: "Agency layer",
    title: "System of Agency — Agentforce",
    time: "0:40",
    sections: [
      { label: "Say", kind: "say",
        text: "Above that is our system of agency -- Agentforce -- where you can build, deploy, observe and test agents at scale." }
    ]
  },

  // 5 · Page 6 — Architecture · Engagement
  {
    phase: "Framing",
    beat: "Engagement layer",
    title: "System of Engagement — Slack",
    time: "0:50",
    sections: [
      { label: "Say", kind: "say",
        text: "And it all comes together in our system of engagement -- Slack -- where all your humans, agents, apps, and data are united. It's open at every layer, integrating into every system across your business --- Let's dive in." }
    ]
  },

  // 6 · Slide 7 — Data Trapped
  {
    phase: "Framing",
    beat: "The problem",
    title: "Why context, why now",
    time: "0:55",
    sections: [
      { label: "Say", kind: "say",
        text: "AI requires reliable data — but most of it sits trapped. 80% goes unused. 30% of the world's data comes from healthcare: patient records, claims, wearables, physician notes, research — and none of it speaks to each other." }
    ]
  },

  // 7 · Slide 8 — Pillars
  {
    phase: "Framing",
    beat: "The promise",
    title: "Trusted Enterprise Context",
    time: "1:10",
    sections: [
      { label: "Say", kind: "say",
        text: "Turning data into context for activation. This is what we mean by the System of Context — and this demo is going to show it end to end, in healthcare." }
    ]
  },

  // 8 · Slide 9 — System of Context platform
  {
    phase: "Framing",
    beat: "Platform map",
    title: "System of Context — the platform",
    time: "1:25",
    sections: [
      { label: "Say", kind: "say",
        text: "This is the platform we're standing on for this system of context demo. Connect, trust, understand, activate, act, govern — one loop, one source of truth." }
    ]
  },

  // 9 · Slide 10 — RT Events → Agent → Slack
  {
    phase: "Framing",
    beat: "Flow · real-time",
    title: "Real-time events → Agentforce → Slack & MCP",
    time: "1:40",
    sections: [
      { label: "Say", kind: "say",
        text: "Here's the first flow — a real-time glucose event flowing through Data 360 to the Care Agent, which alerts care teams in Slack and updates the EHR through an MCP server." }
    ]
  },

  // 10 · Slide 11 — Document AI
  {
    phase: "Framing",
    beat: "Flow · unstructured",
    title: "Document AI — unstructured to structured",
    time: "1:55",
    sections: [
      { label: "Say", kind: "say",
        text: "Document AI extracts structured data from unstructured clinical documents — discharge summaries, physician notes — and maps them directly into Data Cloud fields. This is how the system knows what's in a PDF without anyone reading it." }
    ]
  },

  // 11 · Slide 12 — Semantic Model → Tableau
  {
    phase: "Framing",
    beat: "Flow · analytics",
    title: "Semantic Model → Tableau & Analytics Agent",
    time: "2:05",
    sections: [
      { label: "Say", kind: "say",
        text: "The semantic model grounds Tableau Next and the Analytics Agent. When the agent reasons, it's against metrics the clinical team certified — not raw database fields." }
    ]
  },

  // 12 · Slide 13 — Data 360 Agent → Segment
  {
    phase: "Framing",
    beat: "Flow · activation",
    title: "Data 360 Agent → Segment rules",
    time: "2:15",
    sections: [
      { label: "Say", kind: "say",
        text: "The Data 360 Agent generates segment rules from the real-time graph. Segments feed Marketing Cloud Next. Patient outreach is a downstream trigger, not a separate pipeline." }
    ]
  },

  // 13 · Slide 14 — Maria — Informatica Profile
  {
    phase: "Demo",
    beat: "Meet Maria",
    title: "Patient golden record in Informatica",
    time: "2:30",
    sections: [
      { label: "Say", kind: "say",
        text: "Meet Maria Gonzalez. She's in her forties, diabetic, and she wears a continuous glucose monitor. What you're looking at is her golden record in Informatica — the single source of truth the care team works from." }
    ]
  },

  // 14 · Slide 15 — Three Marias — Source Records
  {
    phase: "Demo",
    beat: "Informatica MDM",
    title: "Three Marias. Which one gets the bill?",
    time: "2:50",
    sections: [
      { label: "Say", kind: "say",
        text: "Same person — three spellings, two dates of birth, five different IDs across the health system. Which Maria gets the bill? Informatica MDM resolved these into one golden record — authoritative, governed, auditable." }
    ]
  },

  // 15 · Slide 16 — Patient 360 Console
  {
    phase: "Demo",
    beat: "Unified profile",
    title: "Complete patient view in Health Cloud",
    time: "3:10",
    sections: [
      { label: "Say", kind: "say",
        text: "The Patient 360 Console in Health Cloud — clinical encounters, alerts, health conditions, care programs, activity timeline. Everything stitched together from every source system into one view." }
    ]
  },

  // 16 · Slide 17 — Real-Time Data Graph
  {
    phase: "Demo",
    beat: "Live event",
    title: "Glucose event in the Real-Time Data Graph",
    time: "3:25",
    sections: [
      { label: "Say", kind: "say",
        text: "Maria's glucose monitor sends a high reading — 236 milligrams per deciliter. It arrives in the Data 360 Real-Time Data Graph in under 200 milliseconds. Not a batch export — this is what the agent sees, structured, the moment the monitor emits it." }
    ]
  },

  // 17 · Slide 18 — GlucoseMonitorEvent Flow
  {
    phase: "Demo",
    beat: "Event trigger",
    title: "Automation flow fires on glucose event",
    time: "3:40",
    sections: [
      { label: "Say", kind: "say",
        text: "An event-triggered automation flow bound to the GlucoseMonitorEvent data model object. The condition fires on high or low readings — out-of-range is what we care about." }
    ]
  },

  // 18 · Slide 19 — Glucose Event → Care Agent
  {
    phase: "Demo",
    beat: "Care Agent handoff",
    title: "Flow passes event to the Care Agent",
    time: "3:50",
    sections: [
      { label: "Say", kind: "say",
        text: "The flow hands the glucose event off to the Care Agent with full patient context. The agent decides what to do — schedule, alert, escalate. If it faults, a Slack message still goes out. Never silent." }
    ]
  },

  // 19 · Slide 20 — Care Agent · Autonomous Assistant
  {
    phase: "Demo",
    beat: "Agentforce",
    title: "Care Agent — autonomous assistant",
    time: "4:05",
    sections: [
      { label: "Say", kind: "say",
        text: "The Care Agent, configured with Agent Script, acts as an autonomous assistant to medical staff — handling glucose events, proposing care plans sent to Slack, scheduling follow-up appointments, and updating patient records in EMR systems via MCP tools." }
    ]
  },

  // 20 · Slide 21 — Agent Action → Slack Message
  {
    phase: "Demo",
    beat: "Slack composer",
    title: "Agent generates clinical Slack message",
    time: "4:20",
    sections: [
      { label: "Say", kind: "say",
        text: "An agent action feeds into a prompt template that generates a detailed clinical alert for Slack — patient context, glucose trends, and recommended next steps. Same event, two surfaces: the conversation and the medical record." }
    ]
  },

  // 21 · Slide 22 — Slack · #care-alerts
  {
    phase: "Demo",
    beat: "Nirvana — alert",
    title: "The alert lands in Slack",
    time: "4:35",
    sections: [
      { label: "Say", kind: "say",
        text: "Dr. Chen opens Slack. The alert is already there. Maria Gonzalez, latest reading 236, 48-hour trend of dangerous spikes, no appointments in 90 days. She didn't go looking — the system found her and brought the right information to where she already works." }
    ]
  },

  // 22 · Slide 23 — Slack · Approve Care Plan
  {
    phase: "Demo",
    beat: "Nirvana — action",
    title: "Human in the loop — one click",
    time: "4:55",
    sections: [
      { label: "Say", kind: "say",
        text: "The care team asks the Care Agent to schedule a follow-up. The agent proposes — reason pre-filled from the alert, preferred date inferred from the urgency. One click to confirm. The agent drafts, the human decides." }
    ]
  },

  // 23 · Slide 24 — Slackbot → Health Cloud
  {
    phase: "Demo",
    beat: "Cross-system query",
    title: "Verify from Slack, launch into Health Cloud",
    time: "5:10",
    sections: [
      { label: "Say", kind: "say",
        text: "The care team can verify directly from Slack — no context switch. Slackbot queries Salesforce and confirms the appointment is on the books. One click opens the full record in Health Cloud." }
    ]
  },

  // 24 · Slide 25 — Patient Record · Alerts + Appointments
  {
    phase: "Demo",
    beat: "Closed loop",
    title: "The loop closes in the record",
    time: "5:25",
    sections: [
      { label: "Say", kind: "say",
        text: "Back on Maria's record. The glucose alerts landed in Clinical Alerts. The appointment is on the timeline. From wearable spike to scheduled follow-up — in under 2 minutes, without anyone leaving Slack." }
    ]
  },

  // 25 · Slide 26 — Care Agent → MCP Tools
  {
    phase: "Plumbing",
    beat: "MCP tools",
    title: "Agent updates EMR through MCP",
    time: "5:40",
    sections: [
      { label: "Say", kind: "say",
        text: "The Care Agent updates patient records in external EMR systems through MCP tools. Built in MuleSoft, published to the Agentforce catalog — governed, versioned, discoverable." }
    ]
  },

  // 26 · Slide 27 — Agentforce Registry · MCP
  {
    phase: "Plumbing",
    beat: "Agentforce registry",
    title: "MCP tools as native agent actions",
    time: "5:55",
    sections: [
      { label: "Say", kind: "say",
        text: "The Agentforce Registry surfaces MCP tools as native agent actions. Five tools, with schemas. Agent-to-system, securely, through Agentforce MCP client support." }
    ]
  },

  // 27 · Slide 28 — MuleSoft MCP Server · Docs
  {
    phase: "Plumbing",
    beat: "Self-documenting",
    title: "Secure, governed, monitored MCP tools",
    time: "6:05",
    sections: [
      { label: "Say", kind: "say",
        text: "MuleSoft provides secure, governed, and monitored MCP tools. Every tool is self-documenting — get_patient_record returns demographics, conditions, medications, vitals, care team — the full clinical view, accessible to any MCP-capable agent." }
    ]
  },

  // 28 · Slide 29 — Tableau Next + Analytics Agent
  {
    phase: "Plumbing",
    beat: "Tableau + agent",
    title: "Dashboard and Analytics Agent",
    time: "6:20",
    sections: [
      { label: "Say", kind: "say",
        text: "Ask it in natural language — CSAT by category. The Analytics Agent grounds against the Patient 360 semantic model and returns a chart the clinical team certified. Not a hallucination — a metric with a semantic definition." }
    ]
  },

  // 29 · Slide 30 — Semantic Model Builder
  {
    phase: "Plumbing",
    beat: "Semantic model",
    title: "Governed metrics, defined once",
    time: "6:35",
    sections: [
      { label: "Say", kind: "say",
        text: "Six governed metrics, three data objects, one semantic model. Tableau uses it. The agent uses it. The dashboards use it. Change a definition once — every surface updates." }
    ]
  },

  // 30 · Slide 31 — D360 Agent → Segment Rules
  {
    phase: "Plumbing",
    beat: "Data 360 agent",
    title: "Agent-authored segment — 16,735 patients",
    time: "6:50",
    sections: [
      { label: "Say", kind: "say",
        text: "Create segment rules for patients over 55 with recent clinical visits. The Data 360 Agent writes the rules. 16,735 patients — live, not last month's export. The segment updates the moment any profile changes." }
    ]
  },

  // 31 · Slide 32 — Privacy Center · Consent
  {
    phase: "Governance",
    beat: "Consent",
    title: "Per-channel, per-purpose consent",
    time: "7:05",
    sections: [
      { label: "Say", kind: "say",
        text: "Consent isn't a binary opt-in. It's per channel, per purpose. The patient says yes to record matching, yes to document extraction, maybe to AI-assisted care — and that map travels with every downstream decision." }
    ]
  },

  // 32 · Slide 33 — Data Governance · PHI
  {
    phase: "Governance",
    beat: "Tags · classifications",
    title: "PHI across 72 fields",
    time: "7:20",
    sections: [
      { label: "Say", kind: "say",
        text: "One tag. 72 fields. Every downstream tool — agents, dashboards, APIs — inherits the classification and security policies defined in Data 360 Data Governance. You cannot accidentally use data you are not allowed to use." }
    ]
  },

  // 33 · Slide 34 — Shield · Encryption
  {
    phase: "Governance",
    beat: "Trust foundation",
    title: "Encryption at every layer",
    time: "7:35",
    sections: [
      { label: "Say", kind: "say",
        text: "Salesforce Shield provides encryption at rest, across every layer. Bring your own key. Event monitoring. Audit trail. Trust isn't a bolted-on appliance — it's the floor the platform stands on." }
    ]
  },

  // 34 · Slide 35 — Architecture Recap
  {
    phase: "Close",
    beat: "Recap",
    title: "The full architecture",
    time: "7:50",
    sections: [
      { label: "Say", kind: "say",
        text: "Everything we just walked through — one platform, four systems, connected, trusted, governed, understood, activated, acted on. The Agentic Health Enterprise Architecture, end to end." }
    ]
  },

  // 35 · Slide 36 — Thank You
  {
    phase: "Close",
    beat: "Thanks",
    title: "Thank you",
    time: "8:00",
    sections: [
      { label: "Note", kind: "note",
        text: "Thank you slide. Pause for applause." },
      { label: "Say", kind: "say",
          text: "Thank you for watching! -- and a big thank you to team  who helped make this possible!" }
    ]
  },

  // 36 · Slide 37 — How Was This Built?
  {
    phase: "Behind the Scenes",
    beat: "AI reveal",
    title: "How was this demo built?",
    time: "8:10",
    sections: [
      { label: "Say", kind: "say",
        text: "So — how was this demo actually built? Every component you just saw was accelerated by AI tooling -- Let's walk through a bit of the journey." }
    ]
  },

  // 37 · Slide 38 — Built With · Glucose Monitor
  {
    phase: "Behind the Scenes",
    beat: "Claude Code",
    title: "Glucose monitor simulator — Claude Code",
    time: "8:20",
    sections: [
      { label: "Say", kind: "say",
        text: "The glucose monitor simulator — the app that sends real-time readings into the Data 360 Real-Time Data Graph via the Real-Time Ingestion API — was built and deployed to AWS entirely with Claude Code." }
    ]
  },

  // 38 · Slide 39 — Built With · MeshMesh
  {
    phase: "Behind the Scenes",
    beat: "MeshMesh",
    title: "Patient record design — MeshMesh",
    time: "8:35",
    sections: [
      { label: "Say", kind: "say",
        text: "MeshMesh, a Salesforce-aware AI too, was used to design the patient record page and all related Health Cloud objects in one visual surface — verifying the Data 360 schema before wiring it to the agent. UI design at the speed of thought." }
    ]
  },

  // 39 · Slide 40 — Built With · Cursor
  {
    phase: "Behind the Scenes",
    beat: "Cursor",
    title: "Tableau dashboard data — Cursor",
    time: "8:50",
    sections: [
      { label: "Say", kind: "say",
        text: "The Health Cloud data powering the Tableau Next dashboards — patient encounters, CSAT scores, clinical metrics — was generated with Cursor. Realistic healthcare data, shaped to match the semantic model, created through AI-assisted code generation." }
    ]
  },

  // 40 · Slide 41 — Built With · Claude Design + Code
  {
    phase: "Behind the Scenes",
    beat: "This presentation",
    title: "This presentation — Claude Design + Claude Code",
    time: "9:05",
    sections: [
      { label: "Say", kind: "say",
        text: "And finally — what you're watching right now. This presentation is not a recording. It's a live web application built with Claude Design and Claude Code, narrated by an ElevenLabs voice clone of the presenter. The slides, the navigation, the voiceover, the deployment to AWS — all built through conversation with AI. The demo demos itself." }
    ]
  },

  // 41 · Slide 42 — App Architecture · How It Was Built
  {
    phase: "Behind the Scenes",
    beat: "Build + runtime architecture",
    title: "App Architecture — How It Was Built",
    time: "9:15",
    sections: [
      { label: "Say", kind: "say",
        text: "And here's a look under the hood of this presentation app itself. Four steps to build it: Claude Design prototyped the slide deck from the PDF and speaker script. Claude Code converted that into a React app with ElevenLabs voiceover, deployed it to AWS App Runner via Docker and ECR, and built a serverless logging service on Lambda. At runtime, the Express server proxies ElevenLabs, Claude direct, and the Salesforce Models API — giving access to Claude, GPT, Gemini, and Amazon Nova through the Einstein Trust Layer — so no API key or token ever reaches the browser. And yes — this very chat is part of the same app, with a model selector to switch between all of them." },
      { label: "Note", kind: "note",
        text: "This is the meta slide — the presentation explains how it built itself. A great moment to pause and let it land." }
    ]
  },

  // 42 · Slide 43 — Resources
  {
    phase: "Resources",
    beat: "Links",
    title: "Resources & Links",
    time: "9:30",
    sections: [
      { label: "Say", kind: "say",
        text: "Here are all the links. You can open this presentation in your own browser, check out the GitHub repos for this voice-over app and the glucose monitor simulator, and find me on LinkedIn. Thanks for watching." }
    ]
  }
];
