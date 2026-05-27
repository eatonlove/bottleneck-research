import Link from "next/link";
import { HomeExplorer } from "@/components/home-explorer";
import { SearchBox } from "@/components/search-box";
import { getIndustryChainTree, getPublishedReports } from "@/lib/reports";
import { hasSupabaseReadConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q } = await searchParams;
  const [reports, industryChains] = await Promise.all([
    getPublishedReports(q),
    getIndustryChainTree()
  ]);

  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Supply Chain Bottleneck Research</p>
          <h1>产业链洞察沉淀报告库</h1>
          <p className="lead">
            行业拆解、二三级瓶颈、关键供应商、证据链与反证，让每份研究都能被检索、复用和继续下钻。
          </p>
        </div>
      </section>

      <section className="toolbar">
        <SearchBox query={q} />
      </section>

      {!hasSupabaseReadConfig() ? (
        <div className="empty">
          还没有配置 Supabase 环境变量。页面可以正常预览；配置
          <code>NEXT_PUBLIC_SUPABASE_URL</code> 和 <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          后会显示公开报告。
        </div>
      ) : reports.length > 0 || industryChains.length > 0 ? (
        <HomeExplorer reports={reports} industryChains={industryChains} />
      ) : (
        <div className="empty">
          还没有匹配的报告。可以从 <Link href="/submit">提交页</Link> 发布第一篇。
        </div>
      )}
    </div>
  );
}
