function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function MarkdownMessage({ content }: { content: string }) {
  const blocks = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4 text-[15px] leading-7 text-ink-700">
      {blocks.map((block, index) => {
        if (block.startsWith("```")) {
          const code = block.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "");
          return (
            <pre
              key={index}
              className="overflow-x-auto rounded-lg border border-ink-900 bg-ink-900 p-4 text-[13px] leading-6 text-ink-50 shadow-soft"
            >
              <code>{code}</code>
            </pre>
          );
        }

        return block
          .split("\n\n")
          .filter(Boolean)
          .map((paragraph, paragraphIndex) => (
            <p
              key={`${index}-${paragraphIndex}`}
              dangerouslySetInnerHTML={{
                __html: escapeHtml(paragraph)
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                  .replace(/`([^`]+)`/g, "<code>$1</code>")
                  .replace(/\n/g, "<br />")
              }}
            />
          ));
      })}
    </div>
  );
}
