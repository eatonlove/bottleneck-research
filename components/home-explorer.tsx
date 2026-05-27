"use client";

import Link from "next/link";
import { useState } from "react";
import { ReportCard } from "@/components/report-card";
import type { IndustryChainNode, ReportListItem } from "@/lib/types";

type ViewMode = "list" | "graph";

function ChainNode({ node }: { node: IndustryChainNode }) {
  const [open, setOpen] = useState(node.level === 1);
  const hasChildren = node.children.length > 0;
  const reportHref = node.report ? `/reports/${node.report.slug}` : null;
  const body = (
    <>
      <div className="chain-heading">
        <span className="chain-title">{node.name}</span>
        <span className="chain-level">L{node.level}</span>
        {node.report ? <span className="chain-report-badge">有报告</span> : null}
      </div>
      {node.description ? <p>{node.description}</p> : null}
      {node.report?.summary ? <p className="chain-report-summary">{node.report.summary}</p> : null}
    </>
  );

  return (
    <li className={`chain-node chain-level-${node.level}`}>
      <div className="chain-row">
        {hasChildren ? (
          <button
            aria-expanded={open}
            className="chain-toggle"
            onClick={() => setOpen((current) => !current)}
            type="button"
          >
            {open ? "-" : "+"}
          </button>
        ) : (
          <span className="chain-toggle-placeholder" />
        )}
        {reportHref ? (
          <Link
            aria-label={`打开报告：${node.report?.title ?? node.name}`}
            className="chain-body chain-body-link"
            href={reportHref}
          >
            {body}
          </Link>
        ) : (
          <div className="chain-body">{body}</div>
        )}
      </div>

      {hasChildren && open ? (
        <ul className="chain-children">
          {node.children.map((child) => (
            <ChainNode key={child.id} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function HomeExplorer({
  reports,
  industryChains
}: {
  reports: ReportListItem[];
  industryChains: IndustryChainNode[];
}) {
  const [mode, setMode] = useState<ViewMode>("list");

  return (
    <>
      <div className="mode-switch" role="tablist" aria-label="报告浏览模式">
        <button
          aria-selected={mode === "list"}
          className={mode === "list" ? "active" : ""}
          onClick={() => setMode("list")}
          role="tab"
          type="button"
        >
          报告列表
        </button>
        <button
          aria-selected={mode === "graph"}
          className={mode === "graph" ? "active" : ""}
          onClick={() => setMode("graph")}
          role="tab"
          type="button"
        >
          知识图谱
        </button>
      </div>

      {mode === "list" ? (
        reports.length > 0 ? (
          <section className="report-grid">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </section>
        ) : (
          <div className="empty">还没有匹配的报告。</div>
        )
      ) : industryChains.length > 0 ? (
        <section className="knowledge-graph" aria-label="产业链知识图谱">
          <ul className="chain-tree">
            {industryChains.map((node) => (
              <ChainNode key={node.id} node={node} />
            ))}
          </ul>
        </section>
      ) : (
        <div className="empty">还没有产业链节点。请先维护 industry_chains 字典。</div>
      )}
    </>
  );
}
