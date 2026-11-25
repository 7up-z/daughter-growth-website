"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { PlaceFields } from "@/components/map/place-fields"
import { parseEntryPlace, type PlaceDraft } from "@/lib/entry-place"
import Link from "next/link"
import { Save, Calendar } from "lucide-react"
import { ImageUploader } from "@/components/ui/image-uploader"
import { ThemedHeader, ThemedLoading, ThemedPageHero, ThemedShell, useCurrentThemeStyle } from "@/components/ui/theme-shell"

export default function NewTravelPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const current = useCurrentThemeStyle()
  const [loading, setLoading] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [place, setPlace] = useState<PlaceDraft | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    travelDate: new Date().toISOString().split("T")[0],
    coverImage: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || !formData.title.trim() || !formData.content.trim()) return

    setLoading(true)
    setSaveError("")
    try {
      const response = await fetch("/api/travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, place: parseEntryPlace(place) }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "保存旅行记录失败")
      } else {
        const data = await response.json()
        router.push(`/travel/${data.id}`)
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "保存旅行记录失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return <ThemedLoading label="正在加载..." />
  }

  if (!session) {
    return null
  }

  return (
    <ThemedShell maxWidth="max-w-4xl">
      <ThemedHeader
        backHref="/travel"
        title="写旅行记录"
        action={
          <button
              type="submit"
              form="new-memory-entry"
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black transition disabled:opacity-60 ${current.primaryButton}`}
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "保存中..." : "发布"}</span>
            </button>
        }
      />

      <main>
        <ThemedPageHero
          title="写旅行记录"
        />
        <div className={`mt-6 rounded-[2rem] border p-6 sm:p-8 ${current.card}`}>
          <form id="new-memory-entry" onSubmit={handleSubmit} className="space-y-6">
            {saveError && <p className="place-submit-error" role="alert">{saveError}</p>}
            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium mb-2">标题</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input text-lg"
                placeholder="给这次旅行起个标题..."
                required
              />
            </div>

            <label className="block">
              <span className="mb-2 flex items-center text-sm font-medium"><Calendar className="mr-1 h-4 w-4" /> 旅行日期</span>
              <input type="date" value={formData.travelDate}
                onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                className="input" required />
            </label>

            <PlaceFields value={place} onChange={setPlace} />

            <ImageUploader
              value={formData.coverImage}
              onChange={(url) => setFormData({ ...formData, coverImage: url })}
              label="封面图片"
              previewClassName="aspect-video"
            />

            {/* 内容 */}
            <div>
              <label className="block text-sm font-medium mb-2">日记内容</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="input min-h-[300px] resize-none"
                placeholder="记录这次旅行的美好回忆..."
                required
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-[var(--theme-border)]">
              <Link href="/travel" className="rounded-full border border-current/20 px-6 py-2 font-black transition hover:bg-current/10">
                取消
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.title.trim() || !formData.content.trim()}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-2 font-black transition disabled:opacity-60 ${current.primaryButton}`}
              >
                <Save className="w-5 h-5" />
                <span>{loading ? "保存中..." : "发布日记"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </ThemedShell>
  )
}
