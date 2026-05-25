import { createHash } from "crypto";
import type { CreateReportInput } from "./types";

export const MAX_MARKDOWN_LENGTH = 100_000;
export const MAX_TITLE_LENGTH = 120;
export const MAX_SUMMARY_LENGTH = 500;
export const MAX_KEYWORDS = 12;
export const MAX_KEYWORD_LENGTH = 32;

export class ValidationError extends Error {
  status = 400;

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function normalizeKeywords(rawKeywords: unknown): string[] {
  if (rawKeywords == null || rawKeywords === "") {
    return [];
  }

  const keywords = Array.isArray(rawKeywords)
    ? rawKeywords
    : String(rawKeywords)
        .split(/[,\n，、]/)
        .map((keyword) => keyword.trim());

  const uniqueKeywords = Array.from(
    new Set(
      keywords
        .map((keyword) => String(keyword).trim())
        .filter(Boolean)
        .map((keyword) => keyword.slice(0, MAX_KEYWORD_LENGTH))
    )
  );

  if (uniqueKeywords.length > MAX_KEYWORDS) {
    throw new ValidationError(`关键词最多 ${MAX_KEYWORDS} 个`);
  }

  return uniqueKeywords;
}

export function slugify(input: string) {
  const asciiSlug = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  if (asciiSlug) {
    return asciiSlug.slice(0, 72);
  }

  const fallback = createHash("sha1").update(input).digest("hex").slice(0, 12);
  return `report-${fallback}`;
}

export function stableHash(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export function validateDate(date: string | undefined) {
  if (!date) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ValidationError("报告日期必须是 YYYY-MM-DD 格式");
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new ValidationError("报告日期无效");
  }

  return date;
}

export function normalizeCreateReportInput(raw: unknown): CreateReportInput {
  if (!raw || typeof raw !== "object") {
    throw new ValidationError("请求体必须是 JSON 对象");
  }

  const input = raw as Record<string, unknown>;
  if (input.website) {
    throw new ValidationError("提交被拒绝");
  }

  const title = String(input.title ?? "").trim();
  const contentMarkdown = String(input.content_markdown ?? "").trim();
  const summary = String(input.summary ?? "").trim();
  const industry = String(input.industry ?? "").trim();
  const sourceMode = String(input.source_mode ?? "codex_external").trim();

  if (!title) {
    throw new ValidationError("标题不能为空");
  }

  if (title.length > MAX_TITLE_LENGTH) {
    throw new ValidationError(`标题最多 ${MAX_TITLE_LENGTH} 个字符`);
  }

  if (!contentMarkdown) {
    throw new ValidationError("报告正文不能为空");
  }

  if (contentMarkdown.length > MAX_MARKDOWN_LENGTH) {
    throw new ValidationError(`报告正文最多 ${MAX_MARKDOWN_LENGTH} 个字符`);
  }

  if (summary.length > MAX_SUMMARY_LENGTH) {
    throw new ValidationError(`摘要最多 ${MAX_SUMMARY_LENGTH} 个字符`);
  }

  return {
    title,
    summary,
    keywords: normalizeKeywords(input.keywords),
    industry,
    report_date: validateDate(String(input.report_date ?? "").trim() || undefined) ?? undefined,
    content_markdown: contentMarkdown,
    source_mode: sourceMode || "codex_external"
  };
}

export function getClientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return headers.get("x-real-ip") ?? "unknown";
}
