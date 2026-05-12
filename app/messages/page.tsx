"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { MessageCircle, Send, User, Trash2 } from "lucide-react"
import { ThemedHeader, ThemedLoading, ThemedPageHero, ThemedShell, useCurrentThemeStyle } from "@/components/ui/theme-shell"

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
  const current = useCurrentThemeStyle()
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

  async function fetchMessages() {
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
    const isAdmin = session.user.role === "admin"
    const isAuthor = message.author.id === session.user.id
    return isAdmin || isAuthor
  }

  if (status === "loading" || loading) {
    return <ThemedLoading />
  }

  if (!session) {
    return null
  }

  return (
    <ThemedShell maxWidth="max-w-4xl">
      <ThemedHeader title="留言板" />

      <main>
        <ThemedPageHero
          eyebrow="Family Notes"
          title="留言板"
          icon={<MessageCircle className="h-4 w-4" />}
        />

        {/* 留言输入框 */}
        <div className={`my-6 rounded-[1.5rem] border p-5 sm:p-6 ${current.card}`}>
          <form onSubmit={handleSendMessage}>
            <div className="flex items-start gap-4">
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full ${current.cardIcon}`}>
                {session.user.avatar ? (
                  <img
                    src={session.user.avatar}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5" />
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
                  <span className={`text-sm font-bold ${current.secondaryText}`}>
                    {newMessage.length}/500
                  </span>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2 font-black transition disabled:opacity-60 ${current.primaryButton}`}
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
            <div key={message.id} className={`group rounded-[1.5rem] border p-5 transition ${current.card}`}>
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full ${current.cardIcon}`}>
                  {message.author.avatar ? (
                    <img
                      src={message.author.avatar}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-black">
                      {(message.author.nickname || message.author.username)[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black">
                        {message.author.nickname || message.author.username}
                      </span>
                      {message.author.id === session.user.id && (
                        <span className="rounded-full bg-current/10 px-2 py-0.5 text-xs font-black">
                          我
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm ${current.secondaryText}`}>
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
                  <p className={`whitespace-pre-wrap ${current.secondaryText}`}>
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {messages.length === 0 && (
          <div className={`rounded-[2rem] border py-16 text-center ${current.pickerCard}`}>
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${current.cardIcon}`}>
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="mb-2 text-lg font-black">还没有留言</h3>
            <p className={current.secondaryText}>
              成为第一个留言的人吧
            </p>
          </div>
        )}
      </main>
    </ThemedShell>
  )
}
