"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { MessageCircle, Send, ChevronLeft, User, Trash2 } from "lucide-react"

interface Message {
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

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages")
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("获取留言失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !session) return

    setSending(true)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      })

      if (response.ok) {
        setNewMessage("")
        fetchMessages()
      } else {
        const error = await response.json()
        alert(error.error || "发送失败")
      }
    } catch (error) {
      console.error("发送留言失败:", error)
      alert("发送失败，请重试")
    } finally {
      setSending(false)
    }
  }

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("确定要删除这条留言吗？")) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/messages?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMessages(messages.filter(m => m.id !== id))
      } else {
        const error = await response.json()
        alert(error.error || "删除失败")
      }
    } catch (error) {
      console.error("删除留言失败:", error)
      alert("删除失败，请重试")
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const canDelete = (message: Message) => {
    if (!session) return false
    const isAdmin = (session.user as any).role === "admin"
    const isAuthor = message.author.id === session.user.id
    return isAdmin || isAuthor
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
            <h1 className="text-lg font-semibold">留言板</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">留言板</h1>
          <p className="text-[var(--theme-text-secondary)]">
            写下您的祝福和感想
          </p>
        </div>

        {/* 留言输入框 */}
        <div className="card p-6 mb-8">
          <form onSubmit={handleSendMessage}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center flex-shrink-0">
                {session.user.avatar ? (
                  <img
                    src={session.user.avatar}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-pink-500" />
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="写下您的留言..."
                  className="input min-h-[100px] resize-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-[var(--theme-text-muted)]">
                    {newMessage.length}/500
                  </span>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? "发送中..." : "发送"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* 留言列表 */}
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="card p-5 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                  {message.author.avatar ? (
                    <img
                      src={message.author.avatar}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-amber-600 font-medium text-sm">
                      {(message.author.nickname || message.author.username)[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {message.author.nickname || message.author.username}
                      </span>
                      {message.author.id === session.user.id && (
                        <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 text-xs">
                          我
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[var(--theme-text-muted)]">
                        {formatDate(message.createdAt)}
                      </span>
                      {canDelete(message) && (
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          disabled={deleting === message.id}
                          className="p-1.5 text-[var(--theme-text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[var(--theme-text-secondary)] whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">还没有留言</h3>
            <p className="text-[var(--theme-text-muted)]">
              成为第一个留言的人吧
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
