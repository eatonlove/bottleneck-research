import { createPublicSupabaseClient, createServiceSupabaseClient } from "./supabase";
import {
  getClientIp,
  slugify,
  stableHash,
  validateDate,
  normalizeCreateReportInput
} from "./report-utils";
import type { CreateReportResult, Report, ReportListItem } from "./types";

const RATE_LIMIT_WINDOW_MINUTES = 60;
const RATE_LIMIT_MAX_SUBMISSIONS = 10;

export async function getPublishedReports(search?: string): Promise<ReportListItem[]> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("reports")
    .select("id,title,slug,summary,keywords,industry,report_date,created_at")
    .eq("status", "published")
    .order("report_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const normalizedSearch = search?.trim();
  if (normalizedSearch) {
    const escaped = normalizedSearch.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(
      `title.ilike.%${escaped}%,summary.ilike.%${escaped}%,industry.ilike.%${escaped}%`
    );
  }

  const { data, error } = await query.limit(80);
  if (error) {
    console.error("Failed to fetch reports", error);
    return [];
  }

  const reports = (data ?? []) as ReportListItem[];
  if (!normalizedSearch) {
    return reports;
  }

  return reports.filter((report) => {
    const keywordText = report.keywords?.join(" ") ?? "";
    return `${report.title} ${report.summary ?? ""} ${report.industry ?? ""} ${keywordText}`
      .toLowerCase()
      .includes(normalizedSearch.toLowerCase());
  });
}

export async function getPublishedReportBySlug(slug: string): Promise<Report | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    return null;
  }

  return data as Report;
}

export async function createReport(rawInput: unknown, headers: Headers): Promise<CreateReportResult> {
  const input = normalizeCreateReportInput(rawInput);
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    throw new Error("Missing Supabase service configuration");
  }

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
    .select("*")
    .eq("content_hash", contentHash)
    .eq("status", "published")
    .maybeSingle();

  if (duplicate) {
    return {
      report: duplicate as Report,
      url: `/reports/${duplicate.slug}`,
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
      industry: input.industry || null,
      report_date: validateDate(input.report_date) ?? null,
      content_markdown: input.content_markdown,
      content_hash: contentHash,
      source_mode: input.source_mode ?? "codex_external",
      status: "published"
    })
    .select("*")
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
    report: report as Report,
    url: `/reports/${report.slug}`,
    duplicate: false
  };
}
