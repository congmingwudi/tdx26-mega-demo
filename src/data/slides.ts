export const SLIDE_LABELS = [
  'Title',                                          // 1
  'Architecture',                                   // 2
  'Architecture · Context',                         // 3
  'Architecture · Work',                            // 4
  'Architecture · Agency',                          // 5
  'Architecture · Engagement',                      // 6
  'Data Trapped',                                   // 7
  'Pillars',                                        // 8
  'System of Context',                              // 9
  'RT Events → Agent → Slack',                      // 10
  'Document AI',                                    // 11
  'Semantic Model → Tableau',                       // 12
  'Data 360 Agent → Segment',                       // 13
  'Maria — Informatica Profile',                    // 14
  'Three Marias — Source Records',                  // 15
  'Patient 360 Console',                            // 16
  'Real-Time Data Graph',                           // 17
  'GlucoseMonitorEvent Flow',                       // 18
  'Glucose Event → Care Agent',                     // 19
  'Care Agent · Autonomous Assistant',              // 20
  'Agent Action → Slack Message',                   // 21
  'Slack · #care-alerts',                           // 22
  'Slack · Approve Care Plan',                      // 23
  'Slackbot → Health Cloud',                        // 24
  'Patient Record · Alerts + Appointments',         // 25
  'Care Agent → MCP Tools',                         // 26
  'Agentforce Registry · MCP',                      // 27
  'MuleSoft MCP Server · Docs',                     // 28
  'Tableau Next + Analytics Agent',                 // 29
  'Semantic Model Builder',                         // 30
  'D360 Agent → Segment Rules',                     // 31
  'Privacy Center · Consent',                       // 32
  'Data Governance · PHI',                          // 33
  'Shield · Encryption',                            // 34
  'Architecture Recap',                             // 35
  'Thank You',                                      // 36
  'How Was This Built?',                            // 37
  'Built With · Glucose Monitor',                   // 38
  'Built With · MeshMesh',                          // 39
  'Built With · Cursor',                            // 40
  'Built With · Claude Design + Code',              // 41
  'Resources',                                      // 42
];

export const DARK_SLIDES = new Set([1, 22, 23, 36, 37, 42]);

export const TOTAL_SLIDES = 42;

export const SPEAKER_NOTES = [
  "TDX '26 Data 360 Campground Mega Demo.",
  "Salesforce has the platforms, unified on one architecture, to bring the Agentic Enterprise to life.",
  "At the foundation is our system of context, powered by Data 360.",
  "Then, there's our system of work, the core Salesforce platform.",
  "Above that is our system of agency, Agentforce.",
  "And it all comes together in our system of engagement, Slack.",
  "AI requires reliable data — but most of it sits trapped.",
  "Trusted Enterprise Context — five pillars.",
  "This is the platform we're standing on for this system of context demo.",
  "Real-time events flow from glucose monitor through Data 360 to Agentforce and Slack.",
  "Document AI extracts structured data from unstructured clinical documents.",
  "Semantic model grounds Tableau Next and the Analytics Agent.",
  "Data 360 Agent generates segment rules for Marketing Cloud Next.",
  "Meet Maria Gonzalez — patient profile in Informatica Customer 360.",
  "Same patient, three spellings, five source records. Which Maria gets the bill?",
  "Patient 360 Console — the complete unified view in Health Cloud.",
  "Glucose monitor reading arrives in the Real-Time Data Graph in under 200 milliseconds.",
  "Automation event-triggered flow fires on high or low glucose readings.",
  "The flow passes the glucose event to the Care Agent with patient context.",
  "The Care Agent serves as an autonomous assistant to medical staff.",
  "An agent action generates a clinical care plan Slack message via a prompt template.",
  "The agent notifies care teams and physicians in Slack with a detailed glucose alert.",
  "Care teams use the Care Agent in Slack to review and approve the proposed care plan.",
  "Care teams can also use Slackbot to view patient data and launch into Health Cloud.",
  "Patient record in Health Cloud captures the glucose alerts and auto-scheduled appointments.",
  "The Care Agent updates patient records in EMR systems through MCP tools.",
  "Agentforce Registry surfaces MCP tools as native agent actions.",
  "MuleSoft provides secure, governed, and monitored MCP tools.",
  "Tableau Next dashboard and Analytics Agent served by semantic models.",
  "Semantic model on top of Data 360 data model with governed metrics.",
  "D360 Agent generates segment rules — 16,735 patients, live, not last month's export.",
  "Privacy Center captures per-channel, per-purpose consent for patient data processing.",
  "Data governance tags applied across all data in Data 360 — HIPAA, PHI, PII classifications.",
  "Salesforce Shield provides data encryption at every layer.",
  "The full Agentic Health Enterprise Architecture — one platform, four systems, trust at every layer.",
  "Thank you.",
  "How was this demo built? What role did AI play?",
  "The glucose monitor simulator was built with Claude Code.",
  "MeshMesh designed the patient record page and related Health Cloud objects.",
  "Health Cloud data for the Tableau Next dashboard was generated with Cursor.",
  "This presentation itself is a web app built with Claude Design and Claude Code, narrated by an ElevenLabs voice clone.",
  "Resources and links — the app, the repos, and the creator.",
];
