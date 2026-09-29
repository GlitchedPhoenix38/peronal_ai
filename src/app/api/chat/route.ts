import { getProviderAdapter } from "@/lib/providers/adapters";
import { modelCatalog } from "@/lib/providers/catalog";
import { getServerProviders } from "@/lib/providers/service";
import { routeModel } from "@/lib/routing/router";
import { rateLimit } from "@/lib/security/rate-limit";
import { chatRequestSchema } from "@/lib/security/validation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const limit = rateLimit(request.headers.get("x-forwarded-for") ?? "local");
  if (!limit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const payload = chatRequestSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Invalid chat request", details: payload.error.flatten() }, { status: 400 });
  }

  const decision = routeModel({
    mode: payload.data.routingMode,
    manualModelId: payload.data.modelId,
    estimatedTokens: estimateTokens(payload.data.message),
    requiresImages: payload.data.attachments.some((attachment) => attachment.kind === "image")
  });

  const providers = getServerProviders();
  const selectedProvider = providers.find((provider) => provider.id === decision.selectedModel.provider);
  if (!selectedProvider?.configured) {
    const fallbackProvider = providers.find((provider) => provider.configured && provider.enabled);
    const fallbackModel = modelCatalog.find((model) => model.provider === fallbackProvider?.id);
    if (!fallbackProvider || !fallbackModel) {
      return NextResponse.json(
        {
          error: "Provider not connected",
          decision,
          message: "No live AI request was sent because no enabled provider has a locally stored API key."
        },
        { status: 409 }
      );
    }
    decision.selectedModel = fallbackModel;
    decision.reason = `${fallbackProvider.name} was auto-detected from your local key store and selected for this request.`;
  }

  try {
    const adapter = getProviderAdapter(decision.selectedModel.provider);
    const response = await adapter.send({
      model: decision.selectedModel.id,
      systemPrompt: "You are a concise, practical assistant inside a local-first AI workspace.",
      attachments: payload.data.attachments,
      messages: [
        {
          id: crypto.randomUUID(),
          role: "user",
          content: payload.data.message,
          createdAt: new Date().toISOString(),
          attachments: payload.data.attachments
        }
      ]
    });

    return NextResponse.json({
      conversationId: payload.data.conversationId,
      decision,
      usage: {
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        latencyMs: response.latencyMs
      },
      message: {
        role: "assistant",
        provider: response.provider,
        model: response.model,
        content: response.content
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Provider request failed",
        decision,
        message: error instanceof Error ? error.message : "Unknown provider error"
      },
      { status: 502 }
    );
  }
}

function estimateTokens(content: string) {
  return Math.ceil(content.length / 4) + 2_000;
}
