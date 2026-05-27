import { createPublicSupabaseClient, createServiceSupabaseClient } from "./supabase";
import {
  getClientIp,
  normalizeLookupText,
  slugify,
  stableHash,
  validateDate,
  normalizeCreateReportInput,
  ValidationError
} from "./report-utils";
import type {
  CreateReportResult,
  IndustryChain,
  IndustryChainNode,
  IndustryChainSummary,
  KeywordLink,
  Report,
  ReportListItem,
  StockRecommendationReport
} from "./types";

const RATE_LIMIT_WINDOW_MINUTES = 60;
const RATE_LIMIT_MAX_SUBMISSIONS = 10;

const REPORT_SELECT = `
  id,
  title,
  slug,
  summary,
  keywords,
  industry,
  industry_chain_id,
  report_date,
  content_markdown,
  source_mode,
  status,
  created_at,
  updated_at,
  industry_chain:industry_chains (
    id,
    name,
    key,
    level,
    parent_id,
    description,
    sort_order
  )
`;

const REPORT_LIST_SELECT = `
  id,
  title,
  slug,
  summary,
  keywords,
  industry,
  industry_chain_id,
  report_date,
  created_at,
  industry_chain:industry_chains (
    id,
    name,
    key,
    level,
    parent_id,
    description,
    sort_order
  )
`;

const STOCK_REPORT_SELECT = `
  id,
  industry_chain_id,
  report_id,
  title,
  slug,
  summary,
  content_markdown,
  tickers,
  status,
  report_date,
  created_at,
  updated_at,
  industry_chain:industry_chains (
    id,
    name,
    key,
    level,
    parent_id,
    description,
    sort_order
  ),
  report:reports (
    id,
    title,
    slug
  )
`;

function normalizeReportRow<T extends { industry_chain?: IndustryChainSummary[] | IndustryChainSummary | null }>(
  report: T
) {
  const industryChain = Array.isArray(report.industry_chain)
    ? (report.industry_chain[0] ?? null)
    : (report.industry_chain ?? null);

  return {
    ...report,
    industry_chain: industryChain
  };
}

function normalizeStockReportRow<
  T extends {
    industry_chain?: IndustryChainSummary[] | IndustryChainSummary | null;
    report?: StockRecommendationReport["report"][] | StockRecommendationReport["report"] | null;
  }
>(stockReport: T) {
  const industryChain = Array.isArray(stockReport.industry_chain)
    ? (stockReport.industry_chain[0] ?? null)
    : (stockReport.industry_chain ?? null);
  const report = Array.isArray(stockReport.report)
    ? (stockReport.report[0] ?? null)
    : (stockReport.report ?? null);

  return {
    ...stockReport,
    industry_chain: industryChain,
    report
  };
}

function matchesSearch(report: ReportListItem, search: string) {
  const keywordText = report.keywords?.join(" ") ?? "";
  const chainText = report.industry_chain
    ? `${report.industry_chain.name} ${report.industry_chain.key}`
    : "";

  return `${report.title} ${report.summary ?? ""} ${report.industry ?? ""} ${chainText} ${keywordText}`
    .toLowerCase()
    .includes(search.toLowerCase());
}

async function getPublishedReportsFromLegacySchema(search?: string): Promise<ReportListItem[]> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("reports")
    .select("id,title,slug,summary,keywords,industry,report_date,created_at")
    .eq("status", "published")
    .order("report_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(search ? 200 : 80);

  if (error) {
    console.error("Failed to fetch legacy reports", error);
    return [];
  }

  const reports = ((data ?? []) as Array<Omit<ReportListItem, "industry_chain_id" | "industry_chain">>).map(
    (report) => ({
      ...report,
      industry_chain_id: null,
      industry_chain: null
    })
  );

  return search ? reports.filter((report) => matchesSearch(report, search)) : reports;
}

