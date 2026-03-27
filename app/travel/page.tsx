"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, BookOpen, MapPin, Calendar, ChevronLeft, Plus, MessageCircle, Trash2, User, Send } from "lucide-react"

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

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
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
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这篇日记吗？删除后无法恢复。")) return

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
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 rounded-full bg-[var(--theme-primary)] mx-auto mb-4" />
          </div>
          <p className="text-[var(--theme-text-muted)]">正在加载...</p>
        </div>
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

  return (
    <div className="min-h-screen">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 glass border-b border-[var(--theme-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-lg hover:bg-[var(--theme-secondary)] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)] flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold hidden sm:block">成长记录</span>
              </Link>
            </div>
            <h1 className="text-lg font-semibold">旅行日记</h1>
            <Link
              href="/travel/new"
              className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-accent)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">写日记</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
            <BookOpen className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">旅行日记</h1>
          <p className="text-[var(--theme-text-muted)] max-w-2xl mx-auto">
            记录每一次旅行的美好时光，珍藏那些难忘的瞬间和感动。
          </p>
        </div>

        {/* 日记列表 */}
        <div className="space-y-6">
          {entries.map((entry, index) => (
            <article
              key={entry.id}
              className="bg-[var(--theme-surface)] rounded-2xl overflow-hidden shadow-lg card-hover border border-[var(--theme-border)] animate-fade-in group relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* 删除按钮 - 右上角 */}
              {entry.author.id === session.user.id && (
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={deleting === entry.id}
                  className="absolute top-4 right-4 z-20 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 disabled:opacity-50"
                  title="删除日记"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {/* 封面图 */}
              {entry.coverImage ? (
                <div 
                  className="aspect-video overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/travel/${entry.id}`)}
                >
                  <img
                    src={entry.coverImage}
                    alt={entry.title}
                    className="w-full h-full object-cover image-hover"
                  />
                </div>
              ) : (
                <div 
                  className="aspect-video bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center cursor-pointer"
                  onClick={() => router.push(`/travel/${entry.id}`)}
                >
                  <BookOpen className="w-16 h-16 text-blue-300" />
                </div>
              )}

              {/* 内容 */}
              <div className="p-6">
                {/* 元信息 */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--theme-text-muted)] mb-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(entry.travelDate)}</span>
                  </div>
                  {entry.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{entry.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{entry._count.comments} 条留言</span>
                  </div>
                </div>

                {/* 标题 */}
                <h2 
                  className="text-xl font-bold mb-3 hover:text-[var(--theme-primary)] transition-colors cursor-pointer"
                  onClick={() => router.push(`/travel/${entry.id}`)}
                >
                  {entry.title}
                </h2>

                {/* 摘要 */}
                <p className="text-[var(--theme-text-muted)] line-clamp-3 mb-4">
                  {entry.content}
                </p>

                {/* 底部 */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--theme-border)]">
                  <div className="flex items-center space-x-3">
                    {entry.author.avatar ? (
                      <img
                        src={entry.author.avatar}
                        alt={entry.author.nickname || entry.author.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)] flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {(entry.author.nickname || entry.author.username)[0]}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {entry.author.nickname || entry.author.username}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push(`/travel/${entry.id}`)}
                    className="text-[var(--theme-primary)] hover:underline text-sm font-medium"
                  >
                    阅读更多 →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 空状态 */}
        {entries.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--theme-secondary)] mb-6">
              <BookOpen className="w-10 h-10 text-[var(--theme-text-muted)]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">还没有日记</h3>
            <p className="text-[var(--theme-text-muted)] mb-6">
              开始记录你们的旅行故事吧！
            </p>
            <Link
              href="/travel/new"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>写第一篇日记</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
