"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Plus, ChevronLeft, MapPin, Calendar, MessageCircle, Trash2, User, BookOpen } from "lucide-react"

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--theme-text-muted)]">加载中...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
    <div className="min-h-screen">
      {/* 顶部导航 */}
      <header className="border-b border-[var(--theme-border)]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 -ml-2 hover:bg-[var(--theme-bg-tertiary)] rounded transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <Link href="/dashboard" className="text-lg font-semibold">
                成长记录
              </Link>
            </div>
            <Link
              href="/travel/new"
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-1" />
              写日记
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* 页面标题 */}
        <div className="mb-12">
          <h1 className="text-2xl font-bold mb-2">旅行日记</h1>
          <p className="text-[var(--theme-text-secondary)]">
            记录旅途中的美好时光
          </p>
        </div>

        {/* 日记列表 - 博客风格 */}
        <div className="space-y-0">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="article-card group"
            >
              {/* 日期和操作 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4 text-sm text-[var(--theme-text-muted)]">
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
                    className="p-1.5 text-[var(--theme-text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 标题 */}
              <Link href={`/travel/${entry.id}`}>
                <h2 className="text-lg font-semibold mb-2 hover:text-[var(--theme-accent)] transition-colors">
                  {entry.title}
                </h2>
              </Link>

              {/* 摘要 */}
              <p className="text-[var(--theme-text-secondary)] text-sm mb-3 line-clamp-2">
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
                      <User className="w-3 h-3 text-[var(--theme-text-muted)]" />
                    )}
                  </div>
                  <span className="text-[var(--theme-text-muted)]">
                    {entry.author.nickname || entry.author.username}
                  </span>
                </div>
                <Link
                  href={`/travel/${entry.id}`}
                  className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors flex items-center gap-1"
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
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 mx-auto text-[var(--theme-text-muted)] mb-4" />
            <h3 className="text-lg font-medium mb-2">还没有日记</h3>
            <p className="text-[var(--theme-text-muted)] mb-6">
              开始记录你们的旅行故事吧
            </p>
            <Link
              href="/travel/new"
              className="btn btn-primary"
            >
              写第一篇日记
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
