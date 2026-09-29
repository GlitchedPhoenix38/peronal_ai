import { BarChart3, MessageSquare, Settings } from "lucide-react";

export function MobileTabs() {
  return (
    <nav className="grid grid-cols-3 border-t border-line bg-paper p-2 xl:hidden">
      {[
        ["Chats", MessageSquare],
        ["Usage", BarChart3],
        ["Settings", Settings]
      ].map(([label, Icon], index) => (
        <button
          key={String(label)}
          className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium ${
            index === 0 ? "bg-ink-900 text-paper" : "text-ink-500"
          }`}
        >
          <Icon size={17} />
          {String(label)}
        </button>
      ))}
    </nav>
  );
}
