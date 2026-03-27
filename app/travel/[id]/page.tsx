"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, BookOpen, MapPin, Calendar, ChevronLeft, User, MessageCircle, Send, Trash2, X } from "lucide-react"

interface TravelEntry {
  id: string
  title: string
  content: string
  location: string | null
  travelDate: string
  coverImage: string | null
  images: string
  author: {
    id: string
    nickname: string | null
    username: string
    avatar: string | null
  }
  comments: Comment[]
  _count: {
    comments: number
  }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    nickname: string | null
    username: string
    avatar: string | null
  }
}

export default function TravelDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [entry, setEntry] = useState<TravelEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchEntry()
  }, [params.id])

  const fetchEntry = async () => {
    try {
      const response = await fetch(`/api/travel?id=${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setEntry(data)
      } else {
        router.push("/travel")
      }
    } catch (error) {
      console.error("获取日记失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !session) return

    setSending(true)
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          travelEntryId: params.id,
        }),
      })

      if (response.ok) {
        setNewComment("")
        fetchEntry()
      } else {
        const error = await response.json()
        alert(error.error || "发送失败")
      }
    } catch (error) {
      console.error("添加评论失败:", error)
      alert("发送失败，请重试")
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("确定要删除这篇日记吗？删除后无法恢复。")) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/travel?id=${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/travel")
      } else {
        const error = await response.json()
        alert(error.error || "删除失败")
      }
    } catch (error) {
      console.error("删除日记失败:", error)
      alert("删除失败，请重试")
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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

  if (!session || !entry) {
    return null
  }

  const isAuthor = session.user.id === entry.author.id

  return (
    <div className="min-h-screen">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 glass border-b border-[var(--theme-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/travel"
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
            {isAuthor && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                title="删除日记"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-[var(--theme-surface)] rounded-2xl overflow-hidden shadow-lg border border-[var(--theme-border)]">
          {/* 封面图 */}
          {entry.coverImage ? (
            <div className="aspect-video">
              <img
                src={entry.coverImage}
                alt={entry.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
              <BookOpen className="w-24 h-24 text-blue-300" />
            </div>
          )}

          {/* 内容 */}
          <div className="p-8">
            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--theme-text-muted)] mb-6">
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
            <h1 className="text-3xl font-bold mb-6">{entry.title}</h1>

            {/* 作者信息 */}
            <div className="flex items-center space-x-3 mb-8 pb-8 border-b border-[var(--theme-border)]">
              {entry.author.avatar ? (
                <img
                  src={entry.author.avatar}
                  alt={entry.author.nickname || entry.author.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[var(--theme-primary)] flex items-center justify-center">
                  <span className="text-white font-medium text-lg">
                    {(entry.author.nickname || entry.author.username)[0]}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold">{entry.author.nickname || entry.author.username}</p>
                <p className="text-sm text-[var(--theme-text-muted)]">日记作者</p>
              </div>
            </div>

            {/* 正文 */}
            <div className="prose prose-lg max-w-none mb-8">
              <p className="whitespace-pre-wrap text-[var(--theme-text)] leading-relaxed">
                {entry.content}
              </p>
            </div>
          </div>
        </article>

        {/* 评论区 */}
        <div className="mt-8 bg-[var(--theme-surface)] rounded-2xl p-6 shadow-lg border border-[var(--theme-border)]">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-[var(--theme-primary)]" />
            留言 ({entry.comments.length})
          </h2>

          {/* 评论输入 */}
          <form onSubmit={handleAddComment} className="mb-6">
            <div className="flex space-x-4">
              {session.user.avatar ? (
                <img
                  src={session.user.avatar}
                  alt={session.user.nickname || session.user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)] flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="写下您的留言..."
                  className="input-field w-full min-h-[80px] resize-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-[var(--theme-text-muted)]">
                    {newComment.length}/500
                  </span>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || sending}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sending ? "发送中..." : "发送留言"}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* 评论列表 */}
          <div className="space-y-4">
            {entry.comments.map((comment) => (
              <div
                key={comment.id}
                className="flex space-x-4 p-4 rounded-xl bg-[var(--theme-secondary)]"
              >
                {comment.author.avatar ? (
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.nickname || comment.author.username}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">
                      {(comment.author.nickname || comment.author.username)[0]}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">
                        {comment.author.nickname || comment.author.username}
                      </span>
                      {comment.author.id === session.user.id && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--theme-primary)] text-white text-xs">
                          我
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-[var(--theme-text-muted)]">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-[var(--theme-text)] whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {entry.comments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[var(--theme-text-muted)]">还没有留言，来写第一条吧！</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
