"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { CalendarHeart, Cake, Camera, Map, MessageCircle } from "lucide-react"
import { useCurrentThemeStyle } from "@/components/ui/theme-shell"

type RecentItem = {
  id: string
  type: "photo" | "travel" | "birthday" | "message"
  title: string
  detail: string
  date: string
  href: string
  imageUrl: string | null
  author: string
}

type Summary = {
  counts: {
    photos: number
    travels: number
    birthdayVideos: number
    messages: number
  }
  recent: RecentItem[]
}

const demoSummary: Summary = {
  counts: {
    photos: 128,
    travels: 16,
    birthdayVideos: 8,
    messages: 42,
  },
  recent: [
    {
      id: "demo-photo",
      type: "photo",
      title: "春日相册新增了几张照片",
      detail: "摄影相册",
      date: "2026-05-20",
      href: "/login",
      imageUrl: "/images/module-photo-album.png",
      author: "家人",
    },
    {
      id: "demo-travel",
      type: "travel",
      title: "最近一次旅行足迹已归档",
      detail: "旅行地图",
      date: "2026-04-18",
      href: "/login",
      imageUrl: "/images/module-travel-diary.png",
      author: "家人",
    },
    {
      id: "demo-message",
      type: "message",
      title: "一条温暖留言等待家人登录查看",
      detail: "家庭留言",
      date: "2026-03-12",
      href: "/login",
      imageUrl: null,
      author: "家人",
    },
  ],
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
    month: "2-digit",
    day: "2-digit",
  })
}

export function RecentActivity({ privateData = false }: { privateData?: boolean }) {
  const current = useCurrentThemeStyle()
  const [summary, setSummary] = useState<Summary | null>(privateData ? null : demoSummary)
  const [failed, setFailed] = useState(false)
  const [retry, setRetry] = useState(0)
  const [loading, setLoading] = useState(privateData)

  useEffect(() => {
    if (!privateData) return

    let mounted = true
    async function loadSummary() {
      try {
        const response = await fetch("/api/memory/summary")
        if (!response.ok) throw new Error("获取近期记录失败")
        const data = await response.json()
        if (mounted) setSummary(data)
      } catch (error) {
        if (mounted) setFailed(true)
        console.error("获取近期记录失败:", error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void loadSummary()
    return () => {
      mounted = false
    }
  }, [privateData, retry])

  const stats = [
    { label: "照片", value: summary?.counts.photos, icon: Camera },
    { label: "旅行", value: summary?.counts.travels, icon: Map },
    { label: "影像", value: summary?.counts.birthdayVideos, icon: Cake },
    { label: "留言", value: summary?.counts.messages, icon: MessageCircle },
  ]

  return (
    <section className={`mt-6 rounded-[2rem] border p-5 sm:p-6 ${current.quote}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={`mb-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${current.pickerCard}`}>
            <CalendarHeart className="h-4 w-4" />
            近期记录
          </p>
          <h2 className="break-keep text-2xl font-black sm:text-3xl">
            {privateData ? "家里的最新动态" : "登录后查看完整家庭动态"}
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:min-w-[360px]">
          {stats.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className={`rounded-[1rem] border px-3 py-3 text-center ${current.pickerCard}`}>
                <Icon className="mx-auto mb-1 h-4 w-4" />
                <p className="text-xl font-black">{loading ? "-" : item.value ?? "—"}</p>
                <p className={`text-xs font-bold ${current.secondaryText}`}>{item.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {failed && (
        <p className="mt-5 text-sm" role="alert">
          暂时无法读取近期记录。 <button type="button" className="font-bold underline" onClick={() => {
            setLoading(true)
            setFailed(false)
            setRetry((value) => value + 1)
          }}>重试</button>
        </p>
      )}
      {privateData && summary?.recent.length === 0 && <p className="mt-5 text-sm">还没有家庭动态。</p>}
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {(summary?.recent ?? []).slice(0, 3).map((item) => {
          const MetaIcon = typeMeta[item.type].icon
          return (
            <Link key={item.id} href={privateData ? item.href : "/login"} className={`group overflow-hidden rounded-[1.25rem] border transition ${current.card}`}>
              <div className="relative aspect-[16/9] overflow-hidden">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    loading="lazy"
                    sizes="(min-width: 768px) 30vw, 92vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className={`flex h-full items-center justify-center ${current.preview}`}>
                    <MetaIcon className="h-10 w-10 opacity-70" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className={`mb-2 flex items-center justify-between gap-3 text-xs font-black ${current.secondaryText}`}>
                  <span className="inline-flex items-center gap-1">
                    <MetaIcon className="h-3.5 w-3.5" />
                    {typeMeta[item.type].label}
                  </span>
                  <span>{privateData && item.type === "birthday" ? `${new Date(item.date).getUTCFullYear()}年` : formatDate(item.date)}</span>
                </div>
                <h3 className="line-clamp-2 min-h-12 text-base font-black leading-6">{item.title}</h3>
                <p className={`mt-2 text-xs font-bold ${current.secondaryText}`}>{item.detail} · {item.author}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

