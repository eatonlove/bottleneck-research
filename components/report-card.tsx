import Link from "next/link";
import type { ReportListItem } from "@/lib/types";

function formatDate(date: string | null, fallback: string) {
  const value = date || fallback;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

export function ReportCard({ report }: { report: ReportListItem }) {
  return (
    <Link className="report-card" href={`/reports/${report.slug}`}>
      <article>
        <h2 className="report-title">{report.title}</h2>
        {report.summary ? <p className="report-summary">{report.summary}</p> : null}
        <div className="meta-row">
          {report.industry ? <span>{report.industry}</span> : null}
          <div className="chip-row">
            {report.keywords.slice(0, 6).map((keyword) => (
              <span className="chip" key={keyword}>
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </article>
      <div className="date-block">
        <div>报告日期</div>
        <strong>{formatDate(report.report_date, report.created_at)}</strong>
      </div>
    </Link>
  );
}
