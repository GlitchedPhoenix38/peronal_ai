import { z } from "zod";

export const chatRequestSchema = z.object({
  conversationId: z.string().min(1),
  message: z.string().min(1).max(24_000),
  routingMode: z.enum(["manual", "smart", "cost-saving", "coding", "long-context"]),
  modelId: z.string().optional(),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        kind: z.enum(["image", "file"]),
        name: z.string().max(160),
        size: z.string(),
        url: z.string()
      })
    )
    .max(8)
    .default([])
});

export const providerSettingsSchema = z.object({
  providerId: z.enum(["openai", "gemini", "anthropic", "openrouter", "local"]),
  enabled: z.boolean(),
  apiKey: z.string().min(12).optional(),
  monthlyTokenLimit: z.number().int().min(0).max(100_000_000)
});
