"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BookOpen, MapPin, Calendar, User, MessageCircle, Send, Trash2 } from "lucide-react"
import { ThemedHeader, ThemedLoading, ThemedShell, useCurrentThemeStyle } from "@/components/ui/theme-shell"

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
  const current = useCurrentThemeStyle()
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

  async function fetchEntry() {
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
    return <ThemedLoading label="正在加载..." />
  }

  if (!session || !entry) {
    return null
  }

  const isAuthor = session.user.id === entry.author.id

  return (
    <ThemedShell maxWidth="max-w-4xl">
      <ThemedHeader
        backHref="/travel"
        title="旅行日记"
        action={isAuthor && (
          <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-full bg-red-500 p-2 text-white transition hover:bg-red-600 disabled:opacity-50"
                title="删除日记"
              >
                <Trash2 className="w-5 h-5" />
              </button>
        )}
      />

      <main className="mt-5">
        <article className={`overflow-hidden rounded-[2rem] border ${current.card}`}>
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
            <div className={`flex aspect-video items-center justify-center ${current.preview}`}>
              <BookOpen className="w-24 h-24 opacity-45" />
            </div>
          )}

          {/* 内容 */}
          <div className="p-8">
            {/* 元信息 */}
            <div className={`mb-6 flex flex-wrap items-center gap-4 text-sm font-bold ${current.secondaryText}`}>
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
            <h1 className="mb-6 text-3xl font-black">{entry.title}</h1>

            {/* 作者信息 */}
            <div className="flex items-center space-x-3 mb-8 pb-8 border-b border-[var(--theme-border)]">
              {entry.author.avatar ? (
                <img
                  src={entry.author.avatar}
                  alt={entry.author.nickname || entry.author.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${current.cardIcon}`}>
                  <span className="text-lg font-black">
                    {(entry.author.nickname || entry.author.username)[0]}
                  </span>
                </div>
              )}
              <div>
                <p className="font-black">{entry.author.nickname || entry.author.username}</p>
                <p className={`text-sm ${current.secondaryText}`}>日记作者</p>
              </div>
            </div>

            {/* 正文 */}
            <div className="mb-8 max-w-none">
              <p className="whitespace-pre-wrap text-lg leading-8">
                {entry.content}
              </p>
            </div>
          </div>
        </article>

        {/* 评论区 */}
        <div className={`mt-6 rounded-[2rem] border p-6 ${current.card}`}>
          <h2 className="mb-6 flex items-center text-xl font-black">
            <MessageCircle className="mr-2 h-5 w-5" />
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
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${current.cardIcon}`}>
                  <User className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="写下您的留言..."
                  className="input min-h-[80px] resize-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-sm font-bold ${current.secondaryText}`}>
                    {newComment.length}/500
                  </span>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || sending}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2 font-black transition disabled:opacity-60 ${current.primaryButton}`}
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
                className={`flex space-x-4 rounded-[1.25rem] border border-current/10 p-4 ${current.pickerCard}`}
              >
                {comment.author.avatar ? (
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.nickname || comment.author.username}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${current.cardIcon}`}>
                    <span className="font-black">
                      {(comment.author.nickname || comment.author.username)[0]}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-black">
                        {comment.author.nickname || comment.author.username}
                      </span>
                      {comment.author.id === session.user.id && (
                        <span className="rounded-full bg-current/10 px-2 py-0.5 text-xs font-black">
                          我
                        </span>
                      )}
                    </div>
                    <span className={`text-sm ${current.secondaryText}`}>
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className={`whitespace-pre-wrap ${current.secondaryText}`}>
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {entry.comments.length === 0 && (
            <div className="text-center py-8">
              <p className={current.secondaryText}>还没有留言，来写第一条吧！</p>
            </div>
          )}
        </div>
      </main>
    </ThemedShell>
  )
}
