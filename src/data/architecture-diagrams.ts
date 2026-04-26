export const BUILD_FLOW_DIAGRAM = `
flowchart TD
    subgraph Inputs["Inputs"]
        PDF["PDF Presentation\\n(41 slides)"]
        SCRIPT["Speaker Script\\n(per-slide narrative,\\nstage directions, timing)"]
    end

    subgraph Design["Step 1 · Claude Design"]
        CD["Claude Design\\nclaude.ai/design"]
        PROTO["HTML Prototype\\n• deck-stage web component\\n• narrative overlay panel\\n• slide images"]
    end

    subgraph Code["Step 2 · Claude Code — React App"]
        CC["Claude Code\\nclaude.ai/code"]
        REACT["React 19 + TypeScript\\n• Vite 8 · Tailwind CSS v4\\n• deck-stage web component\\n• Narrative overlay\\n• Autoplay controls"]
        TTS["ElevenLabs TTS\\n• Cloned presenter voice\\n• Voice picker + sliders\\n• Server-side API proxy"]
    end

    subgraph Deploy["Step 3 · Claude Code — AWS Deployment"]
        DOCKER["Docker\\nMulti-stage image\\nNode 22 + Express"]
        ECR["Amazon ECR\\nus-west-2"]
        AR["AWS App Runner\\nHTTPS · Auto-scaling"]
    end

    subgraph Observe["Step 4 · Claude Code — Observability"]
        SAM["AWS SAM\\naws-logging-service"]
        LAMBDA["AWS Lambda\\nNode 22 · arm64"]
        CW["CloudWatch Logs\\n90-day retention"]
        SLACK["Slack #logs\\nPlay · Solution Guide · Kiosk\\n& voiceover failures"]
    end

    subgraph Agent["Step 5 · Claude Code — Claude Agent"]
        ASKCLAUDE["Solution Guide panel\\n• Slide-context Q&A\\n• Model selector\\n• Tiered system prompts"]
        KIOSK["Kiosk mode\\n• Full-screen booth Q&A\\n• Suggested questions\\n• New chat per visitor"]
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
    AR -->|"POST /log"| LAMBDA
    CC --> ASKCLAUDE
    CC --> KIOSK
    ASKCLAUDE -->|"SF Models API\\nor Claude Direct"| AR
    KIOSK -->|"SF Models API\\nor Claude Direct"| AR
`;

export const RUNTIME_DIAGRAM = `
flowchart LR
    subgraph Browser["User's Browser"]
        UI["React App\\n• Slide deck\\n• Solution Guide\\n• Kiosk mode"]
    end

    subgraph AppRunner["AWS App Runner"]
        EXPRESS["Express Server\\nport 8080"]
        ELPROXY["ElevenLabs Proxy\\nPOST /api/elevenlabs/tts"]
        CLPROXY["Claude Proxy\\nPOST /api/claude/chat\\nSSE stream"]
        SFPROXY["Salesforce Models Proxy\\nPOST /api/sf-models/chat\\nSimulated SSE"]
    end

    subgraph ElevenLabs["ElevenLabs"]
        ELAPI["TTS API\\nvoice synthesis"]
    end

    subgraph Anthropic["Anthropic"]
        CLAPI["Claude Direct\\nclaude-opus-4-7"]
    end

    subgraph SalesforceOrg["Salesforce Org"]
        OAUTH["OAuth 2.0\\nClient Credentials"]
        SFMODELS["Salesforce Models API\\n~15 models"]
    end

    subgraph Logging["AWS Logging Service"]
        APIGW["API Gateway\\nPOST /log"]
        LAMBDA["Lambda\\nmega-demo-logger"]
        CW["CloudWatch Logs"]
        LOGS["Slack #logs"]
    end

    UI -->|"serve app"| EXPRESS
    UI -->|"TTS request"| ELPROXY
    ELPROXY --> ELAPI
    ELAPI --> ELPROXY
    ELPROXY -->|"audio/mpeg"| UI
    UI -->|"Claude Direct"| CLPROXY
    CLPROXY --> CLAPI
    CLAPI -->|"SSE stream"| CLPROXY
    CLPROXY -->|"SSE"| UI
    UI -->|"SF model"| SFPROXY
    SFPROXY --> OAUTH
    OAUTH -->|"Bearer token"| SFPROXY
    SFPROXY --> SFMODELS
    SFMODELS --> SFPROXY
    SFPROXY -->|"simulated SSE"| UI
    UI -->|"play · guide · kiosk events"| APIGW
    APIGW --> LAMBDA
    LAMBDA --> CW
    LAMBDA --> LOGS
`;
