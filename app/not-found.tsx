import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page page-narrow">
      <section className="empty">
        <h1>没有找到这份报告</h1>
        <p>它可能还没有发布，或链接已经变化。</p>
        <Link className="button" href="/">
          返回报告库
        </Link>
      </section>
    </div>
  );
}
