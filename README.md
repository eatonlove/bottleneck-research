# 产业链瓶颈报告库

Vercel + Supabase 的公开报告库。Codex 生成 Markdown 产业链瓶颈研究报告后，可以通过网页上传 `.md` 文件，或通过 `POST /api/reports` 上传并立即公开。

Production: https://bottleneck-research.vercel.app

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

3. In Supabase SQL editor, run:

```sql
-- see supabase/schema.sql
```

4. Fill env vars:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUBMISSION_SECRET=replace-with-random-string
```

5. Start dev server:

```bash
npm run dev
```

## Markdown upload format

网页提交页支持上传 `.md` / `.markdown` 文件。推荐在文件顶部加入 front matter：

```markdown
---
title: AI 数据中心光通信产业链瓶颈研究
summary: 围绕高带宽互联需求，二三级瓶颈可能出现在光器件、InP、测试和封装环节。
keywords: [光模块, InP, 硅光, CPO]
industry: AI 数据中心光通信
report_date: 2026-05-25
---

# AI 数据中心光通信产业链瓶颈研究

## 一句话判断

...
```

如果没有 front matter，系统会从第一个 H1、第一段正文和文件名推断报告字段，并发布为标准化 Markdown。

## API upload example

```bash
curl -X POST http://localhost:3000/api/reports \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "AI 数据中心光通信产业链瓶颈研究",
    "summary": "围绕高带宽互联需求，二三级瓶颈可能出现在光器件、InP、测试和封装环节。",
    "keywords": ["光模块", "InP", "硅光", "CPO"],
    "industry": "AI 数据中心光通信",
    "report_date": "2026-05-25",
    "content_markdown": "# AI 数据中心光通信产业链瓶颈研究\n\n## 一句话判断\n\n..."
  }'
```
