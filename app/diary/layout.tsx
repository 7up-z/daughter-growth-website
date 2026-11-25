import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "私密日记 · 小咩",
  robots: { index: false, follow: false },
}

export default function DiaryLayout({ children }: { children: React.ReactNode }) {
  return children
}
