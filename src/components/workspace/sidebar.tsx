import { conversations } from "@/lib/data";
import { cx } from "@/lib/format";
import { Archive, History, Pin, Search, Settings, Sparkles } from "lucide-react";

const folders = ["Product", "Engineering", "Research", "Ops"];

export function Sidebar() {
  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-line bg-[#f6f3ec]">
      <div className="border-b border-line p-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-ink-900 text-paper">
            <Sparkles size={17} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">Relay AI</p>
            <p className="text-xs text-ink-500">Unified model workspace</p>
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-sm focus-within:ring-2 focus-within:ring-accent/20">
          <Search size={15} className="text-ink-500" />
          <input className="w-full bg-transparent outline-none placeholder:text-ink-500" placeholder="Search conversations" />
        </label>
      </div>

      <nav className="space-y-1 p-3 text-sm">
        {[
          ["Chats", History],
          ["Pinned", Pin],
          ["Archive", Archive],
          ["Settings", Settings]
        ].map(([label, Icon], index) => (
          <button
            key={String(label)}
            className={cx(
              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left font-medium",
              index === 0 ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:bg-white/70 hover:text-ink-900"
            )}
          >
            <Icon size={16} />
            {String(label)}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">Folders</p>
        <div className="space-y-1">
          {folders.map((folder) => (
            <button key={folder} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-ink-600 hover:bg-white">
              <span>{folder}</span>
              <span className="text-xs text-ink-500">{conversations.filter((item) => item.folder === folder).length}</span>
            </button>
          ))}
        </div>

        <p className="mt-5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">Recent</p>
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={cx(
                "w-full rounded-md px-3 py-2 text-left",
                conversation.id === "c-101" ? "bg-white shadow-sm" : "hover:bg-white/70"
              )}
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
  );
}
