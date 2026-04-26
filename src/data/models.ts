export type ModelProvider = 'claude' | 'salesforce';

export interface ModelOption {
  id: string;               // value passed to the API
  label: string;            // display name
  provider: ModelProvider;
  group: string;            // group header in the dropdown
}

export const MODELS: ModelOption[] = [
  // ── Anthropic via Salesforce Models API (Amazon Bedrock) ───────────────────
  {
    id: 'sfdc_ai__DefaultBedrockAnthropicClaude46Sonnet',
    label: 'Claude Sonnet 4.6',
    provider: 'salesforce',
    group: 'Claude via Salesforce',
  },
  {
    id: 'sfdc_ai__DefaultBedrockAnthropicClaude45Sonnet',
    label: 'Claude Sonnet 4.5',
    provider: 'salesforce',
    group: 'Claude via Salesforce',
  },
  {
    id: 'sfdc_ai__DefaultBedrockAnthropicClaude4Sonnet',
    label: 'Claude Sonnet 4',
    provider: 'salesforce',
    group: 'Claude via Salesforce',
  },
  {
    id: 'sfdc_ai__DefaultBedrockAnthropicClaude45Opus',
    label: 'Claude Opus 4.5',
    provider: 'salesforce',
    group: 'Claude via Salesforce',
  },
  {
    id: 'sfdc_ai__DefaultBedrockAnthropicClaude45Haiku',
    label: 'Claude Haiku 4.5',
    provider: 'salesforce',
    group: 'Claude via Salesforce',
  },

  // ── OpenAI via Salesforce Models API ──────────────────────────────────────
  {
    id: 'sfdc_ai__DefaultGPT5',
    label: 'GPT-5',
    provider: 'salesforce',
    group: 'OpenAI via Salesforce',
  },
  {
    id: 'sfdc_ai__DefaultGPT4Omni',
    label: 'GPT-4o',
    provider: 'salesforce',
    group: 'OpenAI via Salesforce',
  },
  {
    id: 'sfdc_ai__DefaultGPT4OmniMini',
    label: 'GPT-4o mini',
    provider: 'salesforce',
    group: 'OpenAI via Salesforce',
  },
  {
    id: 'sfdc_ai__DefaultGPT41',
    label: 'GPT-4.1',
    provider: 'salesforce',
    group: 'OpenAI via Salesforce',
  },
  {
    id: 'sfdc_ai__DefaultGPT41Mini',
    label: 'GPT-4.1 Mini',
    provider: 'salesforce',
    group: 'OpenAI via Salesforce',
  },
  {
    id: 'sfdc_ai__DefaultO3',
    label: 'O3',
    provider: 'salesforce',
    group: 'OpenAI via Salesforce',
  },
  {
    id: 'sfdc_ai__DefaultO4Mini',
    label: 'O4 Mini',
    provider: 'salesforce',
    group: 'OpenAI via Salesforce',
  },

  // ── Google via Salesforce Models API ──────────────────────────────────────
  {
    id: 'sfdc_ai__DefaultVertexAIGemini25Flash001',
    label: 'Gemini 2.5 Flash',
    provider: 'salesforce',
    group: 'Google via Salesforce',
  },
  {
    id: 'sfdc_ai__DefaultVertexAIGeminiPro25',
    label: 'Gemini 2.5 Pro',
    provider: 'salesforce',
    group: 'Google via Salesforce',
  },
  {
    id: 'sfdc_ai__DefaultVertexAIGemini30Flash',
    label: 'Gemini 3 Flash',
    provider: 'salesforce',
    group: 'Google via Salesforce',
  },

  // ── Amazon via Salesforce Models API ──────────────────────────────────────
  {
    id: 'sfdc_ai__DefaultBedrockAmazonNovaPro',
    label: 'Amazon Nova Pro',
    provider: 'salesforce',
    group: 'Amazon via Salesforce',
  },
  {
    id: 'sfdc_ai__DefaultBedrockAmazonNovaLite',
    label: 'Amazon Nova Lite',
    provider: 'salesforce',
    group: 'Amazon via Salesforce',
  },

  // ── Direct Claude (Anthropic API) ──────────────────────────────────────────
  {
    id: 'claude-opus-4-7',
    label: 'Claude Opus 4.7',
    provider: 'claude',
    group: 'Claude (Direct)',
  },
  {
    id: 'claude-sonnet-4-6',
    label: 'Claude Sonnet 4.6',
    provider: 'claude',
    group: 'Claude (Direct)',
  },
  {
    id: 'claude-haiku-4-5',
    label: 'Claude Haiku 4.5',
    provider: 'claude',
    group: 'Claude (Direct)',
  },
];

export const DEFAULT_MODEL = MODELS.find(m => m.id === 'sfdc_ai__DefaultBedrockAnthropicClaude46Sonnet')!;

export function getModel(id: string): ModelOption {
  return MODELS.find(m => m.id === id) ?? DEFAULT_MODEL;
}
