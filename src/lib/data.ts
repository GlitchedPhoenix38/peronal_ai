import type { Conversation } from "@/types/workspace";

export const conversations: Conversation[] = [
  {
    id: "c-101",
    title: "Launch pricing model",
    folder: "Product",
    pinned: true,
    updatedAt: "Today, 11:42",
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    messages: [
      {
        id: "m-1",
        role: "user",
        content: "Compare a usage-based pricing model with a seat-based model for our AI workspace.",
        createdAt: "11:34"
      },
      {
        id: "m-2",
        role: "assistant",
        provider: "anthropic",
        model: "claude-3-5-sonnet-20241022",
        content:
          "A hybrid model is the strongest launch path: seat pricing creates predictable revenue, while metered usage protects gross margin on expensive models.\n\n```ts\nconst plan = {\n  baseSeats: 5,\n  includedTokens: 20_000_000,\n  overage: 'provider-cost + 25%'\n};\n```\n\nFor teams, expose provider budgets and routing policies as admin controls instead of forcing a single pricing primitive.",
        createdAt: "11:36"
      }
    ]
  },
  {
    id: "c-102",
    title: "Debug upload pipeline",
    folder: "Engineering",
    pinned: false,
    updatedAt: "Yesterday",
    provider: "openai",
    model: "gpt-4.1",
    messages: []
  },
  {
    id: "c-103",
    title: "Customer discovery notes",
    folder: "Research",
    pinned: false,
    updatedAt: "Jun 4",
    provider: "gemini",
    model: "gemini-2.0-flash",
    messages: []
  },
  {
    id: "c-104",
    title: "SOC2 vendor review",
    folder: "Ops",
    pinned: true,
    updatedAt: "Jun 2",
    provider: "openrouter",
    model: "openrouter/auto",
    messages: []
  }
];
