"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, BookOpen, ChevronLeft, Save, MapPin, Calendar } from "lucide-react"
import { ImageUploader } from "@/components/ui/image-uploader"

export default function NewTravelPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
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
            <h1 className="text-lg font-semibold">写旅行日记</h1>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
              className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-accent)] transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "保存中..." : "发布"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[var(--theme-surface)] rounded-2xl p-8 shadow-lg border border-[var(--theme-border)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium mb-2">标题</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field w-full text-lg"
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
                  className="input-field w-full"
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
                  className="input-field w-full"
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
                className="input-field w-full min-h-[300px] resize-none"
                placeholder="记录这次旅行的美好回忆..."
                required
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-[var(--theme-border)]">
              <Link
                href="/travel"
                className="px-6 py-2 rounded-lg border border-[var(--theme-border)] hover:bg-[var(--theme-secondary)] transition-colors"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.title.trim() || !formData.content.trim()}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? "保存中..." : "发布日记"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
