import type { ProviderConfig, ProviderId, ProviderModel, UsageMetric } from "@/types/workspace";

export const baseProviderCatalog: ProviderConfig[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "High-quality general reasoning, vision, and structured output.",
    enabled: true,
    configured: Boolean(process.env.OPENAI_API_KEY),
    status: process.env.OPENAI_API_KEY ? "healthy" : "disabled",
    monthlyTokenLimit: 12_000_000,
    usedTokens: 0,
    warningThresholds: [50, 75, 90]
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "Long-context research, multimodal reasoning, and fast drafts.",
    enabled: true,
    configured: Boolean(process.env.GEMINI_API_KEY),
    status: process.env.GEMINI_API_KEY ? "healthy" : "disabled",
    monthlyTokenLimit: 10_000_000,
    usedTokens: 0,
    warningThresholds: [50, 75, 90]
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Careful analysis, writing, code review, and long conversations.",
    enabled: true,
    configured: Boolean(process.env.ANTHROPIC_API_KEY),
    status: process.env.ANTHROPIC_API_KEY ? "healthy" : "disabled",
    monthlyTokenLimit: 8_000_000,
    usedTokens: 0,
    warningThresholds: [50, 75, 90]
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Provider failover and broad model access through one key.",
    enabled: true,
    configured: Boolean(process.env.OPENROUTER_API_KEY),
    status: process.env.OPENROUTER_API_KEY ? "healthy" : "disabled",
    monthlyTokenLimit: 6_000_000,
    usedTokens: 0,
    warningThresholds: [50, 75, 90]
  },
  {
    id: "local",
    name: "Local models",
    description: "Future-ready local model adapter for private deployments.",
    enabled: false,
    configured: false,
    status: "disabled",
    monthlyTokenLimit: 0,
    usedTokens: 0,
    warningThresholds: [50, 75, 90]
  }
];

export const providerCatalog = baseProviderCatalog;

export const modelCatalog: ProviderModel[] = [
  {
    id: "gpt-4.1",
    provider: "openai",
    name: "GPT-4.1",
    contextWindow: 1_000_000,
    inputCostPerMillion: 2,
    outputCostPerMillion: 8,
    strengths: ["general", "coding", "vision", "long-context"],
    supportsImages: true
  },
  {
    id: "gemini-2.0-flash",
    provider: "gemini",
    name: "Gemini 2.0 Flash",
    contextWindow: 1_000_000,
    inputCostPerMillion: 0.1,
    outputCostPerMillion: 0.4,
    strengths: ["fast", "cheap", "vision", "long-context"],
    supportsImages: true
  },
  {
    id: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    name: "Claude 3.5 Sonnet",
    contextWindow: 200_000,
    inputCostPerMillion: 3,
    outputCostPerMillion: 15,
    strengths: ["general", "coding", "long-context"],
    supportsImages: true
  },
  {
    id: "openrouter/auto",
    provider: "openrouter",
    name: "OpenRouter Auto",
    contextWindow: 128_000,
    inputCostPerMillion: 0.4,
    outputCostPerMillion: 1.2,
    strengths: ["general", "cheap", "fast"],
    supportsImages: true
  },
  {
    id: "local/qwen-coder",
    provider: "local",
    name: "Qwen Coder Local",
    contextWindow: 32_000,
    inputCostPerMillion: 0,
    outputCostPerMillion: 0,
    strengths: ["coding", "cheap"],
    supportsImages: false
  }
];

export const usageMetrics: UsageMetric[] = providerCatalog.map((provider) => ({
  provider: provider.id,
  requests: provider.id === "local" ? 0 : Math.round(provider.usedTokens / 1800),
  inputTokens: Math.round(provider.usedTokens * 0.62),
  outputTokens: Math.round(provider.usedTokens * 0.38),
  estimatedCost: estimateProviderCost(provider.id, provider.usedTokens),
  errorRate: provider.status === "degraded" ? 4.8 : provider.status === "disabled" ? 0 : 0.9,
  p95LatencyMs: provider.id === "gemini" ? 920 : provider.id === "anthropic" ? 1540 : 1180
}));

function estimateProviderCost(provider: ProviderId, tokens: number) {
  const model = modelCatalog.find((item) => item.provider === provider);
  if (!model) return 0;
  const input = tokens * 0.62 * (model.inputCostPerMillion / 1_000_000);
  const output = tokens * 0.38 * (model.outputCostPerMillion / 1_000_000);
  return Number((input + output).toFixed(2));
}
