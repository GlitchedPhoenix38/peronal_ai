import { StatusPill } from "@/components/workspace/status-pill";
import { formatCurrency, formatNumber } from "@/lib/format";
import { providerCatalog, usageMetrics } from "@/lib/providers/catalog";
import { Activity, AlertCircle, BarChart3, Gauge, Timer } from "lucide-react";

export default function DashboardPage() {
  const totalRequests = usageMetrics.reduce((sum, metric) => sum + metric.requests, 0);
  const totalTokens = usageMetrics.reduce((sum, metric) => sum + metric.inputTokens + metric.outputTokens, 0);
  const totalCost = usageMetrics.reduce((sum, metric) => sum + metric.estimatedCost, 0);

  return (
    <main className="min-h-screen bg-paper px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-ink-500">Analytics</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-ink-900">Usage dashboard</h1>
          <p className="mt-2 text-sm text-ink-500">Request volume, token estimates, cost, health, and provider performance.</p>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-4">
          <Summary icon={<BarChart3 size={18} />} label="Requests" value={formatNumber(totalRequests)} />
          <Summary icon={<Activity size={18} />} label="Tokens" value={formatNumber(totalTokens)} />
          <Summary icon={<Gauge size={18} />} label="Est. cost" value={formatCurrency(totalCost)} />
          <Summary icon={<AlertCircle size={18} />} label="Errors" value="0.9%" />
        </div>

        <section className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
          <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] border-b border-line px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
            <span>Provider</span>
            <span>Requests</span>
            <span>Tokens</span>
            <span>Cost</span>
            <span>Latency</span>
          </div>
          {usageMetrics.map((metric) => {
            const provider = providerCatalog.find((item) => item.id === metric.provider);
            return (
              <div key={metric.provider} className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] items-center border-b border-line px-4 py-4 text-sm last:border-b-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink-900">{provider?.name}</span>
                    {provider ? <StatusPill status={provider.status} /> : null}
                  </div>
                  <p className="mt-1 text-xs text-ink-500">{provider?.description}</p>
                </div>
                <span>{formatNumber(metric.requests)}</span>
                <span>{formatNumber(metric.inputTokens + metric.outputTokens)}</span>
                <span>{formatCurrency(metric.estimatedCost)}</span>
                <span className="inline-flex items-center gap-1">
                  <Timer size={14} />
                  {metric.p95LatencyMs}ms
                </span>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <div className="mb-4 text-ink-500">{icon}</div>
      <p className="text-xs text-ink-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-ink-900">{value}</p>
    </div>
  );
}
