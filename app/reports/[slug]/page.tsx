import Link from "next/link";
import { notFound } from "next/navigation";
import { extractToc, MarkdownView } from "@/components/markdown-view";
import { getPublishedReportBySlug } from "@/lib/reports";

export const dynamic = "force-dynamic";

type ReportPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(date: string | null, fallback: string) {
  const value = date || fallback;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { slug } = await params;
  const report = await getPublishedReportBySlug(slug);

  if (!report) {
    notFound();
  }

  const toc = extractToc(report.content_markdown).slice(0, 18);

  return (
    <div className="page article-layout">
      <article>
        <header className="article-header">
          <Link className="eyebrow" href="/">
            返回报告库
          </Link>
          <h1>{report.title}</h1>
          {report.summary ? <p className="lead">{report.summary}</p> : null}
          <div className="meta-row article-meta">
            <span>{formatDate(report.report_date, report.created_at)}</span>
            {report.industry ? <span>{report.industry}</span> : null}
            <span>{report.source_mode === "codex_external" ? "Codex 外部生成" : report.source_mode}</span>
          </div>
          {report.keywords.length > 0 ? (
            <div className="meta-row article-meta">
              {report.keywords.map((keyword) => (
                <span className="chip" key={keyword}>
                  {keyword}
                </span>
              ))}
            </div>
          ) : null}
        </header>
        <MarkdownView markdown={report.content_markdown} />
      </article>

      <aside className="toc">
        <p className="toc-title">目录</p>
        {toc.length > 0 ? (
          toc.map((item) => (
            <a
              href={`#${item.id}`}
              key={`${item.id}-${item.text}`}
              style={{ paddingLeft: item.level === 3 ? 12 : 0 }}
            >
              {item.text}
            </a>
          ))
        ) : (
          <p>正文暂无二级标题。</p>
        )}
      </aside>
    </div>
  );
}
