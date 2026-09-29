import type { Attachment, Message, ProviderId } from "@/types/workspace";

export interface ProviderRequest {
  model: string;
  messages: Message[];
  attachments: Attachment[];
  systemPrompt: string;
}

export interface ProviderResponse {
  provider: ProviderId;
  model: string;
  content: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

export interface ProviderAdapter {
  id: ProviderId;
  send(request: ProviderRequest): Promise<ProviderResponse>;
  testConnection(): Promise<{ ok: boolean; latencyMs?: number; error?: string }>;
}