export async function getPublishedReports(search?: string): Promise<ReportListItem[]> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("reports")
    .select(REPORT_LIST_SELECT)
    .eq("status", "published")
    .order("report_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const normalizedSearch = search?.trim();

  const { data, error } = await query.limit(normalizedSearch ? 200 : 80);
  if (error) {
    console.error("Failed to fetch reports", error);
    return getPublishedReportsFromLegacySchema(normalizedSearch);
  }

  const reports = ((data ?? []) as Array<
    ReportListItem & { industry_chain?: IndustryChainSummary[] | IndustryChainSummary | null }
  >).map((report) => normalizeReportRow(report)) as ReportListItem[];

  if (!normalizedSearch) {
    return reports;
  }

  return reports.filter((report) => matchesSearch(report, normalizedSearch));
}

export async function getPublishedReportBySlug(slug: string): Promise<Report | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("reports")
    .select(REPORT_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    const { data: legacyData, error: legacyError } = await supabase
      .from("reports")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (legacyError) {
      return null;
    }

    return {
      ...(legacyData as Omit<Report, "industry_chain_id" | "industry_chain">),
      industry_chain_id: null,
      industry_chain: null
    };
  }

  return normalizeReportRow(data as Report & { industry_chain?: IndustryChainSummary[] | IndustryChainSummary | null }) as Report;
}

export async function getIndustryChainTree(): Promise<IndustryChainNode[]> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return [];
  }

  const [{ data: chains, error: chainError }, { data: reports, error: reportError }] =
    await Promise.all([
      supabase
        .from("industry_chains")
        .select("id,name,key,level,parent_id,description,sort_order")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("reports")
        .select("id,title,slug,summary,report_date,created_at,industry_chain_id")
        .eq("status", "published")
    ]);

  if (chainError || reportError) {
    console.error("Failed to fetch industry chain tree", chainError ?? reportError);
    return [];
  }

  const reportByChainId = new Map<string, IndustryChainNode["report"]>();
  for (const report of reports ?? []) {
    if (report.industry_chain_id) {
      reportByChainId.set(report.industry_chain_id, report);
    }
  }

  const nodes = new Map<string, IndustryChainNode>();
  for (const chain of (chains ?? []) as IndustryChainSummary[]) {
    nodes.set(chain.id, {
      ...chain,
      report: reportByChainId.get(chain.id) ?? null,
      children: []
    });
  }

  const roots: IndustryChainNode[] = [];
  for (const node of nodes.values()) {
    if (node.parent_id && nodes.has(node.parent_id)) {
      nodes.get(node.parent_id)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function getKeywordLinks(keywords: string[]): Promise<KeywordLink[]> {
  const supabase = createPublicSupabaseClient();
  if (!supabase || keywords.length === 0) {
    return keywords.map((keyword) => ({
      label: keyword,
      href: `/?q=${encodeURIComponent(keyword)}`,
      direct: false
    }));
  }

  const { data, error } = await supabase
    .from("reports")
    .select("slug,industry_chain:industry_chains(name,key)")
    .eq("status", "published");

  if (error) {
    console.error("Failed to fetch keyword links", error);
    return keywords.map((keyword) => ({
      label: keyword,
      href: `/?q=${encodeURIComponent(keyword)}`,
      direct: false
    }));
  }

  const reportByChain = new Map<string, string>();
  for (const row of data ?? []) {
    const chain = Array.isArray(row.industry_chain) ? row.industry_chain[0] : row.industry_chain;
    if (!chain) {
      continue;
    }

    reportByChain.set(normalizeLookupText(chain.name), row.slug);
    reportByChain.set(normalizeLookupText(chain.key), row.slug);
  }

  return keywords.map((keyword) => {
    const slug = reportByChain.get(normalizeLookupText(keyword));
    return slug
      ? { label: keyword, href: `/reports/${slug}`, direct: true }
      : { label: keyword, href: `/?q=${encodeURIComponent(keyword)}`, direct: false };
  });
}

export async function getStockRecommendationReportsForReport(
  report: Report
): Promise<StockRecommendationReport[]> {
  const supabase = createPublicSupabaseClient();
  if (!supabase || !report.industry_chain_id) {
    return [];
  }

  const { data, error } = await supabase
    .from("stock_recommendation_reports")
    .select("*")
    .eq("industry_chain_id", report.industry_chain_id)
    .eq("status", "published")
    .order("report_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch stock recommendation reports", error);
    return [];
  }

  return (data ?? []) as StockRecommendationReport[];
}

export async function getStockRecommendationReportBySlug(
  slug: string
): Promise<StockRecommendationReport | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("stock_recommendation_reports")
    .select(STOCK_REPORT_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    return null;
  }

  return normalizeStockReportRow(
    data as StockRecommendationReport & {
      industry_chain?: IndustryChainSummary[] | IndustryChainSummary | null;
      report?: StockRecommendationReport["report"][] | StockRecommendationReport["report"] | null;
    }
  ) as StockRecommendationReport;
}

