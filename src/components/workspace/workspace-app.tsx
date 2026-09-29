"use client";

import { MarkdownMessage } from "@/components/markdown-message";
import { StatusPill } from "@/components/workspace/status-pill";
import { conversations as initialConversations } from "@/lib/data";
import { cx, formatCurrency, formatNumber } from "@/lib/format";
import { modelCatalog, providerCatalog, usageMetrics } from "@/lib/providers/catalog";
import { routeModel } from "@/lib/routing/router";
import type { Attachment, Conversation, Message, RoutingMode } from "@/types/workspace";
import {
  Activity,
  Archive,
  BarChart3,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  Code2,
  Gauge,
  ImageIcon,
  Maximize2,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Pin,
  Plus,
  Route,
  Search,
  Send,
  Settings,
  Sparkles,
  Trash2,
  UploadCloud
} from "lucide-react";
import Link from "next/link";
import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

const modes: Array<{ id: RoutingMode; label: string; icon: typeof Gauge }> = [
  { id: "smart", label: "Smart", icon: Gauge },
  { id: "cost-saving", label: "Cost", icon: CircleDollarSign },
  { id: "coding", label: "Coding", icon: Code2 },
  { id: "long-context", label: "Long", icon: Maximize2 }
];

export function WorkspaceApp() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = useState(initialConversations[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState<string | null>(null);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [routingMode, setRoutingMode] = useState<RoutingMode>("smart");
  const [manualModelId, setManualModelId] = useState(modelCatalog[0].id);
  const [composer, setComposer] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [notice, setNotice] = useState("No provider is connected yet. This frontend is running locally with honest setup states.");
  const [connectedCount, setConnectedCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConversation = conversations.find((item) => item.id === activeId) ?? conversations[0];
  const hasConnectedProvider = connectedCount > 0;
  const decision = routeModel({
    mode: routingMode,
    manualModelId,
    estimatedTokens: activeConversation ? activeConversation.messages.length * 800 + composer.length / 4 : 2_000,
    requiresImages: attachments.some((attachment) => attachment.kind === "image")
  });

  const visibleConversations = conversations.filter((conversation) => {
    const matchesSearch = conversation.title.toLowerCase().includes(query.toLowerCase());
    const matchesFolder = folderFilter ? conversation.folder === folderFilter : true;
    const matchesPinned = showPinnedOnly ? conversation.pinned : true;
    return matchesSearch && matchesFolder && matchesPinned;
  });

  const folders = Array.from(new Set(conversations.map((conversation) => conversation.folder)));

  useEffect(() => {
    const saved = window.localStorage.getItem("relay-ai-conversations");
    if (saved) {
      const parsed = JSON.parse(saved) as Conversation[];
      setConversations(parsed);
      setActiveId(parsed[0]?.id ?? "");
    }

    fetch("/api/providers")
      .then((response) => response.json())
      .then((data: { providers?: Array<{ hasApiKey: boolean; enabled: boolean }> }) => {
        const count = data.providers?.filter((provider) => provider.hasApiKey && provider.enabled).length ?? 0;
        setConnectedCount(count);
        setNotice(
          count > 0
            ? `${count} provider(s) detected from local laptop storage. Chat requests will use the server proxy.`
            : "No provider is connected yet. Add an API key in Settings to start real chat."
        );
      })
      .catch(() => setNotice("Could not read local provider settings."));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("relay-ai-conversations", JSON.stringify(conversations));
  }, [conversations]);

  function createConversation() {
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      title: "Untitled conversation",
      folder: "Inbox",
      pinned: false,
      updatedAt: "Just now",
      provider: decision.selectedModel.provider,
      model: decision.selectedModel.id,
      messages: []
    };
    setConversations((current) => [conversation, ...current]);
    setActiveId(conversation.id);
    setNotice("Created a local conversation. Persistence is not connected until a database is added.");
  }

  function renameConversation() {
    if (!activeConversation) return;
    const title = window.prompt("Rename conversation", activeConversation.title);
    if (!title?.trim()) return;
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeConversation.id ? { ...conversation, title: title.trim(), updatedAt: "Just now" } : conversation
      )
    );
  }

  function deleteConversation() {
    if (!activeConversation) return;
    if (!window.confirm(`Delete "${activeConversation.title}" from this local session?`)) return;
    setConversations((current) => {
      const next = current.filter((conversation) => conversation.id !== activeConversation.id);
      setActiveId(next[0]?.id ?? "");
      return next;
    });
    setNotice("Deleted from local state. Server-side deletion will work after persistence is connected.");
  }

  function togglePin(id: string) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...conversation, pinned: !conversation.pinned, updatedAt: "Just now" } : conversation
      )
    );
  }

  function addFiles(files: FileList | File[]) {
    const nextAttachments = Array.from(files).slice(0, 8).map((file) => ({
      id: crypto.randomUUID(),
      kind: file.type.startsWith("image/") ? "image" : "file",
      name: file.name,
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      url: URL.createObjectURL(file)
    })) satisfies Attachment[];
    setAttachments((current) => [...current, ...nextAttachments].slice(0, 8));
  }

  function handleUploadChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeConversation || !composer.trim() || isSending) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const outboundText = composer.trim();
    const outboundAttachments = attachments;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: outboundText,
      createdAt: now,
      attachments: outboundAttachments
    };

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeConversation.id
          ? {
              ...conversation,
              updatedAt: "Just now",
              provider: decision.selectedModel.provider,
              model: decision.selectedModel.id,
              messages: [...conversation.messages, userMessage]
            }
          : conversation
      )
    );
    setComposer("");
    setAttachments([]);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          message: outboundText,
          routingMode,
          modelId: manualModelId,
          attachments: outboundAttachments
        })
      });
      const data = (await response.json()) as {
        message?: { provider?: Message["provider"]; model?: string; content?: string };
        error?: string;
      };
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        provider: data.message?.provider ?? decision.selectedModel.provider,
        model: data.message?.model ?? decision.selectedModel.id,
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        content: response.ok
          ? data.message?.content ?? "Provider returned an empty response."
          : `${data.error ?? "Provider request failed"}\n\n${data.message?.content ?? "Open Settings, add a provider key, then try again."}`
      };
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversation.id
            ? {
                ...conversation,
                provider: assistantMessage.provider ?? conversation.provider,
                model: assistantMessage.model ?? conversation.model,
                messages: [...conversation.messages, assistantMessage]
              }
            : conversation
        )
      );
      setNotice(response.ok ? "Real provider response received through the local server proxy." : "No fake response: the provider request failed honestly.");
    } finally {
      setIsSending(false);
    }
  }

  if (!activeConversation) {
    return (
      <main className="grid h-dvh place-items-center bg-paper p-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">No conversations</h1>
          <button onClick={createConversation} className="mt-4 rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-paper">
            New conversation
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="grid h-dvh grid-cols-1 overflow-hidden bg-paper text-ink-900 md:grid-cols-[300px_1fr]">
      <aside className="hidden h-full min-h-0 flex-col border-r border-line bg-[#f6f3ec] md:flex">
        <div className="border-b border-line p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg bg-ink-900 text-paper">
                <Sparkles size={17} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">Relay AI</p>
                <p className="text-xs text-ink-500">Local workspace</p>
              </div>
            </div>
            <button onClick={createConversation} className="rounded-lg border border-line bg-white p-2 text-ink-700 shadow-sm" aria-label="New conversation">
              <Plus size={16} />
            </button>
          </div>
          <label className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-sm focus-within:ring-2 focus-within:ring-accent/20">
            <Search size={15} className="text-ink-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-ink-500"
              placeholder="Search conversations"
            />
          </label>
        </div>

        <nav className="space-y-1 p-3 text-sm">
          <button
            onClick={() => {
              setFolderFilter(null);
              setShowPinnedOnly(false);
            }}
            className="flex w-full items-center gap-2 rounded-md bg-white px-3 py-2 text-left font-medium text-ink-900 shadow-sm"
          >
            <MessageSquare size={16} />
            Chats
          </button>
          <button
            onClick={() => setShowPinnedOnly((current) => !current)}
            className={cx(
              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left font-medium hover:bg-white/70 hover:text-ink-900",
              showPinnedOnly ? "bg-white text-ink-900 shadow-sm" : "text-ink-500"
            )}
          >
            <Pin size={16} />
            Pinned
          </button>
          <Link href="/dashboard" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left font-medium text-ink-500 hover:bg-white/70 hover:text-ink-900">
            <BarChart3 size={16} />
            Dashboard
          </Link>
          <Link href="/settings" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left font-medium text-ink-500 hover:bg-white/70 hover:text-ink-900">
            <Settings size={16} />
            Settings
          </Link>
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">Folders</p>
          <div className="space-y-1">
            {folders.map((folder) => (
              <button
                key={folder}
                onClick={() => setFolderFilter(folderFilter === folder ? null : folder)}
                onDoubleClick={() => setShowPinnedOnly(false)}
                className={cx(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-white",
                  folderFilter === folder ? "bg-white text-ink-900 shadow-sm" : "text-ink-600"
                )}
              >
                <span>{folder}</span>
                <span className="text-xs text-ink-500">{conversations.filter((item) => item.folder === folder).length}</span>
              </button>
            ))}
          </div>

          <p className="mt-5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">Recent</p>
          <div className="space-y-1">
            {visibleConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setActiveId(conversation.id)}
                className={cx("w-full rounded-md px-3 py-2 text-left", conversation.id === activeId ? "bg-white shadow-sm" : "hover:bg-white/70")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-ink-900">{conversation.title}</span>
                  {conversation.pinned ? <Pin size={13} className="shrink-0 text-ink-500" /> : null}
                </div>
                <p className="mt-1 text-xs text-ink-500">{conversation.updatedAt}</p>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className="flex min-w-0 flex-col">
        <header className="flex flex-col gap-3 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-[-0.01em] text-ink-900">{activeConversation.title}</h1>
                <button onClick={renameConversation} className="rounded-md p-1 text-ink-500 hover:bg-ink-100" aria-label="Rename conversation">
                  <MoreHorizontal size={16} />
                </button>
              </div>
              <p className="text-sm text-ink-500">{hasConnectedProvider ? "Provider keys detected on server." : "No live AI provider connected."}</p>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => togglePin(activeConversation.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink-900 shadow-sm"
              >
                <Pin size={16} />
                {activeConversation.pinned ? "Unpin" : "Pin"}
              </button>
              <button
                onClick={deleteConversation}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {modes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setRoutingMode(id)}
                className={cx(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition",
                  routingMode === id ? "bg-ink-900 text-paper" : "border border-line bg-white text-ink-600 hover:text-ink-900"
                )}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
            <select
              value={manualModelId}
              onChange={(event) => {
                setManualModelId(event.target.value);
                setRoutingMode("manual");
              }}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink-700 outline-none"
            >
              {modelCatalog.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink-500">
              <Route size={14} />
              {hasConnectedProvider ? decision.reason : "routing preview only"}
            </span>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <section className="flex min-h-0 flex-1 flex-col bg-paper">
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
              <div className="mx-auto max-w-3xl space-y-7">
                <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">System state</p>
                      <p className="mt-1 text-sm text-ink-500">{notice}</p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                      setup needed
                    </span>
                  </div>
                </div>

                {activeConversation.messages.length === 0 ? (
                  <div className="rounded-xl border border-line bg-white p-8 text-center shadow-sm">
                    <Bot className="mx-auto text-ink-500" />
                    <h2 className="mt-4 text-lg font-semibold text-ink-900">Start a real local thread</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">
                      Messages, attachments, routing mode, pins, rename, and delete work in the browser. Live AI replies require provider keys and adapter wiring.
                    </p>
                  </div>
                ) : null}

                {activeConversation.messages.map((message) => (
                  <article key={message.id} className={message.role === "user" ? "flex justify-end" : ""}>
                    <div className={message.role === "user" ? "max-w-[88%] rounded-2xl bg-ink-900 px-4 py-3 text-paper" : "max-w-none"}>
                      {message.role === "assistant" ? (
                        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-ink-500">
                          <span className="rounded-full border border-line bg-white px-2 py-1">{message.model}</span>
                          <span>{message.createdAt}</span>
                        </div>
                      ) : null}
                      {message.role === "assistant" ? <MarkdownMessage content={message.content} /> : <p className="text-[15px] leading-7">{message.content}</p>}
                      {message.attachments?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.attachments.map((attachment) => (
                            <span key={attachment.id} className="rounded-md bg-white/10 px-2 py-1 text-xs">
                              {attachment.name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <form onSubmit={sendMessage} className="border-t border-line bg-paper p-4 md:px-8">
              <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-white p-2 shadow-lift">
                <div
                  onDrop={handleDrop}
                  onDragOver={(event) => event.preventDefault()}
                  className="mb-2 rounded-xl border border-dashed border-line bg-ink-50 p-3"
                >
                  <div className="flex items-center gap-3 text-sm text-ink-500">
                    <UploadCloud size={17} />
                    <span>{attachments.length ? `${attachments.length} attachment(s) ready` : "Drop files or images here, or use the attach buttons."}</span>
                  </div>
                  {attachments.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {attachments.map((attachment) => (
                        <button
                          key={attachment.id}
                          type="button"
                          onClick={() => setAttachments((current) => current.filter((item) => item.id !== attachment.id))}
                          className="rounded-md border border-line bg-white px-2 py-1 text-xs text-ink-700"
                        >
                          {attachment.name} · {attachment.size} ×
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <textarea
                  value={composer}
                  onChange={(event) => setComposer(event.target.value)}
                  className="min-h-24 w-full resize-none bg-transparent px-3 py-2 text-[15px] leading-7 text-ink-900 outline-none placeholder:text-ink-500"
                  placeholder="Write a message. This will be saved locally unless a provider is connected."
                />
                <div className="flex items-center justify-between gap-3 px-2 pb-1">
                  <div className="flex items-center gap-1">
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleUploadChange} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100" aria-label="Attach file">
                      <Paperclip size={17} />
                    </button>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100" aria-label="Attach image">
                      <ImageIcon size={17} />
                    </button>
                  </div>
                  <button
                    disabled={!composer.trim() || isSending}
                    className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-paper shadow-sm hover:bg-ink-700 disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-500"
                  >
                    {isSending ? "Sending..." : "Send"}
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </form>
          </section>

          <OperationsPanel hasConnectedProvider={hasConnectedProvider} />
        </div>

        <nav className="grid grid-cols-3 border-t border-line bg-paper p-2 xl:hidden">
          <button onClick={createConversation} className="flex flex-col items-center gap-1 rounded-lg bg-ink-900 px-2 py-2 text-xs font-medium text-paper">
            <Plus size={17} />
            New
          </button>
          <Link href="/dashboard" className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-ink-500">
            <BarChart3 size={17} />
            Usage
          </Link>
          <Link href="/settings" className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-ink-500">
            <Settings size={17} />
            Settings
          </Link>
        </nav>
      </section>
    </main>
  );
}

function OperationsPanel({ hasConnectedProvider }: { hasConnectedProvider: boolean }) {
  const totals = useMemo(
    () => ({
      requests: usageMetrics.reduce((sum, item) => sum + item.requests, 0),
      cost: usageMetrics.reduce((sum, item) => sum + item.estimatedCost, 0)
    }),
    []
  );

  return (
    <aside className="hidden h-full min-h-0 w-[360px] flex-col border-l border-line bg-[#f8f6f0] xl:flex">
      <div className="border-b border-line p-4">
        <p className="text-sm font-semibold text-ink-900">Operations</p>
        <p className="mt-1 text-xs text-ink-500">{hasConnectedProvider ? "Live provider config detected." : "No live usage yet."}</p>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard icon={<BarChart3 size={16} />} label="Requests" value={formatNumber(totals.requests)} />
          <MetricCard icon={<Activity size={16} />} label="Est. cost" value={formatCurrency(totals.cost)} />
        </div>
        <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-900">Providers</h2>
            <CheckCircle2 size={16} className={hasConnectedProvider ? "text-emerald-600" : "text-ink-400"} />
          </div>
          <div className="space-y-3">
            {providerCatalog.map((provider) => (
              <div key={provider.id} className="space-y-2 rounded-lg border border-line/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{provider.name}</p>
                    <p className="text-xs text-ink-500">{provider.configured ? "Configured on server" : "Not connected"}</p>
                  </div>
                  <StatusPill status={provider.status} />
                </div>
                <p className="text-xs leading-5 text-ink-500">
                  {provider.configured ? "Usage tracking starts after real requests are persisted." : "Add an environment key to enable live requests."}
                </p>
              </div>
            ))}
          </div>
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
