# TDX '26 — System of Context Mega Demo

An interactive, self-narrating slide deck web app for the TDX '26 Data 360 Campground Super Demo — built with AI tooling and deployed to AWS.

**Watch it live:** [bit.ly/tdx26-mega-demo](https://bit.ly/tdx26-mega-demo)

## Resources

| Resource | Link |
|----------|------|
| Live presentation | [bit.ly/tdx26-mega-demo](https://bit.ly/tdx26-mega-demo) |
| This repo (voice-over app) | [github.com/congmingwudi/tdx26-mega-demo](https://github.com/congmingwudi/tdx26-mega-demo) |
| Glucose monitor simulator | [github.com/congmingwudi/patient360-glucose-monitor](https://github.com/congmingwudi/patient360-glucose-monitor) |
| Presentation PDF | [TDX '26 - System of Context Mega Demo (April 2026).pdf](docs/TDX%20'26%20-%20System%20of%20Context%20Mega%20Demo%20(April%202026).pdf) |
| Created by Ryan Cox | [linkedin.com/in/tadryancox](https://linkedin.com/in/tadryancox) |

## What this project demonstrates

This project showcases a workflow that takes a static presentation and transforms it into a fully interactive, narrated web application — using **Claude Design** for visual prototyping and **Claude Code** for implementation and deployment.

### The build process

1. **Presentation to interactive prototype (Claude Design)**
   - Started with an existing PDF presentation covering the TDX '26 System of Context demo — a healthcare scenario showing real-time glucose monitoring, Agentforce agents, MCP servers, and governed patient data across Salesforce, Informatica, MuleSoft, and Tableau.
   - Uploaded the PDF to [Claude Design](https://claude.ai/design) along with the speaker use case document containing per-slide narrative scripts, stage directions, timing cues, and speaker assignments.
   - Claude Design merged these inputs into an HTML slide show with a `<deck-stage>` web component (keyboard/tap navigation, auto-scaling, print layout) and a floating narrative overlay panel showing phase, beat, speaker lines, and stage directions for each slide.
   - Exported the result as a handoff bundle (HTML, CSS, JS, rendered slide images, and a README for coding agents).

2. **Prototype to production React app (Claude Code)**
   - Brought the Claude Design handoff bundle into Claude Code, which read the README and all source files to understand the prototype's structure.
   - Recreated the design in React 19 + TypeScript + Tailwind CSS v4, keeping the `<deck-stage>` web component and converting the narrative overlay into a React component with structured TypeScript data.
   - Added **autoplay controls** with play/pause and mute/unmute.
   - Added **text-to-speech voiceover** powered by **ElevenLabs** — reads the "say" sections from the narrative data aloud on each slide using high-quality AI voices. The default voice is **"Ryan"**, a clone of the presenter's own voice, so the deck narrates itself in his voice. Users can choose from any voice in the ElevenLabs library via the built-in voice picker, with stability and clarity sliders for fine-tuning.
   - The ElevenLabs API key is kept server-side behind an Express proxy — it never reaches the browser. When voiceover is active, slides auto-advance when speech finishes rather than on a fixed timer.

3. **Containerized deployment to AWS (Claude Code)**
   - Packaged the app in a multi-stage Docker image (Node 22 build + Express server proxying the ElevenLabs API and serving the static frontend on port 8080).
   - Pushed the image to Amazon ECR and deployed to AWS App Runner with HTTPS, auto-scaling, and a public URL — all from the CLI without leaving the conversation.
   - The ElevenLabs API key is passed as an environment variable to the container at deploy time.

4. **Observability via serverless logging service (Claude Code)**
   - Built a companion AWS SAM project ([aws-logging-service](https://github.com/congmingwudi/aws-logging-service)) — a Lambda + API Gateway endpoint that receives structured log events from the app, writes them to CloudWatch Logs (90-day retention), and posts Slack notifications to a dedicated `#logs` channel.
   - The app sends a **play event** each time a user starts the presentation, and an event whenever **Solution Guide** or **Kiosk mode** is opened — each capturing browser, language, timezone, screen resolution, referrer, slide number, and slide title.
   - Any **voiceover failure** (ElevenLabs API error, quota exhaustion, audio playback blocked) is logged and posted to Slack in real time. The UI simultaneously disables the voice button and shows a "Voiceover unavailable · refresh to retry" banner so the presenter is never left wondering why narration stopped.

5. **Claude agent — Solution Guide panel + Kiosk mode (Claude Code)**
   - Added a **Solution Guide** chat drawer (press `C` or click the button in the control bar) — a streaming Q&A panel grounded in the current slide's narrative text plus the full presentation overview. The system prompt updates automatically as you navigate slides.
   - Added a **Kiosk mode** (`K`) — a full-screen Q&A overlay designed for conference booth self-serve, with suggested questions, a slide quick-jump menu, and a "New chat" button for resetting between visitors. The first suggested question is "How was this presentation itself built?" — prompting Claude to walk through the entire build story.
   - Both features include a **model selector** with ~15 models grouped by provider: Claude via Salesforce (Bedrock-hosted Claude 3.5/3.7/Sonnet 4.6), OpenAI models via Salesforce, Google models via Salesforce, Amazon Nova models via Salesforce, and Claude Direct (Anthropic API). The default is **Claude Sonnet 4.6 via Salesforce** (`sfdc_ai__DefaultBedrockAnthropicClaude46Sonnet`).
   - **Routing**: Salesforce model selections hit `POST /api/sf-models/chat` (Express proxy → Salesforce Models API via OAuth 2.0 Client Credentials), while Claude Direct hits `POST /api/claude/chat` (Anthropic SDK). All API keys and tokens stay server-side.
   - **Tiered system prompts for latency**: The Salesforce Models API processes input tokens at ~1ms/token with no prompt caching. Sending the full 43-slide narrative (~3,000 tokens) caused ~13s response times. For Salesforce models, a compact ~300-token system prompt is used instead (just the demo summary + current slide context), reducing latency to ~9s. Claude Direct receives the full narrative prompt and responds in 1–3s. The model selector resets the chat when switched so the correct prompt tier is always used.
   - **Simulated streaming for Salesforce models**: The Salesforce Models API returns a complete response (no SSE support). The proxy simulates progressive output by emitting 5 words at a time with a 12ms delay and explicit `res.flush()` calls, so the UI shows text appearing word-by-word rather than a blank wait followed by a wall of text.
   - **Logging**: Every time a user opens the Solution Guide or Kiosk, a log event is sent with browser details (user agent, language, timezone, screen resolution, referrer) and the current slide number and title — same richness as the play event.
   - A custom **slide 42 — "App Architecture · How It Was Built"** was added to the deck (before Resources). It is a fully React-rendered slide — no background image — showing the build flow (5 steps) and runtime architecture as live HTML/CSS diagrams.

## Presentation app — build flow

How the presentation web app was constructed, from raw inputs to deployed product:

```mermaid
flowchart TD
    subgraph Inputs["Inputs"]
        PDF["PDF Presentation\n(41 slides)"]
        SCRIPT["Speaker Script\n(per-slide narrative,\nstage directions, timing)"]
    end

    subgraph Design["Step 1 · Claude Design"]
        CD["Claude Design\nclaude.ai/design"]
        PROTO["HTML Prototype\n• deck-stage web component\n• narrative overlay panel\n• slide images"]
    end

    subgraph Code["Step 2 · Claude Code — React App"]
        CC["Claude Code\nclaude.ai/code"]
        REACT["React 19 + TypeScript\n• Vite 8 · Tailwind CSS v4\n• deck-stage web component\n• Narrative overlay\n• Autoplay controls"]
        TTS["ElevenLabs TTS\n• Cloned presenter voice\n• Voice picker + sliders\n• Server-side API proxy"]
    end

    subgraph Deploy["Step 3 · Claude Code — AWS Deployment"]
        DOCKER["Docker\nMulti-stage image\nNode 22 + Express"]
        ECR["Amazon ECR\nus-east-1"]
        AR["AWS App Runner\nHTTPS · Auto-scaling\nbit.ly/tdx26-mega-demo"]
    end

    subgraph Observe["Step 4 · Claude Code — Observability"]
        SAM["AWS SAM\naws-logging-service"]
        LAMBDA["AWS Lambda\nNode 22 · arm64"]
        CW["CloudWatch Logs\n90-day retention"]
        SLACK["Slack #logs\nPlay · Solution Guide · Kiosk\n& voiceover failures"]
    end

    subgraph Agent["Step 5 · Claude Code — Claude Agent"]
        ASKCLAUDE["Solution Guide panel\n• Slide-context Q&A\n• Model selector\n• Tiered system prompts"]
        KIOSK["Kiosk mode\n• Full-screen booth Q&A\n• Suggested questions\n• New chat per visitor"]
        ARCHSLIDE["Slide 42 — App Architecture\n• Custom React-rendered slide\n• Build + runtime diagrams"]
        MODSEL["Model Selector\n• ~15 models grouped by provider\n• Claude via Salesforce (default)\n• Claude Direct (Anthropic API)"]
    end

    PDF --> CD
    SCRIPT --> CD
    CD --> PROTO
    PROTO --> CC
    CC --> REACT
    CC --> TTS
    REACT --> DOCKER
    TTS --> DOCKER
    DOCKER --> ECR
    ECR --> AR
    CC --> SAM
    SAM --> LAMBDA
    LAMBDA --> CW
    LAMBDA --> SLACK
    AR -->|"POST /log\nplay · Solution Guide · Kiosk\n+ browser + slide detail"| LAMBDA
    CC --> ASKCLAUDE
    CC --> KIOSK
    CC --> ARCHSLIDE
    CC --> MODSEL
    ASKCLAUDE -->|"POST /api/sf-models/chat\nor /api/claude/chat"| AR
    KIOSK -->|"POST /api/sf-models/chat\nor /api/claude/chat"| AR
```

## Presentation app — runtime architecture

How the deployed app handles a user session end-to-end:

```mermaid
flowchart LR
    subgraph Browser["User's Browser"]
        UI["React App\n• Slide deck · Narrative overlay\n• Autoplay controls\n• Solution Guide panel\n• Kiosk mode · Model selector"]
    end

    subgraph AppRunner["AWS App Runner · us-west-2"]
        EXPRESS["Express Server\nport 8080"]
        STATIC["Static Assets\ndist/ (React build +\nslide images)"]
        ELPROXY["ElevenLabs Proxy\nPOST /api/elevenlabs/tts\nAPI key never leaves server"]
        CLPROXY["Claude Proxy\nPOST /api/claude/chat\nSSE stream · key never leaves server"]
        SFPROXY["Salesforce Models Proxy\nPOST /api/sf-models/chat\nOAuth token cached server-side\nSimulated SSE (word-chunked)"]
    end

    subgraph ElevenLabs["ElevenLabs"]
        ELAPI["TTS API\nvoice synthesis"]
    end

    subgraph Anthropic["Anthropic"]
        CLAPI["Claude Direct\nclaude-opus-4-7\nstreaming · full system prompt"]
    end

    subgraph SalesforceOrg["Salesforce Org (same org as the demo)"]
        OAUTH["OAuth 2.0\nClient Credentials\n/services/oauth2/token"]
        SFMODELS["Salesforce Models API\napi.salesforce.com/einstein/platform/v1\n~15 models: Claude · GPT · Gemini · Nova\nCompact system prompt → lower latency"]
    end

    subgraph LoggingService["AWS Logging Service · us-west-2"]
        APIGW["API Gateway\nPOST /log\nX-Api-Key auth"]
        LAMBDA["Lambda\nmega-demo-logger\nNode 22 · arm64"]
        CW["CloudWatch Logs\n/aws/lambda/mega-demo-logger\n90-day retention"]
    end

    subgraph Slack["Slack"]
        LOGS["#logs channel\nPlay · Solution Guide · Kiosk\n& voiceover failures"]
    end

    UI -->|"serve app"| EXPRESS
    EXPRESS --> STATIC
    UI -->|"TTS request\n(slide narration)"| ELPROXY
    ELPROXY -->|"xi-api-key header"| ELAPI
    ELAPI -->|"audio/mpeg"| ELPROXY
    ELPROXY -->|"audio blob"| UI
    UI -->|"chat message\n(Claude Direct)"| CLPROXY
    CLPROXY -->|"x-api-key header"| CLAPI
    CLAPI -->|"SSE text chunks"| CLPROXY
    CLPROXY -->|"SSE stream"| UI
    UI -->|"chat message\n(Salesforce model)"| SFPROXY
    SFPROXY -->|"client_credentials grant"| OAUTH
    OAUTH -->|"Bearer token\n(cached 29 min)"| SFPROXY
    SFPROXY -->|"Bearer token\ncompact system prompt"| SFMODELS
    SFMODELS -->|"full JSON response\n(no native SSE)"| SFPROXY
    SFPROXY -->|"simulated SSE\n5 words / 12ms"| UI
    UI -->|"play · Solution Guide · Kiosk\n+ browser + slide detail"| APIGW
    UI -->|"voiceover error\n+ HTTP status"| APIGW
    APIGW --> LAMBDA
    LAMBDA --> CW
    LAMBDA -->|"Slack webhook"| LOGS
```

## Solution architecture

The demo walks through a healthcare scenario where a patient's glucose monitor triggers an end-to-end workflow across multiple Salesforce and partner systems.

### System of Context Platform

The full platform view — source systems (EHR, pharmacy, wearables) flow through MuleSoft, Informatica MDM, Data 360, and Tableau Next into Agentforce and Slack. Trusted Services provide the governance foundation.

![System of Context Platform](docs/arch1.png)

### Real-Time Events — Care Agent Flow

Glucose monitor events stream through Data 360's real-time data graph into the Care Agent, which generates Slack alerts, schedules appointments, and updates the EHR via the Patient 360 MCP Server.

![Care Agent Flow](docs/arch2.png)

### Semantic Model — Analytics Agent Flow

Data 360's semantic model grounds Tableau Next dashboards and the Analytics Agent, ensuring agent responses are based on clinically certified metric definitions rather than raw database fields.

![Analytics Agent Flow](docs/arch3.png)

### Data 360 Agent — Segmentation & Activation Flow

The Data 360 Agent composes segment rules from the real-time data graph. Segments feed Marketing Cloud Next for activation-triggered patient outreach.

![Segmentation & Activation Flow](docs/arch4.png)

## Demo tech stack (Salesforce + partners)

The healthcare scenario showcased in the presentation runs on:

- **Salesforce Platform** — Health Cloud Patient 360 Console, Flow Builder, Shield Platform Encryption, Privacy Center
- **Agentforce** — Care Agent with Agent Script, Agentforce Builder, Agentforce Registry with MCP client support
- **Data 360** — Real-Time Data Graph, Data Model Objects, Data Governance (PHI/HIPAA tagging), Semantic Model Builder, D360 Agent for segmentation
- **Slack** — #care-alerts channel, Care Agent conversational actions, Slackbot cross-system queries, human-in-the-loop approval
- **Tableau Next** — Patient 360 dashboards grounded by semantic models, Analytics & Visualization Agent
- **Marketing Cloud Next** — Activation-triggered patient outreach flows driven by Data 360 segments
- **MuleSoft** — Patient 360 MCP Server published on MuleSoft Exchange, providing governed tools (get_patient_record, update_patient_record, etc.) to Agentforce agents
- **Informatica** — Customer 360 MDM for patient golden record resolution across EHR, Epic, IQVIA, and other source systems

## Presentation app tech stack

The voice-over web app itself is built with:

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, React Router v7
- **Slide engine**: `<deck-stage>` custom element — keyboard/tap navigation, viewport scaling, localStorage persistence, print layout
- **Voiceover**: ElevenLabs TTS API via server-side Express proxy, with presenter's cloned voice as default
- **Claude agent**: Anthropic SDK (`@anthropic-ai/sdk`), `claude-opus-4-7`, streaming SSE via server-side Express proxy (`/api/claude/chat`)
- **Salesforce Models API**: OAuth 2.0 Client Credentials → Bearer token (cached 29 min) → `api.salesforce.com/einstein/platform/v1/models/{id}/chat-generations` via Express proxy (`/api/sf-models/chat`); simulated SSE output since the API returns full JSON (no native streaming)
- **Deployment**: Docker (Node 22 + Express), Amazon ECR, AWS App Runner

## Running locally

```bash
npm install
npm run dev         # http://localhost:5173
```

Note: The rendered slide images (`public/rendered/page-*.jpg`) are not checked into git due to size. They are sourced from the Claude Design export bundle and must be present locally for the slides to display. The Docker build copies them from the local filesystem.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `←` `→` `Space` `PgUp` `PgDn` | Navigate slides |
| `Home` / `End` | First / last slide |
| `1`–`9`, `0` | Jump to slide 1–10 |
| `R` | Reset to slide 1 |
| `N` | Toggle narrative overlay |
| `M` | Mute / unmute voiceover |
| `C` | Toggle Solution Guide panel (slide-context Q&A) |
| `K` | Open kiosk mode (full-screen demo Q&A) |

## Deploying

```bash
# Build and push container (use a versioned tag — :latest is cached by App Runner)
TAG="v$(date +%Y%m%d-%H%M%S)"
docker build --platform linux/amd64 -t mega-demo .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 730335577398.dkr.ecr.us-east-1.amazonaws.com
docker tag mega-demo:latest 730335577398.dkr.ecr.us-east-1.amazonaws.com/mega-demo:$TAG
docker push 730335577398.dkr.ecr.us-east-1.amazonaws.com/mega-demo:$TAG

# Update App Runner to the new versioned image
aws apprunner update-service \
  --region us-east-1 \
  --service-arn arn:aws:apprunner:us-east-1:730335577398:service/mega-demo/1715cd08ce1248c4aced5d4fb4b98efd \
  --source-configuration "{\"ImageRepository\":{\"ImageIdentifier\":\"730335577398.dkr.ecr.us-east-1.amazonaws.com/mega-demo:$TAG\",\"ImageRepositoryType\":\"ECR\"}}"
```

The logging service is a separate SAM project — see [aws-logging-service](https://github.com/congmingwudi/aws-logging-service) for its own deploy instructions.

## AI tools used across the solution

This demo is itself a showcase of AI-assisted development. Every component — from the healthcare simulation to the presentation you're watching — was built or accelerated by AI tooling:

| Component | AI Tool | What it did |
|-----------|---------|-------------|
| **Glucose monitor simulator** | [Claude Code](https://claude.ai/code) | Built the real-time WebSocket app that streams glucose readings into the Data 360 Real-Time Data Graph |
| **Patient record page** | [MeshMesh](https://meshmesh.io) | Designed the Health Cloud patient record page and related objects in one visual surface, verifying the Data 360 schema before wiring it to agents |
| **Tableau dashboard data** | [Cursor](https://cursor.com) | Generated realistic healthcare data (patient encounters, CSAT scores, clinical metrics) shaped to match the semantic model |
| **Presentation web app** | [Claude Design](https://claude.ai/design) + [Claude Code](https://claude.ai/code) | Claude Design prototyped the slide deck with narrative overlay; Claude Code converted it to a React app with ElevenLabs voiceover, autoplay, and deployed it to AWS |
| **Voiceover narration** | [ElevenLabs](https://elevenlabs.io) | The default voice is a clone of the presenter's own voice — the demo literally narrates itself |
| **AWS deployment** | [Claude Code](https://claude.ai/code) | Dockerized the app, pushed to ECR, and deployed to App Runner — all from the CLI in conversation |
| **Logging & alerting** | [Claude Code](https://claude.ai/code) | Built a serverless Lambda logging API (SAM) that forwards play, Solution Guide, and Kiosk events (with browser + slide detail) and voiceover errors to CloudWatch and Slack `#logs` in real time |
| **Solution Guide + Kiosk mode** | [Claude Code](https://claude.ai/code) | Built a streaming slide-context Q&A panel and full-screen kiosk mode with a model selector supporting ~15 models via the Salesforce Models API (same org as the demo) and Claude Direct via Anthropic SDK — with tiered system prompts to manage token latency on the Salesforce path |