async function resolveIndustryChain(input: {
  industry_chain?: string;
  industry_chain_key?: string;
}) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    throw new Error("Missing Supabase service configuration");
  }

  const key = input.industry_chain_key?.trim();
  const name = input.industry_chain?.trim();

  let query = supabase.from("industry_chains").select("*").limit(1);
  if (key) {
    query = query.eq("key", key);
  } else if (name) {
    query = query.eq("name", name);
  } else {
    throw new ValidationError("请在 Markdown front matter 中提供 industry_chain 或 industry_chain_key");
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw error;
  }

  if (data) {
    return data as IndustryChain;
  }

  if (name) {
    const { data: chains, error: chainsError } = await supabase
      .from("industry_chains")
      .select("*");

    if (chainsError) {
      throw chainsError;
    }

    const normalizedName = normalizeLookupText(name);
    const fuzzyMatch = ((chains ?? []) as IndustryChain[]).find(
      (chain) =>
        normalizeLookupText(chain.name) === normalizedName ||
        normalizeLookupText(chain.key) === normalizedName
    );

    if (fuzzyMatch) {
      return fuzzyMatch;
    }
  }

  throw new ValidationError(`产业链不存在：${key || name}。请先维护 industry_chains 字典`);
}

export async function createReport(rawInput: unknown, headers: Headers): Promise<CreateReportResult> {
  const input = normalizeCreateReportInput(rawInput);
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    throw new Error("Missing Supabase service configuration");
  }

  const industryChain = await resolveIndustryChain(input);

  const ipHash = stableHash(`${getClientIp(headers)}:${process.env.SUBMISSION_SECRET ?? "dev"}`);
  const contentHash = stableHash(input.content_markdown);
  const userAgent = headers.get("user-agent")?.slice(0, 300) ?? "";
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();

  const { count, error: countError } = await supabase
    .from("report_submissions")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", windowStart);

  if (countError) {
    throw countError;
  }

  if ((count ?? 0) >= RATE_LIMIT_MAX_SUBMISSIONS) {
    const error = new Error("提交过于频繁，请稍后再试");
    (error as Error & { status?: number }).status = 429;
    throw error;
  }

  const { data: duplicate } = await supabase
    .from("reports")
    .select(REPORT_SELECT)
    .eq("content_hash", contentHash)
    .eq("status", "published")
    .maybeSingle();

  if (duplicate) {
    const duplicateReport = normalizeReportRow(
      duplicate as Report & { industry_chain?: IndustryChainSummary[] | IndustryChainSummary | null }
    ) as Report;
    return {
      report: duplicateReport,
      url: `/reports/${duplicateReport.slug}`,
      duplicate: true
    };
  }

  let slug = slugify(input.title);
  const { data: existingSlug } = await supabase
    .from("reports")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingSlug) {
    slug = `${slug}-${contentHash.slice(0, 8)}`;
  }

  const { data: report, error: insertError } = await supabase
    .from("reports")
    .insert({
      title: input.title,
      slug,
      summary: input.summary || null,
      keywords: input.keywords ?? [],
      industry: input.industry || industryChain.name,
      industry_chain_id: industryChain.id,
      report_date: validateDate(input.report_date) ?? null,
      content_markdown: input.content_markdown,
      content_hash: contentHash,
      source_mode: input.source_mode ?? "codex_external",
      status: "published"
    })
    .select(REPORT_SELECT)
    .single();

  if (insertError) {
    throw insertError;
  }

  await supabase.from("report_submissions").insert({
    report_id: report.id,
    ip_hash: ipHash,
    user_agent: userAgent
  });

  return {
    report: normalizeReportRow(
      report as Report & { industry_chain?: IndustryChainSummary[] | IndustryChainSummary | null }
    ) as Report,
    url: `/reports/${report.slug}`,
    duplicate: false
  };
}
