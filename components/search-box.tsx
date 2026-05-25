import Link from "next/link";

export function SearchBox({ query }: { query?: string }) {
  return (
    <form className="search-form" action="/">
      <input
        className="input"
        name="q"
        defaultValue={query}
        placeholder="搜索报告名称、行业、摘要或关键词"
      />
      <button className="button" type="submit">
        搜索
      </button>
      {query ? (
        <Link className="button secondary" href="/">
          清除
        </Link>
      ) : null}
    </form>
  );
}
