import { MarkdownMessage } from "@/components/markdown-message";
import { conversations } from "@/lib/data";
import { ImageIcon, Paperclip, Send, UploadCloud } from "lucide-react";

export function ChatPanel() {
  const conversation = conversations[0];

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-paper">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto max-w-3xl space-y-7">
          <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink-900">Continuity memory</p>
                <p className="mt-1 text-sm text-ink-500">Provider switches preserve this conversation through durable message replay and compression.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                synced
              </span>
            </div>
          </div>

          {conversation.messages.map((message) => (
            <article key={message.id} className={message.role === "user" ? "flex justify-end" : ""}>
              <div className={message.role === "user" ? "max-w-[88%] rounded-2xl bg-ink-900 px-4 py-3 text-paper" : "max-w-none"}>
                {message.role === "assistant" ? (
                  <div className="mb-3 flex items-center gap-2 text-xs font-medium text-ink-500">
                    <span className="rounded-full border border-line bg-white px-2 py-1">{message.model}</span>
                    <span>{message.createdAt}</span>
                  </div>
                ) : null}
                {message.role === "assistant" ? (
                  <MarkdownMessage content={message.content} />
                ) : (
                  <p className="text-[15px] leading-7">{message.content}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="border-t border-line bg-paper p-4 md:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-white p-2 shadow-lift">
          <div className="mb-2 rounded-xl border border-dashed border-line bg-ink-50 p-3">
            <div className="flex items-center gap-3 text-sm text-ink-500">
              <UploadCloud size={17} />
              <span>Drop files or images here. Vision-capable models receive previews with the prompt.</span>
            </div>
          </div>
          <textarea
            className="min-h-24 w-full resize-none bg-transparent px-3 py-2 text-[15px] leading-7 text-ink-900 outline-none placeholder:text-ink-500"
            placeholder="Ask Relay to compare providers, write code, analyze an image, or continue this thread..."
          />
          <div className="flex items-center justify-between gap-3 px-2 pb-1">
            <div className="flex items-center gap-1">
              <button className="rounded-lg p-2 text-ink-500 hover:bg-ink-100" aria-label="Attach file">
                <Paperclip size={17} />
              </button>
              <button className="rounded-lg p-2 text-ink-500 hover:bg-ink-100" aria-label="Attach image">
                <ImageIcon size={17} />
              </button>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-paper shadow-sm hover:bg-ink-700">
              Send
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
