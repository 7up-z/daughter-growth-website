import type { Metadata } from "next";
import "./globals.css";
import "./yearbook.css";
import "./chronicle.css";
import "./atlas.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "小咩 · 成长编年志",
  description: "把成长的每一页，留给家人慢慢翻看。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--theme-background)] text-[var(--theme-text)] transition-colors duration-300">
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

// 禁用静态生成，确保客户端渲染
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
