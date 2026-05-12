"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, Save, MapPin, Calendar } from "lucide-react"
import { ImageUploader } from "@/components/ui/image-uploader"
import { ThemedHeader, ThemedLoading, ThemedPageHero, ThemedShell, useCurrentThemeStyle } from "@/components/ui/theme-shell"

export default function NewTravelPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const current = useCurrentThemeStyle()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    location: "",
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
    if (!formData.title.trim() || !formData.content.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/travel/${data.id}`)
      }
    } catch (error) {
      console.error("创建日记失败:", error)
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
        title="写旅行日记"
        action={
          <button
              onClick={handleSubmit}
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
          eyebrow="New Journal"
          title="写旅行日记"
          description="记录地点、日期、封面和当天的细节，把一次出发变成可以反复翻看的故事。"
          icon={<BookOpen className="h-4 w-4" />}
        />
        <div className={`mt-6 rounded-[2rem] border p-6 sm:p-8 ${current.card}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* 日期和地点 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  旅行日期
                </label>
                <input
                  type="date"
                  value={formData.travelDate}
                  onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  地点
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input"
                  placeholder="例如：三亚·亚龙湾"
                />
              </div>
            </div>

            {/* 封面图片上传 */}
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
