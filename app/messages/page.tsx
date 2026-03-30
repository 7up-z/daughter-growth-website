"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, MessageCircle, Send, ChevronLeft, User, Trash2 } from "lucide-react"

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

  // 检查是否可以删除留言（管理员或作者本人）
  const canDelete = (message: Message) => {
    if (!session) return false
    const isAdmin = (session.user as any).role === "admin"
    const isAuthor = message.author.id === session.user.id
    return isAdmin || isAuthor
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
            <h1 className="text-lg font-semibold">留言板</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <MessageCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">留言板</h1>
          <p className="text-[var(--theme-text-muted)] max-w-2xl mx-auto">
            在这里留下您的祝福和感想，一起分享成长的喜悦。
          </p>
        </div>

        {/* 留言输入框 */}
        <div className="bg-[var(--theme-surface)] rounded-2xl p-6 shadow-lg border border-[var(--theme-border)] mb-8">
          <form onSubmit={handleSendMessage}>
            <div className="flex items-start space-x-4">
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
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="写下您的留言..."
                  className="input-field w-full min-h-[100px] resize-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-[var(--theme-text-muted)]">
                    {newMessage.length}/500
                  </span>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sending ? "发送中..." : "发送留言"}</span>
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
              className="bg-[var(--theme-surface)] rounded-2xl p-6 shadow-lg border border-[var(--theme-border)] animate-fade-in group relative"
            >
              {/* 删除按钮 */}
              {canDelete(message) && (
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  disabled={deleting === message.id}
                  className="absolute top-4 right-4 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                  title="删除留言"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <div className="flex items-start space-x-4">
                {message.author.avatar ? (
                  <img
                    src={message.author.avatar}
                    alt={message.author.nickname || message.author.username}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">
                      {(message.author.nickname || message.author.username)[0]}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">
                        {message.author.nickname || message.author.username}
                      </span>
                      {message.author.id === session.user.id && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--theme-primary)] text-white text-xs">
                          我
                        </span>
                      )}
                      {(session.user as any).role === "admin" && message.author.id !== session.user.id && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs">
                          管理员可删
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-[var(--theme-text-muted)]">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                  <p className="text-[var(--theme-text)] whitespace-pre-wrap">
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--theme-secondary)] mb-6">
              <MessageCircle className="w-10 h-10 text-[var(--theme-text-muted)]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">还没有留言</h3>
            <p className="text-[var(--theme-text-muted)]">
              成为第一个留言的人吧！
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
