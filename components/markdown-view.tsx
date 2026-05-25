import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function headingId(children: unknown) {
  return String(children)
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractToc(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => {
      const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
      if (!match) {
        return null;
      }

      return {
        level: match[1].length,
        text: match[2].replace(/[#*_`]/g, "").trim(),
        id: headingId(match[2])
      };
    })
    .filter(Boolean) as Array<{ level: number; text: string; id: string }>;
}

export function MarkdownView({ markdown }: { markdown: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => <h2 id={headingId(children)}>{children}</h2>,
          h3: ({ children }) => <h3 id={headingId(children)}>{children}</h3>
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
