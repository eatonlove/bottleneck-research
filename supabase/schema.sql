create extension if not exists "pgcrypto";

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  slug text unique not null,
  summary text check (summary is null or char_length(summary) <= 500),
  keywords text[] not null default '{}',
  industry text,
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

create table if not exists public.report_submissions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade,
  ip_hash text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists reports_status_created_at_idx
  on public.reports (status, created_at desc);

create index if not exists reports_status_report_date_idx
  on public.reports (status, report_date desc);

create index if not exists reports_keywords_idx
  on public.reports using gin (keywords);

create index if not exists report_submissions_ip_created_at_idx
  on public.report_submissions (ip_hash, created_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_reports_updated_at on public.reports;

create trigger set_reports_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

alter table public.reports enable row level security;
alter table public.report_submissions enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.reports to anon, authenticated;
grant all on public.reports to service_role;
grant all on public.report_submissions to service_role;

drop policy if exists "Published reports are publicly readable" on public.reports;

create policy "Published reports are publicly readable"
on public.reports for select
using (status = 'published');

-- report_submissions is only written by the service role from the Next.js API.
-- No public RLS policy is needed.
