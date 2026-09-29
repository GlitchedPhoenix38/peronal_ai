import { modelCatalog, providerCatalog } from "@/lib/providers/catalog";
import type { ProviderModel, RoutingDecision, RoutingMode } from "@/types/workspace";

export interface RouteRequest {
  mode: RoutingMode;
  manualModelId?: string;
  requiresImages?: boolean;
  estimatedTokens: number;
}

export function routeModel(request: RouteRequest): RoutingDecision {
  const enabledProviders = providerCatalog.filter((provider) => provider.enabled && provider.status !== "disabled");
  let candidates = modelCatalog.filter((model) =>
    enabledProviders.some((provider) => provider.id === model.provider)
  );

  if (request.requiresImages) {
    candidates = candidates.filter((model) => model.supportsImages);
  }

  candidates = candidates.filter((model) => model.contextWindow >= request.estimatedTokens);

  const appliedOptimizations = limitOptimizations(request.estimatedTokens);

  if (request.mode === "manual" && request.manualModelId) {
    const selectedModel = candidates.find((model) => model.id === request.manualModelId) ?? candidates[0];
    return {
      selectedModel,
      reason: `Manual mode selected ${selectedModel.name}.`,
      appliedOptimizations
    };
  }

  const selectedModel = rankCandidates(candidates, request.mode)[0] ?? modelCatalog[0];
  return {
    selectedModel,
    reason: reasonForMode(request.mode, selectedModel),
    appliedOptimizations,
    warning: providerWarning(selectedModel.provider)
  };
}

function rankCandidates(candidates: ProviderModel[], mode: RoutingMode) {
  return [...candidates].sort((a, b) => scoreModel(b, mode) - scoreModel(a, mode));
}

function scoreModel(model: ProviderModel, mode: RoutingMode) {
  const cheapScore = 20 - model.inputCostPerMillion - model.outputCostPerMillion;
  const contextScore = Math.min(model.contextWindow / 100_000, 10);
  const codingScore = model.strengths.includes("coding") ? 12 : 0;
  const fastScore = model.strengths.includes("fast") ? 5 : 0;

  if (mode === "cost-saving") return cheapScore + fastScore;
  if (mode === "coding") return codingScore + contextScore;
  if (mode === "long-context") return contextScore + codingScore / 2;
  return cheapScore / 3 + contextScore + codingScore + fastScore;
}

function reasonForMode(mode: RoutingMode, model: ProviderModel) {
  const reasons: Record<RoutingMode, string> = {
    manual: `Manual routing selected ${model.name}.`,
    smart: `${model.name} has the best blend of quality, speed, context, and current provider health.`,
    "cost-saving": `${model.name} is the cheapest capable enabled model for this request.`,
    coding: `${model.name} is preferred for code generation and repository-scale reasoning.`,
    "long-context": `${model.name} can preserve the largest conversation memory for this request.`
  };
  return reasons[mode];
}

function limitOptimizations(estimatedTokens: number) {
  const optimizations = ["shared memory layer rebuilt from durable messages"];
  if (estimatedTokens > 60_000) optimizations.push("older turns compressed into a short continuity summary");
  if (estimatedTokens > 120_000) optimizations.push("system prompt reduced to provider-neutral essentials");
  return optimizations;
}

function providerWarning(providerId: ProviderModel["provider"]) {
  const provider = providerCatalog.find((item) => item.id === providerId);
  if (!provider || provider.monthlyTokenLimit === 0) return undefined;
  const usage = (provider.usedTokens / provider.monthlyTokenLimit) * 100;
  const threshold = provider.warningThresholds.findLast((item) => usage >= item);
  return threshold ? `${provider.name} is above ${threshold}% of the configured monthly token limit.` : undefined;
}
