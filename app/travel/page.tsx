"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Plus, MapPin, Calendar, Trash2, User, BookOpen } from "lucide-react"
import { ThemedHeader, ThemedLoading, ThemedPageHero, ThemedShell, useCurrentThemeStyle } from "@/components/ui/theme-shell"

interface TravelEntry {
  id: string
  title: string
  content: string
  location: string | null
  travelDate: string
  coverImage: string | null
  author: {
    id: string
    nickname: string | null
    username: string
    avatar: string | null
  }
  _count: {
    comments: number
  }
}

export default function TravelPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const current = useCurrentThemeStyle()
  const [entries, setEntries] = useState<TravelEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const fetchEntries = useCallback(async () => {
    try {
      const response = await fetch("/api/travel")
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error("获取日记失败:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchEntries()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [fetchEntries])

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这篇日记吗？")) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/travel?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setEntries(entries.filter(e => e.id !== id))
      } else {
        const error = await response.json()
        alert(error.error || "删除失败")
      }
    } catch (error) {
      console.error("删除日记失败:", error)
      alert("删除失败，请重试")
    } finally {
      setDeleting(null)
    }
  }

  if (status === "loading" || loading) {
    return <ThemedLoading />
  }

  if (!session) {
    return null
  }

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  return (
    <ThemedShell maxWidth="max-w-4xl">
      <ThemedHeader
        title="旅行日记"
        action={
          <Link href="/travel/new" className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black transition ${current.primaryButton}`}>
            <Plus className="h-4 w-4" />
            写日记
          </Link>
        }
      />

      <main>
        <ThemedPageHero
          eyebrow="Travel Journal"
          title="旅行日记"
          icon={<BookOpen className="h-4 w-4" />}
        />

        {/* 日记列表 - 博客风格 */}
        <div className="mt-6 space-y-4">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className={`group rounded-[1.5rem] border p-5 transition ${current.card}`}
            >
              {/* 日期和操作 */}
              <div className="flex items-center justify-between mb-2">
                <div className={`flex flex-wrap items-center gap-4 text-sm font-bold ${current.secondaryText}`}>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateShort(entry.travelDate)}
                  </span>
                  {entry.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {entry.location}
                    </span>
                  )}
                </div>
                {entry.author.id === session.user.id && (
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={deleting === entry.id}
                    className="rounded-full p-1.5 opacity-0 transition-all hover:bg-red-500 hover:text-white group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 标题 */}
              <Link href={`/travel/${entry.id}`}>
                <h2 className="mb-2 text-xl font-black transition">
                  {entry.title}
                </h2>
              </Link>

              {/* 摘要 */}
              <p className={`mb-4 line-clamp-2 text-sm leading-6 ${current.secondaryText}`}>
                {entry.content}
              </p>

              {/* 底部信息 */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--theme-bg-tertiary)] flex items-center justify-center">
                    {entry.author.avatar ? (
                      <img
                        src={entry.author.avatar}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                    <User className="w-3 h-3" />
                    )}
                  </div>
                  <span className={current.secondaryText}>
                    {entry.author.nickname || entry.author.username}
                  </span>
                </div>
                <Link
                  href={`/travel/${entry.id}`}
                  className={`flex items-center gap-1 font-bold transition ${current.secondaryText}`}
                >
                  {entry._count.comments} 条回复
                  <span className="ml-1">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* 空状态 */}
        {entries.length === 0 && (
          <div className={`mt-6 rounded-[2rem] border py-16 text-center ${current.pickerCard}`}>
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${current.cardIcon}`}>
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="mb-2 text-lg font-black">还没有日记</h3>
            <p className={`mb-6 ${current.secondaryText}`}>
              开始记录你们的旅行故事吧
            </p>
            <Link
              href="/travel/new"
              className={`inline-flex rounded-full px-5 py-3 font-black transition ${current.primaryButton}`}
            >
              写第一篇日记
            </Link>
          </div>
        )}
      </main>
    </ThemedShell>
  )
}
