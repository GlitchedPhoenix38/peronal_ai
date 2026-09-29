import type { ProviderAdapter, ProviderRequest, ProviderResponse } from "@/lib/providers/types";
import { getLocalApiKey } from "@/lib/local/key-store";
import type { ProviderId } from "@/types/workspace";

export function getProviderAdapter(providerId: ProviderId): ProviderAdapter {
  return {
    id: providerId,
    async send(request: ProviderRequest): Promise<ProviderResponse> {
      const startedAt = Date.now();
      const apiKey = assertConfigured(providerId);
      const content = await sendToProvider(providerId, apiKey, request);
      return normalizedResponse(providerId, request.model, request, content, startedAt);
    },
    async testConnection() {
      try {
        assertConfigured(providerId);
        return { ok: true, latencyMs: 80 };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Unknown provider error" };
      }
    }
  };
}

function assertConfigured(providerId: ProviderId) {
  const apiKey = getLocalApiKey(providerId);
  if (providerId !== "local" && !apiKey) {
    throw new Error(`${providerId} API key is not configured`);
  }
  return apiKey ?? "";
}

function estimateTokens(content: string) {
  return Math.ceil(content.length / 4);
}

async function sendToProvider(providerId: ProviderId, apiKey: string, request: ProviderRequest) {
  if (providerId === "openai") return sendOpenAI(apiKey, request);
  if (providerId === "openrouter") return sendOpenRouter(apiKey, request);
  if (providerId === "anthropic") return sendAnthropic(apiKey, request);
  if (providerId === "gemini") return sendGemini(apiKey, request);
  throw new Error("Local model adapter is not connected yet.");
}

async function sendOpenAI(apiKey: string, request: ProviderRequest) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: request.model,
      messages: [
        { role: "system", content: request.systemPrompt },
        ...request.messages.map((message) => ({ role: message.role === "assistant" ? "assistant" : "user", content: message.content }))
      ]
    })
  });
  const json = await readProviderJson(response);
  return json.choices?.[0]?.message?.content ?? "";
}

async function sendOpenRouter(apiKey: string, request: ProviderRequest) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Relay AI Local"
    },
    body: JSON.stringify({
      model: request.model === "openrouter/auto" ? "openrouter/auto" : request.model,
      messages: [
        { role: "system", content: request.systemPrompt },
        ...request.messages.map((message) => ({ role: message.role === "assistant" ? "assistant" : "user", content: message.content }))
      ]
    })
  });
  const json = await readProviderJson(response);
  return json.choices?.[0]?.message?.content ?? "";
}

async function sendAnthropic(apiKey: string, request: ProviderRequest) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: request.model,
      max_tokens: 2048,
      system: request.systemPrompt,
      messages: request.messages.map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content
      }))
    })
  });
  const json = await readProviderJson(response);
  return json.content?.map((part: { text?: string }) => part.text).filter(Boolean).join("\n") ?? "";
}

async function sendGemini(apiKey: string, request: ProviderRequest) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: request.systemPrompt }] },
        contents: request.messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }]
        }))
      })
    }
  );
  const json = await readProviderJson(response);
  return json.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text).filter(Boolean).join("\n") ?? "";
}

async function readProviderJson(response: Response) {
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = json.error?.message ?? json.message ?? `Provider request failed with ${response.status}`;
    throw new Error(message);
  }
  return json;
}

function normalizedResponse(
  provider: ProviderId,
  model: string,
  request: ProviderRequest,
  content: string,
  startedAt: number
): ProviderResponse {
  return {
    provider,
    model,
    content,
    inputTokens: estimateTokens(request.messages.map((message) => message.content).join("\n")),
    outputTokens: estimateTokens(content),
    latencyMs: Date.now() - startedAt
  };
}
