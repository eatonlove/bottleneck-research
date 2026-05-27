import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "筑梦投研",
  description: "Codex 生成并发布的产业链瓶颈研究报告库"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="site-header">
          <Link className="brand" href="/">
            筑梦投研
          </Link>
          <nav className="nav">
            <Link href="/">报告</Link>
            <Link href="/submit">提交</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
