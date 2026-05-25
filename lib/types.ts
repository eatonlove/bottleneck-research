export type ReportStatus = "published" | "pending_review" | "hidden";

export type Report = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  keywords: string[];
  industry: string | null;
  report_date: string | null;
  content_markdown: string;
  source_mode: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
};

export type ReportListItem = Pick<
  Report,
  | "id"
  | "title"
  | "slug"
  | "summary"
  | "keywords"
  | "industry"
  | "report_date"
  | "created_at"
>;

export type CreateReportInput = {
  title: string;
  summary?: string;
  keywords?: string[];
  industry?: string;
  report_date?: string;
  content_markdown: string;
  source_mode?: string;
  website?: string;
};

export type CreateReportResult = {
  report: Report;
  url: string;
  duplicate: boolean;
};
