# TDX '26 — System of Context Mega Demo

An interactive slide deck web app for the TDX '26 Data 360 Campground Super Demo, built entirely with Claude's AI toolchain and deployed to AWS.

## What this project demonstrates

This project showcases a workflow that takes a static presentation and transforms it into a fully interactive, narrated web application — using **Claude Design** for visual prototyping and **Claude Code** for implementation and deployment.

### The build process

1. **Presentation to interactive prototype (Claude Design)**
   - Started with an existing 33-slide PDF presentation covering the TDX '26 System of Context demo — a healthcare scenario showing real-time glucose monitoring, Agentforce agents, MCP servers, and governed patient data across Salesforce, Informatica, MuleSoft, and Tableau.
   - Uploaded the PDF to [Claude Design](https://claude.ai/design) along with the speaker use case document containing per-slide narrative scripts, stage directions, timing cues, and speaker assignments.
   - Claude Design merged these inputs into an HTML slide show with a `<deck-stage>` web component (keyboard/tap navigation, auto-scaling, print layout) and a floating narrative overlay panel showing phase, beat, speaker lines, and stage directions for each slide.
   - Exported the result as a handoff bundle (HTML, CSS, JS, rendered slide images, and a README for coding agents).

2. **Prototype to production React app (Claude Code)**
   - Brought the Claude Design handoff bundle into Claude Code, which read the README and all source files to understand the prototype's structure.
   - Recreated the design in React 19 + TypeScript + Tailwind CSS v4, keeping the `<deck-stage>` web component and converting the narrative overlay into a React component with structured TypeScript data.
   - Added **autoplay controls** with adjustable timing (1s–30s per slide) and play/pause.
   - Added **text-to-speech voiceover** using the Web Speech API — reads the "say" sections from the narrative data aloud on each slide. Includes a voice picker with all available system voices, speed/pitch sliders, and preview. When voiceover is active, slides auto-advance when speech finishes rather than on a fixed timer.
   - The voiceover system uses a pluggable provider interface, designed to be swapped to ElevenLabs or another TTS service for higher-quality voices.

3. **Containerized deployment to AWS (Claude Code)**
   - Packaged the app in a multi-stage Docker image (Node 22 build + nginx serving the static output on port 8080).
   - Pushed the image to Amazon ECR and deployed to AWS App Runner with HTTPS, auto-scaling, and a public URL — all from the CLI without leaving the conversation.

## Tech stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, React Router v7
- **Slide engine**: `<deck-stage>` custom element — keyboard/tap navigation, viewport scaling, localStorage persistence, print layout
- **Voiceover**: Web Speech API with pluggable provider interface (browser TTS now, ElevenLabs-ready)
- **Deployment**: Docker (nginx-alpine), Amazon ECR, AWS App Runner

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
| `V` | Toggle voiceover |

## Deploying

```bash
# Build and push container
docker build --platform linux/amd64 -t mega-demo .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag mega-demo:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/mega-demo:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/mega-demo:latest

# Trigger App Runner redeployment
aws apprunner start-deployment --service-arn <service-arn> --region us-east-1
```

## Tools used

- [Claude Design](https://claude.ai/design) — visual prototyping and handoff bundle generation
- [Claude Code](https://claude.ai/code) — implementation, iteration, and deployment
