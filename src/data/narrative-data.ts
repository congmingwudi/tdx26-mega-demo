export interface NarrativeSection {
  label?: string;
  kind: 'note' | 'say' | 'do' | 'persona';
  text: string;
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
    title: "Data 360 Campground · Super Demo",
    time: "0:00",
    sections: [
      { label: "Context", kind: "note",
        text: "Nine presenters credited. Desiree opens and introduces the arc: 'Nirvana first, then plumbing.' TDX technical audience — they care about the plumbing more than the business story." }
    ]
  },

  // 1 · Page 2 — Agentic Health Enterprise Architecture
  {
    phase: "Framing",
    beat: "The stack",
    title: "One platform, four systems",
    time: "0:15",
    sections: [
      { label: "Frame", kind: "say",
        text: "System of engagement. System of agency. System of work. System of context. Every layer is open — any agent, any data lake, any app — unified by the trust layer." },
      { label: "Direction", kind: "note",
        text: "Orient the audience on the stack before we dive into the healthcare demo. The four systems are the organizing metaphor for the entire narrative." }
    ]
  },

  // 2 · Page 3 — AI requires data / trapped
  {
    phase: "Framing",
    beat: "The problem",
    title: "Why context, why now",
    time: "0:45",
    sections: [
      { label: "Say", kind: "say",
        text: "AI requires data — but most of it sits trapped. 80% goes unused. 30% of the world's data comes from healthcare: patient records, claims, wearables, physician notes, research. None of it speaks to each other." },
      { label: "Note", kind: "note",
        text: "Sets up healthcare as the story lens. Healthcare is the domain, not a product constraint — same pattern applies to FSI, retail, manufacturing." }
    ]
  },

  // 3 · Page 4 — Trusted Enterprise Context pillars
  {
    phase: "Framing",
    beat: "The promise",
    title: "Trusted Enterprise Context",
    time: "1:00",
    sections: [
      { label: "Five pillars", kind: "do",
        text: "One Source of Truth · Connected Systems · Trusted Data Quality, Privacy, Governance · Data Activated Across Enterprise · Enterprise-Wide Metadata Catalog." },
      { label: "Say", kind: "say",
        text: "Turning data into context for activation. This is what we mean by the System of Context — and this demo is going to show it end to end, in healthcare, in under 10 minutes." }
    ]
  },

  // 4 · Page 5 — System of Context platform architecture
  {
    phase: "Framing",
    beat: "Platform map",
    title: "System of Context — the platform",
    time: "1:30",
    sections: [
      { label: "Say", kind: "say",
        text: "This is the platform we're standing on for the rest of the demo. Connect, trust, understand, activate, act, govern — one loop, one source of truth." },
      { label: "Direction", kind: "note",
        text: "Keep it to 30 seconds. Point broadly, not component by component. Detail comes later." }
    ]
  },

  // 5 · Page 6 — Real-Time Events → Agent → Slack/MCP
  {
    phase: "Framing",
    beat: "Flow · real-time",
    title: "Real-time events → Agentforce → Slack & MCP",
    time: "1:50",
    sections: [
      { label: "Do", kind: "do",
        text: "Walk the flow: glucose event → MuleSoft → Data 360 real-time data graph → Agentforce Care Agent → Slack alert · MCP action against Patient 360 MCP server." },
      { label: "Say", kind: "say",
        text: "Here's the first flow you're going to see end to end — a real-time event landing in Slack and triggering a governed action back into the EHR through an MCP server." }
    ]
  },

  // 6 · Page 7 — Semantic Model → Tableau + Analytics Agent
  {
    phase: "Framing",
    beat: "Flow · analytics",
    title: "Semantic Model → Tableau & Analytics Agent",
    time: "2:00",
    sections: [
      { label: "Say", kind: "say",
        text: "Second flow — analytics grounding. The semantic model is the thing that makes Tableau Next and the Analytics Agent trustworthy. When the agent reasons, it's against a model the clinical team certified — not raw database fields." }
    ]
  },

  // 7 · Page 8 — Data 360 Agent → Segment Rules
  {
    phase: "Framing",
    beat: "Flow · activation",
    title: "Data 360 Agent → Segment rules",
    time: "2:10",
    sections: [
      { label: "Say", kind: "say",
        text: "Third flow — activation. The Data 360 Agent generates segment rules from the real-time graph. Segments feed Marketing Cloud Next. Patient outreach is a downstream trigger, not a separate pipeline." }
    ]
  },

  // 8 · Page 9 — Document AI (section divider)
  {
    phase: "Framing",
    beat: "Flow · unstructured",
    title: "Document AI — unstructured, governed",
    time: "2:20",
    sections: [
      { label: "Context", kind: "note",
        text: "Section divider. The 'physician notes become queryable fields' callback — sets up why the outreach in the nirvana beat was so specific." }
    ]
  },

  // 9 · Page 10 — Informatica C360 · Maria Gonzalez patient profile
  {
    phase: "PHASE 1 · Beat 0",
    beat: "Live hook",
    title: "Meet Maria — before anyone speaks",
    time: "2:30 · 1 min",
    sections: [
      { label: "Screen", kind: "persona", text: "Informatica Customer 360 · Maria Gonzalez · Patient Details" },
      { label: "Context", kind: "note",
        text: "Informatica C360 is open on the demo laptop before anyone arrives. Maria's patient profile visible — demographics, contact info, general info, associated device (Accu-Chek Guide Glucose Meter)." },
      { label: "Say", kind: "say",
        text: "Before I show you anything, I want to tell you about Maria. She's in her forties, diabetic, and she wears a continuous glucose monitor. What you're looking at is the single patient record the care team works from." },
      { label: "Direction", kind: "note",
        text: "Let the audience read the screen for a few seconds. The vitals make Maria feel like a real person before any product is mentioned." }
    ]
  },

  // 10 · Page 11 — Informatica Source Records · three Marias
  {
    phase: "PHASE 2 · Plumbing 2",
    beat: "Informatica MDM",
    title: "Three Marias. Which one gets the bill?",
    time: "3:00",
    sections: [
      { label: "Persona", kind: "persona", text: "Speakers: Rudra Ray & Rameez Ghous" },
      { label: "Do", kind: "do",
        text: "Click Source Records tab. Five source records: Informatica C360, EHR, Default, IQVIA, Epic. Same person — spellings, dates of birth, IDs all differ." },
      { label: "Say", kind: "say",
        text: "Same person — three spellings, two dates of birth, five different IDs across the health system. Which Maria gets the bill? If a physician pulls the wrong record and misses a medication she's on, what happens? This is every healthcare org running disconnected systems for ten years." },
      { label: "Direction", kind: "note",
        text: "Pause. Let the billing and safety stakes land before you show the fix." }
    ]
  },

  // 11 · Page 12 — Patient 360 Console (unified view)
  {
    phase: "PHASE 2 · Plumbing 3",
    beat: "Unified profile",
    title: "One Maria. Governed. Auditable.",
    time: "3:30",
    sections: [
      { label: "Do", kind: "do",
        text: "Switch to Patient 360 Console. Single unified profile: clinical encounters, clinical alerts, health conditions, care programs, activity timeline." },
      { label: "Say", kind: "say",
        text: "Informatica MDM resolved those five records into one golden record — authoritative, governed, auditable. Billing goes to one Maria. Full medication history in one place. Every field is encrypted at rest. Every data change is tracked in an immutable audit trail." }
    ]
  },

  // 12 · Page 13 — JSON Preview · GlucoseMonitorEvent live record
  {
    phase: "PHASE 1 · Beat 0",
    beat: "Live event",
    title: "The glucose event, as a DMO record",
    time: "3:45",
    sections: [
      { label: "Do", kind: "do",
        text: "Open JSON Preview tab. Real-time view: ON. Point to the GlucoseMonitorEvent array — bloodSugarReading 236, level High, timestamp 2026-04-10." },
      { label: "Say", kind: "say",
        text: "This is the raw real-time event as it hits the Data Graph. Patient ID, blood sugar reading 236, level High. Not a batch export — this is what the agent sees, structured, the moment the monitor emits it." }
    ]
  },

  // 13 · Page 14 — Flow Builder · TDX — GlucoseMonitorEvent V7
  {
    phase: "PHASE 1 · Beat 0",
    beat: "Event trigger",
    title: "Event-triggered flow · level High or Low",
    time: "4:00",
    sections: [
      { label: "Do", kind: "do",
        text: "Switch to Flow Builder. TDX — GlucoseMonitorEvent V7. Automation Event-Triggered Flow · Handle GlucoseMonitorEvent subflow. Condition: level contains High OR level contains Low." },
      { label: "Say", kind: "say",
        text: "Here's the trigger. An event-triggered flow bound to the GlucoseMonitorEvent DMO. The condition fires on High or Low readings — out-of-range is what we care about." }
    ]
  },

  // 14 · Page 15 — Handle GlucoseMonitorEvent V16 debug run
  {
    phase: "PHASE 1 · Beat 0",
    beat: "Care Agent handoff",
    title: "Send Glucose Event to Care Agent",
    time: "4:15",
    sections: [
      { label: "Do", kind: "do",
        text: "Handle GlucoseMonitorEvent V16. Debug run completed. Autolaunched Flow → Send Glucose Event to Care Agent action → End. Fault path → Analyze & Send Glucose Event Slack Message subflow." },
      { label: "Say", kind: "say",
        text: "The flow hands the event off to the Care Agent. The agent decides what to do — schedule, alert, escalate. If it faults, we still make sure a Slack message goes out. Never silent." }
    ]
  },

  // 15 · Page 16 — Analyze Glucose Event & Create Slack Message V2
  {
    phase: "PHASE 1 · Beat 0",
    beat: "Slack composer",
    title: "Analyze · compose · alert",
    time: "4:30",
    sections: [
      { label: "Do", kind: "do",
        text: "Analyze Glucose Event & Create Slack Message V2. Sequence: Get Slack Channel ID → Generate Glucose Risk Alert Slack Message → Get Person Account → Get Condition Code → Create Patient Clinical Alert." },
      { label: "Say", kind: "say",
        text: "The subflow composes the Slack message and — in parallel — creates a Patient Clinical Alert record on the person account. Same event, two surfaces: conversation and record." }
    ]
  },

  // 16 · Page 17 — Agentforce Builder · Care Agent · Care Management topic
  {
    phase: "PHASE 2 · Plumbing 1",
    beat: "Agentforce",
    title: "Care Agent — topics, instructions, actions",
    time: "4:45",
    sections: [
      { label: "Do", kind: "do",
        text: "Agentforce Builder. Care Agent Version 10. Care Management topic. Instructions: on Glucose Monitor Event, prioritize this topic and schedule follow-up. Actions for reasoning: Analyze Glucose Event & Create Slack Message, Schedule Patient Appointment, update_patient_record (patient360mcp)." },
      { label: "Say", kind: "say",
        text: "The Care Agent is a declarative bundle of topics, instructions, and actions. 'If Glucose Monitor Event, set patientId, schedule follow-up, send Slack.' No prompts-as-code. The update_patient_record action is served by the MCP server — same agent, external tool." }
    ]
  },

  // 17 · Page 18 — Slack · #care-alerts · High-Risk Glucose Alert
  {
    phase: "PHASE 1 · Beat 1",
    beat: "Nirvana — alert",
    title: "Dr. Chen opens Slack. The alert is there.",
    time: "5:00 · 1 min",
    sections: [
      { label: "Persona", kind: "persona", text: "Dr. Chen — Care Coordinator" },
      { label: "Do", kind: "do",
        text: "Slack · #care-alerts. High-Risk Glucose Alert posted by Care Agent app. Latest reading 236 mg/dL, level High, 48-hour trend, dangerous spikes, no recent appointments. Recommended clinical next steps inline." },
      { label: "Say", kind: "say",
        text: "Dr. Chen opens Slack. The alert is already there. Maria Gonzalez. Latest reading 236. 48-hour trend of dangerous spikes. No appointments in 90 days. She didn't go looking — the system found her and brought the right information to where she already works." },
      { label: "Direction", kind: "note",
        text: "Don't scroll. Let the audience read the alert. The clinical context paragraph is the proof point." }
    ]
  },

  // 18 · Page 19 — Slack thread · Care Agent confirm appointment
  {
    phase: "PHASE 1 · Beat 1",
    beat: "Nirvana — action",
    title: "Human in the loop · one click",
    time: "5:30",
    sections: [
      { label: "Do", kind: "do",
        text: "@Care Agent schedule follow-up appointment — thread opens. Care Agent proposes: reason, preferred date April 13. Cancel / Confirm." },
      { label: "Say", kind: "say",
        text: "Jennifer asks the Care Agent to schedule. The agent proposes — reason pre-filled from the alert, preferred date inferred from the urgency. She clicks Confirm. One action, fully auditable." },
      { label: "Proof point", kind: "note",
        text: "The agent drafts. The human decides. Say it." }
    ]
  },

  // 19 · Page 20 — Slack DM · Slackbot appointments query
  {
    phase: "PHASE 1 · Beat 1",
    beat: "Cross-system query",
    title: "Queried Salesforce. Appointment scheduled.",
    time: "5:45",
    sections: [
      { label: "Do", kind: "do",
        text: "Slack DM: 'show scheduled appointments for Maria Gonzalez.' Slackbot replies: queried Salesforce. Glucose Follow-Up: Maria Gonzalez · Mon Apr 13 · 10–10:30 AM MDT. Contact card attached with Open in Salesforce." },
      { label: "Say", kind: "say",
        text: "Jennifer can verify from Slack — no context switch. The bot queries Salesforce and confirms the appointment is on the books. One click opens the record in Salesforce." }
    ]
  },

  // 20 · Page 21 — Patient 360 Console · alerts + follow-up
  {
    phase: "PHASE 1 · Beat 1",
    beat: "Closed loop",
    title: "The loop closes in the record",
    time: "6:00",
    sections: [
      { label: "Do", kind: "do",
        text: "Return to the Patient 360 Console. Clinical Alerts now shows three Diabetes Type II glucose alerts. Activity Timeline shows: Glucose Follow-Up: Maria Gonzalez — upcoming Apr 13." },
      { label: "Say", kind: "say",
        text: "Back on Maria's record. The new alerts landed in Clinical Alerts. The appointment is on the timeline. From wearable spike to scheduled follow-up — in under 2 minutes, without anyone leaving Slack." },
      { label: "Direction", kind: "note",
        text: "This is the nirvana payoff. Pause. Let it land." }
    ]
  },

  // 21 · Page 22 — MuleSoft Exchange · Patient 360 MCP Server
  {
    phase: "PHASE 2 · Plumbing 1",
    beat: "MuleSoft + MCP",
    title: "APIs as MCP servers",
    time: "6:15",
    sections: [
      { label: "Persona", kind: "persona", text: "Speaker: Sue Siao" },
      { label: "Do", kind: "do",
        text: "MuleSoft Exchange · Agents & Tools. Patient 360 MCP Server, published by Sue Siao." },
      { label: "Say", kind: "say",
        text: "We don't just expose APIs anymore. We publish them as MCP servers — governed, versioned, discoverable. This one wraps the EHR. One catalog for every agent in the org." }
    ]
  },

  // 22 · Page 23 — Agentforce Registry · patient360mcp
  {
    phase: "PHASE 2 · Plumbing 1",
    beat: "Agentforce registry",
    title: "5 tools, registered, active",
    time: "6:30",
    sections: [
      { label: "Do", kind: "do",
        text: "Setup · Agentforce Registry · patient360mcp. Connection Active. Tools (5): get_patient_record · get_medication_list · flag_clinical_alert · get_glucose_readings · update_patient_record. update_patient_record input schema visible." },
      { label: "Say", kind: "say",
        text: "The agent sees these as actions. Five tools, with schemas. Agent-to-system, securely, through MCP. Going GA at TDX this week." },
      { label: "News value", kind: "note",
        text: "MCP GA callout — that's the TDX news." }
    ]
  },

  // 23 · Page 24 — Patient 360 MCP Server documentation
  {
    phase: "PHASE 2 · Plumbing 1",
    beat: "Self-documenting",
    title: "Bridge · AI ↔ EHR",
    time: "6:45",
    sections: [
      { label: "Say", kind: "say",
        text: "Every tool is self-documenting. get_patient_record returns demographics, conditions, medications, allergies, vitals, care team, insurance — the full clinical view, accessible to any MCP-capable agent, one call." }
    ]
  },

  // 24 · Page 25 — P360 Overview dashboard + Analytics & Visualization agent
  {
    phase: "PHASE 2 · Plumbing 4a",
    beat: "Tableau + agent",
    title: "Grounded analytics — CSAT by category",
    time: "7:00 · 1 min",
    sections: [
      { label: "Persona", kind: "persona", text: "Speakers: John Demby & Caitlyn Anderson" },
      { label: "Do", kind: "do",
        text: "P360 Overview dashboard. Analytics & Visualization agent in side panel: 'show a graph of CSAT by category.' Agent returns Home Health 3.6, Ambulatory 2.3, with cited Patient 360 semantic model." },
      { label: "Say", kind: "say",
        text: "Ask it in natural language — 'CSAT by category.' The agent grounds against the Patient 360 semantic model and returns a chart the clinical team certified. Not a hallucination. Not a database field name. A metric with a definition." }
    ]
  },

  // 25 · Page 26 — Semantic Model Builder · Patient 360
  {
    phase: "PHASE 2 · Plumbing 4a",
    beat: "Semantic model",
    title: "Metrics defined once, governed everywhere",
    time: "7:30",
    sections: [
      { label: "Do", kind: "do",
        text: "Semantic Model Builder · Patient 360. Objects: Clinical Encounter, Account, Account Contact. Metrics: % Emergency Admissions, Encounter Duration, Finished Clinical Encounters, No-Show Rate, Patient CSAT, Total Clinical Encounters." },
      { label: "Say", kind: "say",
        text: "This is where that definition lives. Six governed metrics, three data objects, one model. Tableau uses it. The agent uses it. The dashboards use it. Change a definition once — every surface updates." }
    ]
  },

  // 26 · Page 27 — Data Cloud Segment · High Risk Trial Group · D360 Agent
  {
    phase: "PHASE 2 · Plumbing 3",
    beat: "Data 360 agent",
    title: "Agent-authored segment · 16,735 patients",
    time: "8:00",
    sections: [
      { label: "Persona", kind: "persona", text: "Speaker: April Moon" },
      { label: "Do", kind: "do",
        text: "Data Cloud · Segment · High Risk Trial Group. D360 Agent composes rules: Birth Date before 1971-04-01 · Clinical Encounter Count ≥ 1 · Start Date last 30 days. Segment population: 16,735. Status: Active." },
      { label: "Say", kind: "say",
        text: "'Create segment rules for patients over 55 with recent clinical visits.' The agent writes the rules. 16,735 patients — live, not last month's export. Segment updates the moment any profile changes." },
      { label: "Critical", kind: "note",
        text: "USE THE D360 AGENT for segmentation — not the manual builder. That's the differentiating moment." }
    ]
  },

  // 27 · Page 28 — Preference Builder · consent
  {
    phase: "PHASE 2 · Plumbing 4b",
    beat: "Consent",
    title: "Consent, per channel, per purpose",
    time: "8:15",
    sections: [
      { label: "Persona", kind: "persona", text: "Speaker: Sadhana Nandakumar" },
      { label: "Do", kind: "do",
        text: "Preference Builder · Patient Health Data Processing Consent V1. Three purposes: Cross-System Record Matching & Unification · Clinical Document Processing & Extraction · AI-Assisted Care Recommendations. Per-channel checkboxes (Address, Email, Phone) for each." },
      { label: "Say", kind: "say",
        text: "Consent isn't a binary opt-in. It's per channel, per purpose. The patient says yes to matching, yes to document extraction, maybe to AI-assisted care — and that map travels with every downstream decision." }
    ]
  },

  // 28 · Page 29 — Data Cloud · Data Governance · Tags · Healthcare Data.PHI
  {
    phase: "PHASE 2 · Plumbing 4b",
    beat: "Tags · classifications",
    title: "PHI · 6 objects · 72 fields · 1 tag",
    time: "8:30",
    sections: [
      { label: "Do", kind: "do",
        text: "Data Cloud · Data Governance · Tags. Healthcare Data.PHI — classifications GDPR, HIPAA, PII, Restricted. Used in 6 objects, 72 fields: Clinical Alert, Clinical Encounter, GlucoseMonitorEvent, RT_IndividualDG." },
      { label: "Say", kind: "say",
        text: "One tag. 72 fields. Every downstream tool — agent, dashboard, segment — inherits the classification. You cannot accidentally use data you are not allowed to use." }
    ]
  },

  // 29 · Page 30 — Salesforce Shield · Platform Encryption
  {
    phase: "PHASE 2 · Plumbing 4b",
    beat: "Trust foundation",
    title: "Shield · Platform Encryption",
    time: "8:45",
    sections: [
      { label: "Do", kind: "do",
        text: "Shield · Platform Encryption. Encrypt fields, files, attachments, search indexes. Key management · encryption statistics · audit trail." },
      { label: "Say", kind: "say",
        text: "Encryption at rest, across every layer. Bring-your-own-key. Event monitoring. Audit trail. Trust isn't a bolted-on appliance — it's the floor the platform stands on." }
    ]
  },

  // 30 · Page 31 — Section divider · Data 360 Agent + Analytics Agent
  {
    phase: "PHASE 3 · Close",
    beat: "Recap",
    title: "Extending Data 360 Agent & Analytics Agent",
    time: "9:00",
    sections: [
      { label: "Say", kind: "say",
        text: "Everything we just walked — one platform, connected, trusted, governed, understood, activated, acted on. Questions at the campground. #tdx26-data360-campground." },
      { label: "Direction", kind: "note",
        text: "Slow down. Say the arc. This is the soundbite." }
    ]
  },

  // 31 · Page 32 — Thank you
  {
    phase: "Close",
    beat: "Thanks",
    title: "Thank you",
    time: "10:00",
    sections: [
      { label: "Note", kind: "note",
        text: "Applause beat. Desiree closes. Staffers hand out the PDF link / QR card to anyone lingering at the campground." }
    ]
  },

  // 32 · Page 33 — MeshMesh
  {
    phase: "Bonus",
    beat: "Behind the scenes",
    title: "MeshMesh — patient record & related objects",
    time: "After session",
    sections: [
      { label: "Note", kind: "note",
        text: "MeshMesh lets us explore the patient record page and every related object in one surface. Used during build to verify the Data 360 schema before wiring it to the agent." }
    ]
  }
];
