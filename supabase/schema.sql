create extension if not exists "pgcrypto";

create table if not exists public.industry_chains (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  key text unique not null check (char_length(key) between 1 and 96),
  level integer not null check (level between 1 and 3),
  parent_id uuid references public.industry_chains(id) on delete cascade,
  description text check (description is null or char_length(description) <= 500),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint industry_chains_parent_level_check check (
    (level = 1 and parent_id is null) or
    (level in (2, 3) and parent_id is not null)
  )
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  slug text unique not null,
  summary text check (summary is null or char_length(summary) <= 500),
  keywords text[] not null default '{}',
  industry text,
  industry_chain_id uuid references public.industry_chains(id) on delete restrict,
  report_date date,
  content_markdown text not null check (
    char_length(content_markdown) between 1 and 100000
  ),
  content_hash text unique not null,
  source_mode text not null default 'codex_external',
  status text not null default 'published' check (
    status in ('published', 'pending_review', 'hidden')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_recommendation_reports (
  id uuid primary key default gen_random_uuid(),
  industry_chain_id uuid not null references public.industry_chains(id) on delete restrict,
  report_id uuid references public.reports(id) on delete set null,
  title text not null check (char_length(title) between 1 and 120),
  slug text unique not null,
  summary text check (summary is null or char_length(summary) <= 500),
  content_markdown text not null check (
    char_length(content_markdown) between 1 and 100000
  ),
  tickers text[] not null default '{}',
  status text not null default 'published' check (
    status in ('published', 'pending_review', 'hidden')
  ),
  report_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_submissions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade,
  ip_hash text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.reports
  add column if not exists industry_chain_id uuid references public.industry_chains(id) on delete restrict;

create index if not exists reports_status_created_at_idx
  on public.reports (status, created_at desc);

create index if not exists reports_status_report_date_idx
  on public.reports (status, report_date desc);

create unique index if not exists reports_industry_chain_unique_idx
  on public.reports (industry_chain_id)
  where industry_chain_id is not null and status = 'published';

create index if not exists reports_industry_chain_idx
  on public.reports (industry_chain_id);

create index if not exists reports_keywords_idx
  on public.reports using gin (keywords);

create index if not exists industry_chains_parent_sort_idx
  on public.industry_chains (parent_id, sort_order, name);

create index if not exists stock_recommendation_reports_chain_idx
  on public.stock_recommendation_reports (industry_chain_id, status, report_date desc);

create index if not exists report_submissions_ip_created_at_idx
  on public.report_submissions (ip_hash, created_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists set_reports_updated_at on public.reports;
drop trigger if exists set_industry_chains_updated_at on public.industry_chains;
drop trigger if exists set_stock_recommendation_reports_updated_at on public.stock_recommendation_reports;

create trigger set_reports_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

create trigger set_industry_chains_updated_at
before update on public.industry_chains
for each row execute function public.set_updated_at();

create trigger set_stock_recommendation_reports_updated_at
before update on public.stock_recommendation_reports
for each row execute function public.set_updated_at();

insert into public.industry_chains (name, key, level, parent_id, description, sort_order)
values
  ('AI 基础设施', 'ai-infrastructure', 1, null, 'AI 算力、数据中心、电力、通信与核心基础设施产业链。', 10),
  ('先进制造', 'advanced-manufacturing', 1, null, '高端制造、核心设备、关键材料与国产替代产业链。', 20),
  ('商业航天', 'commercial-space', 1, null, '火箭、卫星、地面系统和空间应用产业链。', 30)
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.industry_chains (name, key, level, parent_id, description, sort_order)
select 'AI 数据中心', 'ai-data-center', 2, id, 'AI 数据中心建设、运维和关键约束。', 10
from public.industry_chains where key = 'ai-infrastructure'
on conflict (key) do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.industry_chains (name, key, level, parent_id, description, sort_order)
select '商业航天制造', 'commercial-space-manufacturing', 2, id, '商业航天上游制造与集成。', 10
from public.industry_chains where key = 'commercial-space'
on conflict (key) do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.industry_chains (name, key, level, parent_id, description, sort_order)
select child.name, child.key, 3, parent.id, child.description, child.sort_order
from (
  values
    ('AI 数据中心光通信', 'ai-data-center-optical-communications', 'AI 数据中心光模块、硅光、CPO 与高速互联。', 10),
    ('AI 数据中心电力与并网', 'ai-data-center-power-grid', 'AI 数据中心电力容量、电网接入、备用电源与液冷相关瓶颈。', 20),
    ('AI 产业链', 'ai-industry', 'AI 应用、模型、算力与数据基础设施的综合产业链。', 30),
    ('AI', 'ai', 'AI 应用、模型、算力与数据基础设施的综合产业链。', 40),
    ('1.6T 光模块', '1-6t-optical-transceiver', '1.6T 光模块、LPO、硅光与高速封装产业链。', 50)
) as child(name, key, description, sort_order)
join public.industry_chains parent on parent.key = 'ai-data-center'
on conflict (key) do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.industry_chains (name, key, level, parent_id, description, sort_order)
select '商业航天产业链', 'commercial-space-industry', 3, parent.id, '商业航天核心环节、供应商和瓶颈约束。', 10
from public.industry_chains parent where parent.key = 'commercial-space-manufacturing'
on conflict (key) do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  description = excluded.description,
  sort_order = excluded.sort_order;

update public.reports report
set industry_chain_id = chain.id
from public.industry_chains chain
where report.industry_chain_id is null
  and report.industry is not null
  and (
    lower(report.industry) = lower(chain.name)
    or lower(report.industry) = lower(chain.key)
  );

alter table public.reports enable row level security;
alter table public.industry_chains enable row level security;
alter table public.stock_recommendation_reports enable row level security;
alter table public.report_submissions enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.industry_chains to anon, authenticated;
grant select on public.reports to anon, authenticated;
grant select on public.stock_recommendation_reports to anon, authenticated;
grant all on public.industry_chains to service_role;
grant all on public.reports to service_role;
grant all on public.stock_recommendation_reports to service_role;
grant all on public.report_submissions to service_role;

drop policy if exists "Industry chains are publicly readable" on public.industry_chains;
drop policy if exists "Published reports are publicly readable" on public.reports;
drop policy if exists "Published stock recommendation reports are publicly readable" on public.stock_recommendation_reports;

create policy "Industry chains are publicly readable"
on public.industry_chains for select
using (true);

create policy "Published reports are publicly readable"
on public.reports for select
using (status = 'published');

create policy "Published stock recommendation reports are publicly readable"
on public.stock_recommendation_reports for select
using (status = 'published');

-- report_submissions is only written by the service role from the Next.js API.
-- No public RLS policy is needed.
