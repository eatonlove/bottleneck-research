import Link from "next/link";
import { notFound } from "next/navigation";
import { extractToc, MarkdownView } from "@/components/markdown-view";
import {
  getKeywordLinks,
  getPublishedReportBySlug,
  getStockRecommendationReportsForReport
} from "@/lib/reports";

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

  const [keywordLinks, stockReports] = await Promise.all([
    getKeywordLinks(report.keywords),
    getStockRecommendationReportsForReport(report)
  ]);
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
            {report.industry_chain ? <span>{report.industry_chain.name}</span> : null}
            {report.industry ? <span>{report.industry}</span> : null}
            <span>{report.source_mode === "codex_external" ? "Codex 外部生成" : report.source_mode}</span>
          </div>
          {keywordLinks.length > 0 ? (
            <div className="meta-row article-meta">
              {keywordLinks.map((keyword) => (
                <Link
                  className={keyword.direct ? "chip chip-link direct" : "chip chip-link"}
                  href={keyword.href}
                  key={keyword.label}
                  title={keyword.direct ? "打开对应产业链报告" : "按标签筛选报告"}
                >
                  {keyword.label}
                </Link>
              ))}
            </div>
          ) : null}
        </header>
        <MarkdownView markdown={report.content_markdown} />
        {stockReports.length > 0 ? (
          <section className="related-section">
            <div className="section-heading">
              <p className="eyebrow">Stock Recommendation Reports</p>
              <h2>关联股票推荐报告</h2>
            </div>
            <div className="stock-report-list">
              {stockReports.map((stockReport) => (
                <article className="stock-report-card" key={stockReport.id}>
                  <div>
                    <h3>{stockReport.title}</h3>
                    {stockReport.summary ? <p>{stockReport.summary}</p> : null}
                    {stockReport.tickers.length > 0 ? (
                      <div className="chip-row">
                        {stockReport.tickers.map((ticker) => (
                          <span className="chip" key={ticker}>
                            {ticker}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="date-block">
                    <div>报告日期</div>
                    <strong>{formatDate(stockReport.report_date, stockReport.created_at)}</strong>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
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
