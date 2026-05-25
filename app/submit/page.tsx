import { SubmitForm } from "@/components/submit-form";

export default function SubmitPage() {
  return (
    <div className="page page-narrow">
      <section className="article-header">
        <p className="eyebrow">Publish Research</p>
        <h1>提交一篇产业链瓶颈报告</h1>
        <p className="lead">
          上传 Codex 生成的 Markdown 报告，系统会解析标题、摘要、关键词、方向和日期，并以标准报告格式发布。
        </p>
      </section>
      <SubmitForm />
    </div>
  );
}
