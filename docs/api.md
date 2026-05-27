# API Contract

This project uses real Next.js Route Handlers as the backend contract. There is no frontend mock ledger.

The submit page uploads a `.md` or `.markdown` file in the browser, parses it client-side, and posts the normalized JSON shape below. Reports are now bound to an `industry_chains` dictionary entry.

## `GET /api/reports`

Returns published reports for the homepage.

Query:

- `q` optional search string. Searches title, summary, legacy industry, industry chain name/key, and keywords.

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
      "industry_chain_id": "uuid",
      "industry_chain": {
        "id": "uuid",
        "name": "AI 数据中心光通信",
        "key": "ai-data-center-optical-communications",
        "level": 3,
        "parent_id": "uuid",
        "description": "AI 数据中心光模块、硅光、CPO 与高速互联。",
        "sort_order": 10
      },
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
  "industry_chain_key": "ai-data-center-optical-communications",
  "report_date": "2026-05-25",
  "content_markdown": "# AI 数据中心光通信产业链瓶颈研究..."
}
```

Validation:

- `title` is required, max 120 characters.
- `content_markdown` is required, max 100,000 characters.
- `summary` max 500 characters.
- `keywords` max 12 items, each max 32 characters.
- `industry_chain_key` or `industry_chain` is required. `industry` is accepted as a temporary compatibility fallback.
- The referenced industry chain must exist in `public.industry_chains`.
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
    "industry_chain_id": "uuid",
    "industry_chain": {
      "id": "uuid",
      "name": "AI 数据中心光通信",
      "key": "ai-data-center-optical-communications",
      "level": 3,
      "parent_id": "uuid",
      "description": "AI 数据中心光模块、硅光、CPO 与高速互联。",
      "sort_order": 10
    },
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

- `400`: invalid body, missing fields, unknown industry chain, invalid date, too many keywords, honeypot filled.
- `429`: submission rate limit exceeded.
- `500`: Supabase is not configured or write failed.

## `GET /api/industry-chains`

Returns the three-level industry chain tree for the knowledge graph mode.

Response:

```json
{
  "industry_chains": [
    {
      "id": "uuid",
      "name": "AI 基础设施",
      "key": "ai-infrastructure",
      "level": 1,
      "parent_id": null,
      "description": "AI 算力、数据中心、电力、通信与核心基础设施产业链。",
      "sort_order": 10,
      "report": null,
      "children": [
        {
          "id": "uuid",
          "name": "AI 数据中心",
          "key": "ai-data-center",
          "level": 2,
          "parent_id": "uuid",
          "description": "AI 数据中心建设、运维和关键约束。",
          "sort_order": 10,
          "report": null,
          "children": []
        }
      ]
    }
  ]
}
```

## Markdown file parsing

The browser upload flow supports optional front matter:

```markdown
---
title: AI 数据中心光通信产业链瓶颈研究
summary: 一句话摘要
keywords: [光模块, InP, 硅光, CPO]
industry_chain_key: ai-data-center-optical-communications
industry: AI 数据中心光通信
report_date: 2026-05-25
---
```

Fallback behavior:

- `title`: first H1, then filename.
- `summary`: first non-heading paragraph, capped at 500 characters.
- `keywords`: empty unless `keywords` or `tags` exists in front matter.
- `industry_chain`: `industry_chain`, `chain`, or `industry` from front matter.
- `industry_chain_key`: `industry_chain_key` or `chain_key` from front matter.
- `industry`: `industry` or `category` from front matter, kept as a compatibility display field.
- `report_date`: `report_date` or `date` from front matter.
- `content_markdown`: normalized to contain one top-level H1 matching the parsed title.

## Stock recommendation reports

Stock recommendation reports are stored in `public.stock_recommendation_reports` and are associated with industry chain reports through `industry_chain_id`. Published stock reports are publicly readable and displayed on the matching industry chain report detail page.
