"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Send, Trash2 } from "lucide-react"
import { ThemedHeader, ThemedLoading, ThemedPageHero, ThemedShell } from "@/components/ui/theme-shell"

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
  const linkedMessage = useSearchParams().get("message")
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const fetchMessages = useCallback(async () => {
    setLoadError(false)
    try {
      const response = await fetch("/api/messages")
      if (!response.ok) throw new Error("无法读取留言")
      setMessages(await response.json())
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status !== "authenticated") return
    const timer = window.setTimeout(() => void fetchMessages(), 0)
    return () => window.clearTimeout(timer)
  }, [status, fetchMessages])

  useEffect(() => {
    if (!linkedMessage || loading) return
    document.getElementById(`message-${linkedMessage}`)?.scrollIntoView({ block: "center" })
  }, [linkedMessage, loading, messages])

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
        setMessages((previous) => previous.filter((message) => message.id !== id))
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
      timeZone: "Asia/Shanghai",
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

  function renderLetter(message: Message, featured = false) {
    return (
      <article id={`message-${message.id}`} key={message.id}
        className={`family-letter ${featured ? "family-letter-feature" : ""}`} data-linked={linkedMessage === message.id || undefined}>
        <blockquote>{message.content}</blockquote>
        <footer>
          <span>{message.author.nickname || message.author.username}</span>
          {message.author.id === session?.user.id && <span>（我）</span>}
          <time dateTime={message.createdAt}>{formatDate(message.createdAt)}</time>
          {canDelete(message) && (
            <button type="button" className="family-icon-button" aria-label="删除留言" disabled={deleting === message.id}
              onClick={() => void handleDeleteMessage(message.id)}>
              <Trash2 size={16} aria-hidden="true" />
            </button>
          )}
        </footer>
      </article>
    )
  }

  return (
    <ThemedShell>
      <ThemedHeader title="家庭留言" />
      <main>
        <ThemedPageHero title="家庭留言" description="那些没来得及当面说的话，留在这里，等家人慢慢读。" />
        <div className="family-letter-spread">
          <div>
            {loadError && <p role="alert" className="editorial-empty">暂时无法读取留言。 <button type="button" className="family-text-link" onClick={() => void fetchMessages()}>重试</button></p>}
            {!loadError && !messages.length && <p className="editorial-empty">还没有留言。写一封短笺，留给家人慢慢读。</p>}
            {!loadError && messages[0] && renderLetter(messages[0], true)}
          </div>
          <form className="family-letter-form" onSubmit={handleSendMessage}>
            <label className="yearbook-display" htmlFor="family-letter">给家人留句话</label>
            <textarea id="family-letter" className="input" value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)} placeholder="想说的话，从这里写起。" maxLength={500} />
            <div className="family-letter-submit">
              <span>{newMessage.length}/500</span>
              <button type="submit" className="family-button family-button-primary" disabled={!newMessage.trim() || sending}>
                <Send size={17} aria-hidden="true" /> {sending ? "发送中…" : "发送留言"}
              </button>
            </div>
          </form>
        </div>
        {!loadError && messages.length > 1 && <div className="family-letter-index">{messages.slice(1).map((message) => renderLetter(message))}</div>}
      </main>
    </ThemedShell>
  )
}
