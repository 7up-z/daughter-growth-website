"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Cake, Camera, Clock3, Map, MessageCircle } from "lucide-react"
import { ArchiveError, useMemoryArchive, YearSelector } from "@/components/ui/memory-archive-controls"
import { ThemedHeader, ThemedLoading, ThemedPageHero, ThemedShell, useCurrentThemeStyle } from "@/components/ui/theme-shell"
import { formatMemoryDate } from "@/lib/memory-archive"

const typeMeta = {
  photo: { label: "照片", icon: Camera },
  travel: { label: "旅行", icon: Map },
  birthday: { label: "生日", icon: Cake },
  message: { label: "留言", icon: MessageCircle },
}

export default function TimelinePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const current = useCurrentThemeStyle()
  const { archive, loading, failed, retry } = useMemoryArchive("timeline", status === "authenticated")

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login")
  }, [status, router])

  if (status === "loading") return <ThemedLoading />
  if (!session) return null

  const pages = archive ? Math.ceil(archive.total / archive.pageSize) : 0

  return (
    <ThemedShell maxWidth="max-w-5xl">
      <ThemedHeader title="成长时间线" />
      <main>
        <ThemedPageHero
          eyebrow="Growth Timeline"
          title="成长时间线"
          description="把照片、生日、旅行和留言按时间收进同一条家庭记忆线。"
          icon={<Clock3 className="h-4 w-4" />}
        />
        {loading && <ThemedLoading label="正在加载时间线…" />}
        {failed && <ArchiveError retry={retry} />}
        {archive && (
          <>
            <YearSelector years={archive.years} selected={archive.year} path="/timeline" />
            <p className={`mb-4 text-sm font-bold ${current.secondaryText}`}>共 {archive.total} 条记录</p>
            <section className="space-y-5">
              {archive.recent.map((item) => {
                const meta = typeMeta[item.type]
                const Icon = meta.icon
                return (
                  <article key={`${item.type}-${item.id}`} className={`grid gap-4 rounded-[1.5rem] border p-5 sm:grid-cols-[160px_1fr] ${current.card}`}>
                    <div className={`text-sm font-black ${current.secondaryText}`}>
                      {formatMemoryDate(item)}
                      {item.usesArchiveDate && <p className="mt-1 text-xs font-medium">归档日期</p>}
                    </div>
                    <div>
                      <p className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${current.pickerCard}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </p>
                      <h2 className="break-words text-xl font-black">{item.title}</h2>
                      <p className={`mt-2 text-sm font-semibold ${current.secondaryText}`}>{item.detail} · {item.author}</p>
                      <Link href={item.href} className="mt-4 inline-flex text-sm font-black underline underline-offset-4">查看详情</Link>
                    </div>
                  </article>
                )
              })}
            </section>
            {archive.total === 0 && (
              <div className={`mt-6 rounded-[2rem] border py-16 text-center ${current.pickerCard}`}>
                <Clock3 className="mx-auto mb-4 h-10 w-10" />
                <h2 className="text-lg font-black">这一年还没有时间线记录</h2>
              </div>
            )}
            {pages > 1 && (
              <nav aria-label="时间线分页" className="my-6 flex items-center justify-center gap-5 text-sm font-bold">
                {archive.page > 1 && <Link href={`?year=${archive.year}&page=${archive.page - 1}`} className="underline">上一页</Link>}
                <span>第 {archive.page} / {pages} 页</span>
                {archive.page < pages && <Link href={`?year=${archive.year}&page=${archive.page + 1}`} className="underline">下一页</Link>}
              </nav>
            )}
          </>
        )}
      </main>
    </ThemedShell>
  )
}
