import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createXai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { 
  customProvider, 
  wrapLanguageModel, 
  extractReasoningMiddleware 
} from "ai";

export interface ModelInfo {
  provider: string;
  name: string;
  description: string;
  apiVersion: string;
  capabilities: string[];
}

const middleware = extractReasoningMiddleware({
  tagName: 'think',
});

// Helper to get API keys from environment variables first, then localStorage
const getApiKey = (key: string): string | undefined => {
  // Check for environment variables first
  if (process.env[key]) {
    return process.env[key] || undefined;
  }
  
  // Fall back to localStorage if available
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key) || undefined;
  }
  
  return undefined;
};

// Create provider instances with API keys from localStorage
const openaiClient = createOpenAI({
  apiKey: getApiKey('OPENAI_API_KEY'),
});

const anthropicClient = createAnthropic({
  apiKey: getApiKey('ANTHROPIC_API_KEY'),
});

const groqClient = createGroq({
  apiKey: getApiKey('GROQ_API_KEY'),
});

const xaiClient = createXai({
  apiKey: getApiKey('XAI_API_KEY'),
});

const openrouterClient = createOpenRouter({
  apiKey: getApiKey('OPENROUTER_API_KEY'),
});

const languageModels = {
  "gpt-4.1-mini": openaiClient("gpt-4.1-mini"),
  "claude-3-7-sonnet": anthropicClient('claude-3-7-sonnet-20250219'),
  "qwen-qwq": wrapLanguageModel(
    {
      model: groqClient("qwen-qwq-32b"),
      middleware
    }
  ),
  "grok-3-mini": xaiClient("grok-3-mini-latest"),
  "openrouter-deepseek-chat-v3": openrouterClient("deepseek/deepseek-chat-v3-0324:free"),
  "openrouter-deepseek-r1": openrouterClient("deepseek/deepseek-r1:free"),
  "openrouter-gemini-flash": openrouterClient("google/gemini-2.0-flash-exp:free"),
  "openrouter-llama-4-maverick": openrouterClient("meta-llama/llama-4-maverick:free"),
};

export const modelDetails: Record<keyof typeof languageModels, ModelInfo> = {
  "gpt-4.1-mini": {
    provider: "OpenAI",
    name: "GPT-4.1 Mini",
    description: "Compact version of OpenAI's GPT-4.1 with good balance of capabilities, including vision.",
    apiVersion: "gpt-4.1-mini",
    capabilities: ["Balance", "Creative", "Vision"]
  },
  "claude-3-7-sonnet": {
    provider: "Anthropic",
    name: "Claude 3.7 Sonnet",
    description: "Latest version of Anthropic's Claude 3.7 Sonnet with strong reasoning and coding capabilities.",
    apiVersion: "claude-3-7-sonnet-20250219",
    capabilities: ["Reasoning", "Efficient", "Agentic"]
  },
  "qwen-qwq": {
    provider: "Groq",
    name: "Qwen QWQ",
    description: "Latest version of Alibaba's Qwen QWQ with strong reasoning and coding capabilities.",
    apiVersion: "qwen-qwq",
    capabilities: ["Reasoning", "Efficient", "Agentic"]
  },
  "grok-3-mini": {
    provider: "XAI",
    name: "Grok 3 Mini",
    description: "Latest version of XAI's Grok 3 Mini with strong reasoning and coding capabilities.",
    apiVersion: "grok-3-mini-latest",
    capabilities: ["Reasoning", "Efficient", "Agentic"]
  },
  "openrouter-deepseek-chat-v3": {
    provider: "OpenRouter",
    name: "DeepSeek Chat V3 (Free)",
    description: "DeepSeek's Chat V3 model via OpenRouter, strong at reasoning, coding, and general chat.",
    apiVersion: "deepseek/deepseek-chat-v3-0324:free",
    capabilities: ["Reasoning", "Coding", "General", "OpenRouter"]
  },
  "openrouter-deepseek-r1": {
    provider: "OpenRouter",
    name: "DeepSeek R1 (Free)",
    description: "DeepSeek's R1 model via OpenRouter, excels at research, reasoning, and creative tasks.",
    apiVersion: "deepseek/deepseek-r1:free",
    capabilities: ["Research", "Reasoning", "Creative", "OpenRouter"]
  },
  "openrouter-gemini-flash": {
    provider: "OpenRouter",
    name: "Gemini 2.0 Flash (Free)",
    description: "Google's Gemini 2.0 Flash experimental model via OpenRouter, fast and efficient for general and vision tasks.",
    apiVersion: "google/gemini-2.0-flash-exp:free",
    capabilities: ["Fast", "Efficient", "Vision", "General", "OpenRouter"]
  },
  "openrouter-llama-4-maverick": {
    provider: "OpenRouter",
    name: "Llama 4 Maverick (Free)",
    description: "Meta's Llama 4 Maverick model via OpenRouter, strong at reasoning, coding, and agentic tasks.",
    apiVersion: "meta-llama/llama-4-maverick:free",
    capabilities: ["Reasoning", "Coding", "Agentic", "OpenRouter"]
  },
};

// Update API keys when localStorage changes (for runtime updates)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    // Reload the page if any API key changed to refresh the providers
    if (event.key?.includes('API_KEY')) {
      window.location.reload();
    }
  });
}

export const model = customProvider({
  languageModels,
});

export type modelID = keyof typeof languageModels;

export const MODELS = Object.keys(languageModels);

export const defaultModel: modelID = "qwen-qwq";
