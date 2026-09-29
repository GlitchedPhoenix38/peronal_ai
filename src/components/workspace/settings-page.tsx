"use client";

import { StatusPill } from "@/components/workspace/status-pill";
import { providerCatalog } from "@/lib/providers/catalog";
import { CheckCircle2, KeyRound, PlugZap, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export function SettingsPage() {
  const [enabled, setEnabled] = useState(() => Object.fromEntries(providerCatalog.map((provider) => [provider.id, provider.enabled])));
  const [limits, setLimits] = useState(() => Object.fromEntries(providerCatalog.map((provider) => [provider.id, provider.monthlyTokenLimit])));
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [defaultMode, setDefaultMode] = useState("Smart");
  const [message, setMessage] = useState("Settings are local until database persistence and encrypted key storage are connected.");
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  async function testConnection(providerId: string) {
    setTestingProvider(providerId);
    if (apiKeys[providerId]?.trim()) {
      await saveProvider(providerId);
    }
    const response = await fetch(`/api/providers/${providerId}/health`);
    const result = (await response.json()) as { configured?: boolean; status?: string; error?: string };
    setTestingProvider(null);
    setMessage(
      result.configured
        ? `${providerId} is configured and reported ${result.status}.`
        : `${providerId} is not connected. Add its server-side environment key before live requests can run.`
    );
  }

  async function saveProvider(providerId: string) {
    await fetch("/api/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerId,
        enabled: Boolean(enabled[providerId]),
        apiKey: apiKeys[providerId]?.trim() || undefined,
        monthlyTokenLimit: Number(limits[providerId] ?? 0)
      })
    });
  }

  async function saveLocalSettings() {
    await Promise.all(providerCatalog.map((provider) => saveProvider(provider.id)));
    setMessage(`Saved encrypted keys and settings on this laptop. Default mode: ${defaultMode}.`);
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink-500">Admin</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-ink-900">Provider settings</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500">
              Connect keys, choose enabled providers, test connection health, and define budget behavior without exposing secrets to the browser.
            </p>
          </div>
          <button onClick={saveLocalSettings} className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-paper shadow-sm">
            Save changes
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {message}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-3">
            {providerCatalog.map((provider) => (
              <article key={provider.id} className="rounded-xl border border-line bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="grid size-10 place-items-center rounded-lg bg-ink-100 text-ink-700">
                      <PlugZap size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-ink-900">{provider.name}</h2>
                        <StatusPill status={provider.status} />
                      </div>
                      <p className="mt-1 max-w-xl text-sm leading-6 text-ink-500">{provider.description}</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
                    <input
                      type="checkbox"
                      checked={Boolean(enabled[provider.id])}
                      onChange={(event) => setEnabled((current) => ({ ...current, [provider.id]: event.target.checked }))}
                      className="size-4 accent-ink-900"
                    />
                    Enabled
                  </label>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_140px]">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-ink-500">API key</span>
                    <div className="flex items-center gap-2 rounded-lg border border-line px-3 py-2">
                      <KeyRound size={15} className="text-ink-500" />
                      <input
                      type="password"
                      className="w-full bg-transparent text-sm outline-none"
                      placeholder={provider.configured ? "Configured on server" : "Paste key to store locally"}
                      value={apiKeys[provider.id] ?? ""}
                      onChange={(event) => setApiKeys((current) => ({ ...current, [provider.id]: event.target.value }))}
                    />
                    </div>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-ink-500">Monthly tokens</span>
                    <input
                      type="number"
                      value={limits[provider.id]}
                      onChange={(event) => setLimits((current) => ({ ...current, [provider.id]: Number(event.target.value) }))}
                      className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </label>
                  <button
                    onClick={() => testConnection(provider.id)}
                    disabled={testingProvider === provider.id}
                    className="self-end rounded-lg border border-line bg-ink-50 px-3 py-2 text-sm font-medium text-ink-900 hover:bg-white disabled:cursor-wait disabled:text-ink-500"
                  >
                    {testingProvider === provider.id ? "Testing..." : "Test connection"}
                  </button>
                </div>
              </article>
            ))}
          </section>

          <aside className="space-y-4">
            <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <SlidersHorizontal size={17} />
                <h2 className="font-semibold text-ink-900">Routing defaults</h2>
              </div>
              <div className="space-y-3">
                {["Smart", "Cost Saving", "Coding", "Long Context"].map((mode, index) => (
                  <label key={mode} className="flex items-center justify-between rounded-lg border border-line p-3 text-sm">
                    <span className="font-medium text-ink-700">{mode}</span>
                    <input
                      type="radio"
                      name="default-mode"
                      checked={defaultMode === mode || (index === 0 && !defaultMode)}
                      onChange={() => setDefaultMode(mode)}
                      className="accent-ink-900"
                    />
                  </label>
                ))}
              </div>
            </section>
            <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-700" />
                <h2 className="font-semibold text-ink-900">Security posture</h2>
              </div>
              <ul className="space-y-2 text-sm leading-6 text-ink-600">
                <li>Server-only API key handling.</li>
                <li>Input validation on chat and settings routes.</li>
                <li>Rate limiting by forwarded IP address.</li>
                <li>Provider adapters isolate external API calls.</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
