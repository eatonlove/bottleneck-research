import Link from "next/link";
import { notFound } from "next/navigation";
import { extractToc, MarkdownView } from "@/components/markdown-view";
import { getStockRecommendationReportBySlug } from "@/lib/reports";

export const dynamic = "force-dynamic";

type StockReportPageProps = {
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

export default async function StockReportPage({ params }: StockReportPageProps) {
  const { slug } = await params;
  const stockReport = await getStockRecommendationReportBySlug(slug);

  if (!stockReport) {
    notFound();
  }

  const toc = extractToc(stockReport.content_markdown).slice(0, 18);

  return (
    <div className="page article-layout">
      <article>
        <header className="article-header">
          <Link
            className="eyebrow"
            href={stockReport.report ? `/reports/${stockReport.report.slug}` : "/"}
          >
            {stockReport.report ? "返回产业链报告" : "返回报告库"}
          </Link>
          <h1>{stockReport.title}</h1>
          {stockReport.summary ? <p className="lead">{stockReport.summary}</p> : null}
          <div className="meta-row article-meta">
            <span>{formatDate(stockReport.report_date, stockReport.created_at)}</span>
            {stockReport.industry_chain ? <span>{stockReport.industry_chain.name}</span> : null}
            <span>股票推荐报告</span>
          </div>
          {stockReport.tickers.length > 0 ? (
            <div className="meta-row article-meta">
              {stockReport.tickers.map((ticker) => (
                <span className="chip" key={ticker}>
                  {ticker}
                </span>
              ))}
            </div>
          ) : null}
        </header>
        <MarkdownView markdown={stockReport.content_markdown} />
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
