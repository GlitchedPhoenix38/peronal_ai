import { StatusPill } from "@/components/workspace/status-pill";
import { formatCurrency, formatNumber } from "@/lib/format";
import { providerCatalog, usageMetrics } from "@/lib/providers/catalog";
import { Activity, AlertTriangle, BarChart3, Clock, KeyRound, ShieldCheck } from "lucide-react";

export function Inspector() {
  const totalCost = usageMetrics.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalRequests = usageMetrics.reduce((sum, item) => sum + item.requests, 0);

  return (
    <aside className="hidden h-full min-h-0 w-[360px] flex-col border-l border-line bg-[#f8f6f0] xl:flex">
      <div className="border-b border-line p-4">
        <p className="text-sm font-semibold text-ink-900">Operations</p>
        <p className="mt-1 text-xs text-ink-500">Provider health, budget pressure, and routing history.</p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard icon={<BarChart3 size={16} />} label="Requests" value={formatNumber(totalRequests)} />
          <MetricCard icon={<Activity size={16} />} label="Est. cost" value={formatCurrency(totalCost)} />
        </div>

        <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-900">Providers</h2>
            <ShieldCheck size={16} className="text-emerald-600" />
          </div>
          <div className="space-y-3">
            {providerCatalog.map((provider) => {
              const usage = provider.monthlyTokenLimit ? Math.round((provider.usedTokens / provider.monthlyTokenLimit) * 100) : 0;
              return (
                <div key={provider.id} className="space-y-2 rounded-lg border border-line/70 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-ink-900">{provider.name}</p>
                      <p className="text-xs text-ink-500">{provider.configured ? "Key stored server-side" : "Not configured"}</p>
                    </div>
                    <StatusPill status={provider.status} />
                  </div>
                  <div className="h-1.5 rounded-full bg-ink-100">
                    <div className="h-1.5 rounded-full bg-ink-900" style={{ width: `${Math.min(usage, 100)}%` }} />
                  </div>
                  <p className="text-xs text-ink-500">{usage}% monthly token budget used</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-700" />
            <h2 className="text-sm font-semibold text-ink-900">Limit policy</h2>
          </div>
          <div className="space-y-3 text-sm text-ink-600">
            <Policy label="50%" value="Warn team and show cheaper equivalent model." />
            <Policy label="75%" value="Compress older turns and reduce context replay." />
            <Policy label="90%" value="Prefer enabled fallback provider without breaking continuity." />
          </div>
        </section>

        <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Clock size={16} className="text-ink-500" />
            <h2 className="text-sm font-semibold text-ink-900">Routing history</h2>
          </div>
          <div className="space-y-3">
            {[
              ["Smart", "Claude 3.5 Sonnet", "Best code + reasoning blend"],
              ["Cost", "Gemini 2.0 Flash", "Budget threshold exceeded"],
              ["Manual", "GPT-4.1", "User selected vision model"]
            ].map(([mode, model, reason]) => (
              <div key={`${mode}-${model}`} className="rounded-lg bg-ink-50 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink-900">{model}</span>
                  <span className="text-xs text-ink-500">{mode}</span>
                </div>
                <p className="mt-1 text-xs text-ink-500">{reason}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <KeyRound size={16} className="text-ink-500" />
            <h2 className="text-sm font-semibold text-ink-900">API security</h2>
          </div>
          <p className="text-sm leading-6 text-ink-600">
            Keys are accepted only by server routes, encrypted before storage, and never serialized into client props.
          </p>
        </section>
      </div>
    </aside>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <div className="mb-3 text-ink-500">{icon}</div>
      <p className="text-xs text-ink-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-[-0.02em] text-ink-900">{value}</p>
    </div>
  );
}

function Policy({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 rounded-full bg-ink-900 px-2 py-1 text-xs font-semibold text-paper">{label}</span>
      <p>{value}</p>
    </div>
  );
}
