"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Cake, Camera, Clock3, Map, MessageCircle } from "lucide-react"
import { ThemedHeader, ThemedLoading, ThemedPageHero, ThemedShell, useCurrentThemeStyle } from "@/components/ui/theme-shell"

type RecentItem = {
  id: string
  type: "photo" | "travel" | "birthday" | "message"
  title: string
  detail: string
  date: string
  href: string
  author: string
}

type Summary = {
  recent: RecentItem[]
}

const typeMeta = {
  photo: { label: "照片", icon: Camera },
  travel: { label: "旅行", icon: Map },
  birthday: { label: "生日", icon: Cake },
  message: { label: "留言", icon: MessageCircle },
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function TimelinePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const current = useCurrentThemeStyle()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return

    async function loadSummary() {
      try {
        const response = await fetch("/api/memory/summary")
        if (response.ok) {
          setSummary(await response.json())
        }
      } catch (error) {
        console.error("获取时间线失败:", error)
      } finally {
        setLoading(false)
      }
    }

    void loadSummary()
  }, [status])

  if (status === "loading" || loading) {
    return <ThemedLoading />
  }

  if (!session) return null

  const items = summary?.recent ?? []
  const years = Array.from(new Set(items.map((item) => new Date(item.date).getFullYear()))).sort((a, b) => b - a)

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

        <div className="my-6 flex flex-wrap gap-2">
          {years.length ? years.map((year) => (
            <a key={year} href={`#year-${year}`} className={`rounded-full border px-4 py-2 text-sm font-black ${current.pickerCard}`}>
              {year}
            </a>
          )) : (
            <span className={`rounded-full border px-4 py-2 text-sm font-black ${current.pickerCard}`}>
              暂无年份
            </span>
          )}
        </div>

        <section className="space-y-5">
          {items.map((item) => {
            const meta = typeMeta[item.type]
            const Icon = meta.icon
            const year = new Date(item.date).getFullYear()
            return (
              <article key={`${item.type}-${item.id}`} id={`year-${year}`} className={`grid gap-4 rounded-[1.5rem] border p-5 sm:grid-cols-[160px_1fr] ${current.card}`}>
                <div className={`text-sm font-black ${current.secondaryText}`}>
                  {formatDate(item.date)}
                </div>
                <div>
                  <p className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${current.pickerCard}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {meta.label}
                  </p>
                  <h2 className="break-keep text-xl font-black">{item.title}</h2>
                  <p className={`mt-2 text-sm font-semibold ${current.secondaryText}`}>{item.detail} · {item.author}</p>
                  <Link href={item.href} className="mt-4 inline-flex text-sm font-black underline underline-offset-4">
                    查看详情
                  </Link>
                </div>
              </article>
            )
          })}
        </section>

        {items.length === 0 && (
          <div className={`mt-6 rounded-[2rem] border py-16 text-center ${current.pickerCard}`}>
            <Clock3 className="mx-auto mb-4 h-10 w-10" />
            <h2 className="text-lg font-black">还没有时间线记录</h2>
            <p className={`mt-2 ${current.secondaryText}`}>上传照片、写旅行记录或添加生日影像后会自动出现在这里。</p>
          </div>
        )}
      </main>
    </ThemedShell>
  )
}
