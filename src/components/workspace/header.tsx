import { modelCatalog, providerCatalog } from "@/lib/providers/catalog";
import { routeModel } from "@/lib/routing/router";
import { Bot, ChevronDown, CircleDollarSign, Code2, Gauge, Maximize2, Route } from "lucide-react";

const modes = [
  { id: "smart", label: "Smart", icon: Gauge },
  { id: "cost-saving", label: "Cost", icon: CircleDollarSign },
  { id: "coding", label: "Coding", icon: Code2 },
  { id: "long-context", label: "Long", icon: Maximize2 }
] as const;

export function WorkspaceHeader() {
  const decision = routeModel({ mode: "smart", estimatedTokens: 18_400, requiresImages: true });
  const provider = providerCatalog.find((item) => item.id === decision.selectedModel.provider);

  return (
    <header className="flex flex-col gap-3 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-[-0.01em] text-ink-900">Launch pricing model</h1>
            <button className="rounded-md p-1 text-ink-500 hover:bg-ink-100" aria-label="Conversation menu">
              <ChevronDown size={16} />
            </button>
          </div>
          <p className="text-sm text-ink-500">Shared memory active across {providerCatalog.filter((item) => item.enabled).length} providers</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <button className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink-900 shadow-sm">
            <Bot size={16} />
            {decision.selectedModel.name}
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-3 py-2 text-sm font-medium text-paper shadow-sm">
            <Route size={16} />
            Route
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {modes.map(({ id, label, icon: Icon }, index) => (
          <button
            key={id}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              index === 0 ? "bg-ink-900 text-paper" : "border border-line bg-white text-ink-600 hover:text-ink-900"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
        <select className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink-700 outline-none">
          {modelCatalog.map((model) => (
            <option key={model.id}>{model.name}</option>
          ))}
        </select>
        <span className="inline-flex items-center rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink-500">
          {provider?.name}: {decision.warning ?? "within limits"}
        </span>
      </div>
    </header>
  );
}
