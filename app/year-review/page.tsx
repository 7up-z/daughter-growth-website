"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { CalendarHeart, Cake, Camera, Map, MessageCircle } from "lucide-react"
import { ThemedHeader, ThemedLoading, ThemedPageHero, ThemedShell, useCurrentThemeStyle } from "@/components/ui/theme-shell"

type Summary = {
  counts: {
    photos: number
    travels: number
    birthdayVideos: number
    messages: number
  }
  recent: Array<{
    id: string
    type: "photo" | "travel" | "birthday" | "message"
    title: string
    detail: string
    date: string
    href: string
  }>
}

export default function YearReviewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const current = useCurrentThemeStyle()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const year = new Date().getFullYear()

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
        console.error("获取年度回顾失败:", error)
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

  const stats = [
    { label: "照片", value: summary?.counts.photos ?? 0, icon: Camera, href: "/gallery" },
    { label: "旅行", value: summary?.counts.travels ?? 0, icon: Map, href: "/travel" },
    { label: "生日影像", value: summary?.counts.birthdayVideos ?? 0, icon: Cake, href: "/birthday" },
    { label: "家庭留言", value: summary?.counts.messages ?? 0, icon: MessageCircle, href: "/messages" },
  ]

  return (
    <ThemedShell maxWidth="max-w-6xl">
      <ThemedHeader title="年度回顾" />
      <main>
        <ThemedPageHero
          eyebrow={`${year} Family Review`}
          title={`${year} 家庭年度回顾`}
          description="用真实记录汇总这一年的照片、影像、留言和旅行足迹。"
          icon={<CalendarHeart className="h-4 w-4" />}
        />

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.label} href={item.href} className={`rounded-[1.5rem] border p-5 transition ${current.card}`}>
                <span className={`mb-5 flex h-12 w-12 items-center justify-center rounded-full ${current.cardIcon}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <p className="text-4xl font-black">{item.value}</p>
                <p className={`mt-2 text-sm font-bold ${current.secondaryText}`}>{item.label}</p>
              </Link>
            )
          })}
        </section>

        <section className={`mt-6 rounded-[2rem] border p-5 sm:p-6 ${current.quote}`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={`mb-3 inline-flex rounded-full border px-4 py-2 text-sm font-black ${current.pickerCard}`}>
                年度精选
              </p>
              <h2 className="break-keep text-2xl font-black">最近被写入记忆册的片段</h2>
            </div>
            <Link href="/timeline" className="text-sm font-black underline underline-offset-4">
              查看完整时间线
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {(summary?.recent ?? []).slice(0, 6).map((item) => (
              <Link key={`${item.type}-${item.id}`} href={item.href} className={`rounded-[1.25rem] border p-4 transition ${current.pickerCard}`}>
                <p className={`text-xs font-black uppercase ${current.secondaryText}`}>
                  {new Date(item.date).toLocaleDateString("zh-CN")}
                </p>
                <h3 className="mt-2 line-clamp-2 min-h-12 font-black leading-6">{item.title}</h3>
                <p className={`mt-3 text-sm font-bold ${current.secondaryText}`}>{item.detail}</p>
              </Link>
            ))}
          </div>

          {(summary?.recent.length ?? 0) === 0 && (
            <div className={`mt-5 rounded-[1.5rem] border p-8 text-center ${current.pickerCard}`}>
              <p className="font-black">还没有年度精选</p>
              <p className={`mt-2 text-sm ${current.secondaryText}`}>新的照片、旅行、留言和生日影像会自动汇入这里。</p>
            </div>
          )}
        </section>
      </main>
    </ThemedShell>
  )
}

