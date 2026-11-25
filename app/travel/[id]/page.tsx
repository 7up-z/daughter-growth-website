"use client"

import Image from "next/image"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { EntryPlaceEditor } from "@/components/map/entry-place-editor"
import { placeName, type EntryPlace } from "@/lib/entry-place"
import { User, MessageCircle, Send, Trash2 } from "lucide-react"
import { ThemedHeader, ThemedLoading, ThemedShell, useCurrentThemeStyle } from "@/components/ui/theme-shell"

interface TravelEntry {
  id: string
  title: string
  content: string
  location: string | null
  place: EntryPlace | null
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

export default function TravelDetailPage() {
  const { id } = useParams<{ id: string }>()
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

  const fetchEntry = useCallback(async () => {
    try {
      const response = await fetch(`/api/travel?id=${id}`)
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
  }, [id, router])

  useEffect(() => {
    if (status !== "authenticated") return
    const timer = window.setTimeout(() => void fetchEntry(), 0)
    return () => window.clearTimeout(timer)
  }, [status, fetchEntry])

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
          travelEntryId: id,
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
      const response = await fetch(`/api/travel?id=${id}`, {
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
      timeZone: "Asia/Shanghai",
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
    <ThemedShell>
      <ThemedHeader
        backHref="/travel"
        backLabel="返回旅行日记"
        title="旅行日记"
        action={isAuthor && (
          <button
                onClick={handleDelete}
                disabled={deleting}
                className="family-icon-button"
                title="删除日记"
              >
                <Trash2 className="w-5 h-5" />
              </button>
        )}
      />

      <main className="mt-5">
        <article className="travel-article">
          <header className="travel-article-heading">
            <div>
              <h1 className="yearbook-display">{entry.title}</h1>
              <div className="editorial-meta">
                <time dateTime={entry.travelDate}>{formatDate(entry.travelDate)}</time>
                {(entry.place || entry.location) && <span className="editorial-highlight">{entry.place ? placeName(entry.place) : entry.location}</span>}
                <span>{entry.author.nickname || entry.author.username}</span>
                <a href="#travel-comments"><MessageCircle size={16} aria-hidden="true" /> {entry._count.comments} 条留言</a>
              </div>
            </div>
            <Image className="editorial-ornament" src="/images/risograph-shell.webp" alt="" width={158} height={158} />
          </header>
          {entry.coverImage && <img className="travel-article-image" src={entry.coverImage} alt="" />}
          <div className="travel-article-spread">
            <p className="editorial-prose">{entry.content}</p>
            {(entry.place || entry.location || session?.user.role === "admin" || session?.user.id === entry.author.id) && (
              <aside className="travel-place-note" aria-label="旅行地点">
                <EntryPlaceEditor key={entry.id} type="travel" id={entry.id} place={entry.place}
                  legacyLabel={entry.location} canEdit={session?.user.role === "admin" || session?.user.id === entry.author.id}
                  onSaved={(place) => setEntry((previous) => previous ? { ...previous, place } : previous)} />
              </aside>
            )}
          </div>
        </article>

        {/* 评论区 */}
        <div id="travel-comments" className="travel-comments">
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
