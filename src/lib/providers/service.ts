import "server-only";

import { baseProviderCatalog, usageMetrics } from "@/lib/providers/catalog";
import { hasLocalApiKey, isLocalProviderEnabled, localMonthlyLimit } from "@/lib/local/key-store";

export function getServerProviders() {
  return baseProviderCatalog.map((provider) => {
    const configured = hasLocalApiKey(provider.id);
    const enabled = isLocalProviderEnabled(provider.id, provider.enabled);
    return {
      ...provider,
      enabled,
      configured,
      status: configured && enabled ? ("healthy" as const) : ("disabled" as const),
      monthlyTokenLimit: localMonthlyLimit(provider.id, provider.monthlyTokenLimit)
    };
  });
}

export function getServerUsageMetrics() {
  const providers = getServerProviders();
  return usageMetrics.map((metric) => {
    const provider = providers.find((item) => item.id === metric.provider);
    return provider?.configured ? metric : { ...metric, requests: 0, inputTokens: 0, outputTokens: 0, estimatedCost: 0, errorRate: 0 };
  });
}
