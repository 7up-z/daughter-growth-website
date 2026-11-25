"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { placeName, type EntryPlace } from "@/lib/entry-place"
import Link from "next/link"
import { Plus, MapPin, Trash2, ArrowRight } from "lucide-react"
import { ThemedHeader, ThemedLoading, ThemedPageHero, ThemedShell } from "@/components/ui/theme-shell"

interface TravelEntry {
  id: string
  title: string
  content: string
  location: string | null
  place: EntryPlace | null
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
  const [loadError, setLoadError] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const fetchEntries = useCallback(async () => {
    setLoadError(false)
    try {
      const response = await fetch("/api/travel")
      if (!response.ok) throw new Error("无法读取旅行日记")
      setEntries(await response.json())
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status !== "authenticated") return
    const timer = window.setTimeout(() => {
      void fetchEntries()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [status, fetchEntries])

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这篇日记吗？")) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/travel?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setEntries((previous) => previous.filter((entry) => entry.id !== id))
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

  const lead = entries.find((entry) => entry.coverImage) ?? entries[0]
  const rest = entries.filter((entry) => entry !== lead)
  const formatDate = new Intl.DateTimeFormat("zh-CN", { dateStyle: "long", timeZone: "Asia/Shanghai" })

  function renderStory(entry: TravelEntry, featured = false) {
    const location = entry.place ? placeName(entry.place) : entry.location
    const href = `/travel/${entry.id}`
    return (
      <article key={entry.id} className={`travel-story ${featured ? "travel-story-feature" : ""}`}>
        {featured && entry.coverImage && (
          <Link href={href} className="travel-story-image" aria-label={entry.title}>
            <img src={entry.coverImage} alt="" />
          </Link>
        )}
        <div className="travel-story-copy">
          <div className="editorial-meta">
            <time dateTime={entry.travelDate}>{formatDate.format(new Date(entry.travelDate))}</time>
            {location && <span><MapPin size={15} aria-hidden="true" /> {location}</span>}
          </div>
          <h2 className="yearbook-display"><Link href={href}>{entry.title}</Link></h2>
          {entry.content && <p className="travel-story-excerpt">{entry.content}</p>}
          <div className="travel-story-byline">
            <span>{entry.author.nickname || entry.author.username} · {entry._count.comments} 条留言</span>
            {featured && <Link href={href} className="family-text-link">阅读日记 <ArrowRight size={17} aria-hidden="true" /></Link>}
            {entry.author.id === session?.user.id && (
              <button type="button" className="family-icon-button" aria-label={`删除日记 ${entry.title}`}
                disabled={deleting === entry.id} onClick={() => void handleDelete(entry.id)}>
                <Trash2 size={17} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </article>
    )
  }

  return (
    <ThemedShell>
      <ThemedHeader title="旅行日记" action={
        <Link href="/travel/new" className="family-button family-button-primary">
          <Plus size={17} aria-hidden="true" /> 写旅行日记
        </Link>
      } />
      <main>
        <ThemedPageHero title="旅行日记" description="风从陌生的街巷吹来，我们把沿途的晴雨和小事写在这里。" />
        {loadError && <p role="alert" className="editorial-empty">暂时无法读取旅行日记。 <button type="button" className="family-text-link" onClick={() => void fetchEntries()}>重试</button></p>}
        {!loadError && !lead && (
          <div className="editorial-empty">
            <h2 className="yearbook-display">还没有旅行记录</h2>
            <Link href="/travel/new" className="family-text-link">写第一篇日记 <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        )}
        {!loadError && lead && renderStory(lead, true)}
        {!loadError && !!rest.length && <div className="travel-index">{rest.map((entry) => renderStory(entry))}</div>}
      </main>
    </ThemedShell>
  )
}
