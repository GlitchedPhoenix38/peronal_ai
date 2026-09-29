export type ProviderId = "openai" | "gemini" | "anthropic" | "openrouter" | "local";

export type RoutingMode =
  | "manual"
  | "smart"
  | "cost-saving"
  | "coding"
  | "long-context";

export type ProviderStatus = "healthy" | "degraded" | "limited" | "disabled";

export type AttachmentKind = "image" | "file";

export type ChatRole = "system" | "user" | "assistant";

export interface ProviderModel {
  id: string;
  provider: ProviderId;
  name: string;
  contextWindow: number;
  inputCostPerMillion: number;
  outputCostPerMillion: number;
  strengths: Array<"general" | "coding" | "vision" | "long-context" | "fast" | "cheap">;
  supportsImages: boolean;
}

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  description: string;
  enabled: boolean;
  configured: boolean;
  status: ProviderStatus;
  monthlyTokenLimit: number;
  usedTokens: number;
  warningThresholds: number[];
}

export interface Attachment {
  id: string;
  kind: AttachmentKind;
  name: string;
  size: string;
  url: string;
}

export interface Message {
  id: string;
  role: ChatRole;
  provider?: ProviderId;
  model?: string;
  content: string;
  createdAt: string;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  title: string;
  folder: string;
  pinned: boolean;
  updatedAt: string;
  provider: ProviderId;
  model: string;
  messages: Message[];
}

export interface UsageMetric {
  provider: ProviderId;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  errorRate: number;
  p95LatencyMs: number;
}

export interface RoutingDecision {
  selectedModel: ProviderModel;
  reason: string;
  appliedOptimizations: string[];
  warning?: string;
}
