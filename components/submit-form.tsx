"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; url: string; duplicate: boolean };

type ParsedMarkdownReport = {
  title: string;
  summary: string;
  keywords: string[];
  industry: string;
  industry_chain: string;
  industry_chain_key: string;
  report_date: string;
  content_markdown: string;
};

const FRONT_MATTER_PATTERN = /^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/;

function parseFrontMatterValue(value: string) {
  return value.trim().replace(/^['"]|['"]$/g, "").trim();
}

function parseKeywords(value: string) {
  const trimmed = value.trim();
  const inlineList = trimmed.match(/^\[(.*)\]$/);
  const rawKeywords = inlineList ? inlineList[1] : trimmed;

  return rawKeywords
    .split(/[,\n，、]/)
    .map((keyword) => parseFrontMatterValue(keyword))
    .filter(Boolean);
}

function parseFrontMatter(markdown: string) {
  const match = markdown.match(FRONT_MATTER_PATTERN);
  if (!match) {
    return {
      metadata: {} as Record<string, string>,
      content: markdown.trim()
    };
  }

  const metadata: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1);
    if (key) {
      metadata[key] = parseFrontMatterValue(value);
    }
  }

  return {
    metadata,
    content: markdown.slice(match[0].length).trim()
  };
}

function titleFromFilename(fileName: string) {
  return fileName
    .replace(/\.md(?:own)?$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

function firstParagraph(markdown: string) {
  const paragraph = markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .find((block) => block && !block.startsWith("#") && !block.startsWith("|"));

  return paragraph?.replace(/\s+/g, " ").slice(0, 500) ?? "";
}

function standardizeMarkdownContent(title: string, content: string) {
  const trimmedContent = content.trim();
  const titlePattern = /^#\s+(.+)\s*$/m;
  const existingTitle = trimmedContent.match(titlePattern)?.[1]?.trim();

  if (existingTitle === title) {
    return trimmedContent;
  }

  if (titlePattern.test(trimmedContent)) {
    return trimmedContent.replace(titlePattern, `# ${title}`);
  }

  return `# ${title}\n\n${trimmedContent}`;
}

function parseMarkdownReport(markdown: string, fileName: string): ParsedMarkdownReport {
  const { metadata, content } = parseFrontMatter(markdown);
  const h1Title = content.match(/^#\s+(.+)\s*$/m)?.[1]?.trim() ?? "";
  const title = metadata.title || h1Title || titleFromFilename(fileName);

  return {
    title,
    summary: metadata.summary || metadata.description || firstParagraph(content),
    keywords: parseKeywords(metadata.keywords ?? metadata.tags ?? ""),
    industry: metadata.industry || metadata.category || "",
    industry_chain: metadata.industry_chain || metadata.chain || metadata.industry || "",
    industry_chain_key: metadata.industry_chain_key || metadata.chain_key || "",
    report_date: metadata.report_date || metadata.date || "",
    content_markdown: standardizeMarkdownContent(title, content)
  };
}

export function SubmitForm() {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [report, setReport] = useState<ParsedMarkdownReport | null>(null);
  const [fileName, setFileName] = useState("");

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    setState({ status: "idle" });

    if (!file) {
      setFileName("");
      setReport(null);
      return;
    }

    if (!/\.md(?:own)?$/i.test(file.name)) {
      setFileName("");
      setReport(null);
      setState({ status: "error", message: "请上传 .md 或 .markdown 文件" });
      return;
    }

    const markdown = await file.text();
    const parsedReport = parseMarkdownReport(markdown, file.name);
    setFileName(file.name);
    setReport(parsedReport);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    if (!report) {
      setState({ status: "error", message: "请先上传 Markdown 文件" });
      return;
    }

    setState({ status: "loading" });

    const payload = {
      title: report.title,
      summary: report.summary,
      keywords: report.keywords,
      industry: report.industry,
      industry_chain: report.industry_chain,
      industry_chain_key: report.industry_chain_key,
      report_date: report.report_date,
      content_markdown: report.content_markdown,
      website: String(formData.get("website") ?? "")
    };

    const response = await fetch("/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      setState({ status: "error", message: data.error ?? "提交失败" });
      return;
    }

    setState({
      status: "success",
      url: data.url,
      duplicate: Boolean(data.duplicate)
    });
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="field">
        <label className="label" htmlFor="markdown_file">
          Markdown 文件
        </label>
        <input
          accept=".md,.markdown,text/markdown,text/plain"
          className="input file-input"
          id="markdown_file"
          name="markdown_file"
          onChange={onFileChange}
          required
          type="file"
        />
        <p className="hint">
          支持 front matter：title、summary、keywords、industry_chain 或
          industry_chain_key、industry、report_date。没有 metadata 时会从 H1、正文和文件名推断。
        </p>
      </div>

      {report ? (
        <section className="parsed-preview" aria-live="polite">
          <div className="preview-header">
            <div>
              <p className="preview-kicker">{fileName}</p>
              <h2>{report.title}</h2>
            </div>
            {report.report_date ? <span className="chip">{report.report_date}</span> : null}
          </div>

          {report.summary ? <p className="preview-summary">{report.summary}</p> : null}

          <div className="meta-row">
            {report.industry_chain ? <span>{report.industry_chain}</span> : null}
            {report.industry ? <span>{report.industry}</span> : null}
            {report.industry_chain_key ? <span className="chip">{report.industry_chain_key}</span> : null}
            {report.keywords.map((keyword) => (
              <span className="chip" key={keyword}>
                {keyword}
              </span>
            ))}
          </div>

          <details>
            <summary>预览标准化 Markdown</summary>
            <pre>{report.content_markdown}</pre>
          </details>
        </section>
      ) : null}

      <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" />

      {state.status === "error" ? <div className="notice error">{state.message}</div> : null}
      {state.status === "success" ? (
        <div className="notice success">
          {state.duplicate ? "这篇报告已存在。" : "报告已发布。"}
          <a href={state.url}> 打开报告</a>
        </div>
      ) : null}

      <button className="button" disabled={!report || state.status === "loading"} type="submit">
        {state.status === "loading" ? "发布中..." : "发布报告"}
      </button>
    </form>
  );
}
