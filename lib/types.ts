export type ReportStatus = "published" | "pending_review" | "hidden";

export type IndustryChain = {
  id: string;
  name: string;
  key: string;
  level: 1 | 2 | 3;
  parent_id: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type IndustryChainSummary = Pick<
  IndustryChain,
  "id" | "name" | "key" | "level" | "parent_id" | "description" | "sort_order"
>;

export type IndustryChainNode = IndustryChainSummary & {
  report: Pick<Report, "id" | "title" | "slug" | "summary" | "report_date" | "created_at"> | null;
  children: IndustryChainNode[];
};

export type Report = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  keywords: string[];
  industry: string | null;
  industry_chain_id: string | null;
  industry_chain: IndustryChainSummary | null;
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
  | "industry_chain_id"
  | "industry_chain"
  | "report_date"
  | "created_at"
>;

export type KeywordLink = {
  label: string;
  href: string;
  direct: boolean;
};

export type StockRecommendationReport = {
  id: string;
  industry_chain_id: string;
  report_id: string | null;
  title: string;
  slug: string;
  summary: string | null;
  content_markdown: string;
  tickers: string[];
  status: ReportStatus;
  report_date: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateReportInput = {
  title: string;
  summary?: string;
  keywords?: string[];
  industry?: string;
  industry_chain?: string;
  industry_chain_key?: string;
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
