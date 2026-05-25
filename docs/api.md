# API Contract

This project uses a real Next.js Route Handler as the backend contract. There is no frontend mock ledger.

The submit page uploads a `.md` or `.markdown` file in the browser, parses it client-side, and posts the normalized JSON shape below. The backend contract remains `POST /api/reports`.

## `GET /api/reports`

Returns published reports for the homepage.

Query:

- `q` optional search string. Searches title, summary, industry, and keywords.

Response:

```json
{
  "reports": [
    {
      "id": "uuid",
      "title": "AI 数据中心光通信产业链瓶颈研究",
      "slug": "ai-data-center-optical-networking",
      "summary": "一句话摘要",
      "keywords": ["光模块", "InP", "硅光"],
      "industry": "AI 数据中心光通信",
      "report_date": "2026-05-25",
      "created_at": "2026-05-25T00:00:00.000Z"
    }
  ]
}
```

## `POST /api/reports`

Creates a public report. Used by the submit page and by Codex/API clients.

Request:

```json
{
  "title": "AI 数据中心光通信产业链瓶颈研究",
  "summary": "一句话摘要",
  "keywords": ["光模块", "InP", "硅光", "CPO"],
  "industry": "AI 数据中心光通信",
  "report_date": "2026-05-25",
  "content_markdown": "# AI 数据中心光通信产业链瓶颈研究..."
}
```

Validation:

- `title` is required, max 120 characters.
- `content_markdown` is required, max 100,000 characters.
- `summary` max 500 characters.
- `keywords` max 12 items, each max 32 characters.
- `report_date` must be `YYYY-MM-DD` when present.
- Honeypot field `website` must be empty.

Response:

```json
{
  "report": {
    "id": "uuid",
    "title": "AI 数据中心光通信产业链瓶颈研究",
    "slug": "ai-data-center-optical-networking",
    "summary": "一句话摘要",
    "keywords": ["光模块", "InP", "硅光", "CPO"],
    "industry": "AI 数据中心光通信",
    "report_date": "2026-05-25",
    "content_markdown": "# AI 数据中心光通信产业链瓶颈研究...",
    "source_mode": "codex_external",
    "status": "published",
    "created_at": "2026-05-25T00:00:00.000Z",
    "updated_at": "2026-05-25T00:00:00.000Z"
  },
  "url": "https://example.com/reports/ai-data-center-optical-networking",
  "duplicate": false
}
```

Error states:

- `400`: invalid body, missing fields, invalid date, too many keywords, honeypot filled.
- `429`: submission rate limit exceeded.
- `500`: Supabase is not configured or write failed.

## Markdown file parsing

The browser upload flow supports optional front matter:

```markdown
---
title: AI 数据中心光通信产业链瓶颈研究
summary: 一句话摘要
keywords: [光模块, InP, 硅光, CPO]
industry: AI 数据中心光通信
report_date: 2026-05-25
---
```

Fallback behavior:

- `title`: first H1, then filename.
- `summary`: first non-heading paragraph, capped at 500 characters.
- `keywords`: empty unless `keywords` or `tags` exists in front matter.
- `industry`: `industry` or `category` from front matter.
- `report_date`: `report_date` or `date` from front matter.
- `content_markdown`: normalized to contain one top-level H1 matching the parsed title.
