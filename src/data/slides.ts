export const SLIDE_LABELS = [
  'Title','Architecture','Data Trapped','Pillars','System of Context',
  'RT Events → Agent → Slack','Semantic Model → Tableau','Data 360 Agent → Segment','Document AI','Maria — Patient Profile',
  'Three Marias','Patient 360 Console','JSON Preview · RT Event','GlucoseMonitorEvent Flow','Handle GlucoseMonitorEvent',
  'Analyze & Create Slack Message','Care Agent · Care Management','Slack · #care-alerts','Slack · Confirm Appointment','Slack · Appointment Scheduled',
  'Patient 360 · Alerts + Follow-Up','MuleSoft Exchange','patient360mcp Registry','Patient 360 MCP Server · Docs','P360 Dashboard + Agent',
  'Semantic Model Builder','Segment · High Risk Trial','Consent · Preference Builder','Data Governance · PHI','Shield · Platform Encryption',
  'Extending Data 360 Agent','Thank you','MeshMesh',
];

export const DARK_SLIDES = new Set([1, 9, 31, 33]);

export const TOTAL_SLIDES = 33;

export const SPEAKER_NOTES = [
  "TDX '26 Data 360 Campground Super Demo. Nine speakers on the team — Desiree opens with the framing arc: nirvana first, then plumbing. TDX audience cares about plumbing more than business story.",
  "One platform. Any agent via MCP and A2A. Any app. Any data lake. Four systems — engagement, agency, work, context — stitched by the trust layer. This is the map before the healthcare story starts.",
  "AI requires data, but most of it sits trapped. Eighty percent goes unused. Thirty percent of the world's data comes from healthcare — and almost none of it speaks to each other.",
  "Trusted Enterprise Context — five pillars. One source of truth. Connected systems. Trusted data quality, privacy, governance. Activated across the enterprise. Enterprise-wide metadata catalog.",
  "Full architecture of what you're about to see. Every component on this diagram — wearable, MuleSoft, Data 360, Informatica, Tableau, Trusted Services, Agentforce, Slack. Thirty seconds. Point broadly.",
  "Real-time events flow: glucose monitor → MuleSoft ingestion → Data 360 real-time data graph → Agentforce agent → Slack alert and MCP action against the Patient 360 MCP server.",
  "Semantic model → Tableau Next and Analytics Agent. When the agent reasons, it's against a model the clinical team certified — not raw database fields. That's the grounding layer.",
  "Data 360 Agent generates segment rules from the real-time data graph. Activation flows into Marketing Cloud Next. Patient outreach as a downstream trigger.",
  "Section header: Document AI. Physician notes become queryable fields on the profile. This is the 'how did that outreach know about insulin cost?' reveal.",
  "Phase 1 Beat 0. Informatica Customer 360 — Maria Gonzalez patient profile open on the demo laptop. Maria's vitals visible. Audience reads the screen before you say anything.",
  "Source Records tab — the three Marias. Same patient, three spellings, two dates of birth, three IDs across Informatica, EHR, Epic, and EVA. Which Maria gets the bill?",
  "Patient 360 Console — the unified view. Clinical encounters, alerts, health conditions, care programs. Everything stitched together.",
  "JSON Preview — real-time view ON. GlucoseMonitorEvent arrives as a structured DMO record. Patient ID, blood sugar reading 236, level High, timestamp. Highlighted in red to show the live event.",
  "Flow Builder: TDX — GlucoseMonitorEvent V7. Automation Event-Triggered Flow. Handles the GlucoseMonitorEvent DMO. Condition: level contains High or Low. This is the trigger.",
  "Flow Builder: TDX — Handle GlucoseMonitorEvent V16. Debug run completed. Send Glucose Event to Care Agent. Fault → Analyze & Send Glucose Event Slack Message subflow.",
  "Flow Builder: TDX — Analyze Glucose Event & Create Slack Message V2. Get Slack Channel ID → Generate Glucose Risk Alert Slack Message → Get Person Account → Get Condition Code → Create Patient Clinical Alert.",
  "Agentforce Builder: Care Agent. Care Management topic. Instructions: when a Glucose Monitor Event arrives, prioritize this topic, schedule follow-up visits. Actions: Analyze Glucose Event, Schedule Patient Appointment, update_patient_record.",
  "Slack — #care-alerts channel. High-Risk Glucose Alert for Maria Gonzalez. Latest reading 236 mg/dL, level High. 48-hour trend, dangerous spikes, no recent appointments. Recommended next steps. Jennifer asks the Care Agent to schedule follow-up.",
  "Slack thread — Care Agent confirmation. Reason, preferred date, patient ID. Confirm button. Human-in-the-loop.",
  "Slack DM with Slackbot. Jennifer: show scheduled appointments for Maria Gonzalez. Queried Salesforce. Glucose Follow-Up scheduled April 13. Contact card with Open in Salesforce action.",
  "Back to Patient 360 Console. Clinical Alerts panel now shows the Diabetes Type II glucose risk alerts. Upcoming: Glucose Follow-Up: Maria Gonzalez on April 13. Loop closed.",
  "MuleSoft Exchange — Agents & Tools. Patient 360 MCP Server published by Sue Siao. The API, repackaged as an MCP server.",
  "patient360mcp registered in the Agentforce Registry. Connection status Active. Five tools: get_patient_record, get_medication_list, flag_clinical_alert, get_glucose_readings, update_patient_record. With input schemas.",
  "Patient 360 MCP Server in Exchange. MCP Tools documentation. get_patient_record: demographics, conditions, medications, allergies, vitals, care team, insurance. update_patient_record: field-level updates.",
  "P360 Overview dashboard with Analytics & Visualization agent. CSAT by category: Home Health 3.6, Ambulatory 2.3. The agent reasons against the semantic model — not raw fields.",
  "Semantic Model Builder — Patient 360 model. Clinical Encounter, Account, Account Contact objects. Metrics: % Emergency Admissions, Encounter Duration, Finished Clinical Encounters, No-Show Rate, Patient CSAT, Total Clinical Encounters.",
  "Data Cloud Segment: High Risk Trial Group. 16,735 segment population. D360 Agent composed the rules: birth date before 1971, clinical encounter count ≥ 1, start date last 30 days. Live segment.",
  "Preference Builder — Patient Health Data Processing Consent Version 1. Cross-System Record Matching & Unification, Clinical Document Processing & Extraction, AI-Assisted Care Recommendations. Per-channel, per-purpose consent.",
  "Data Cloud Data Governance — Tags. Healthcare Data.PHI applied across 6 objects and 72 fields. Classifications: GDPR, HIPAA, PII, Restricted. Ethical AI Standards tag also present.",
  "Salesforce Shield — Platform Encryption. Encrypt standard and custom fields, files, attachments, search indexes. Key management, audit trail, event monitoring. This is the trust foundation.",
  "Section divider — Data 360 Agent and Analytics Agent. Extending the story to analytics grounding.",
  "Thank you. Applause beat. Staffers hand out the link card to anyone lingering.",
  "MeshMesh — patient record page and related objects explored in one surface during build. Used to verify the Data 360 schema before wiring it to the agent.",
];
