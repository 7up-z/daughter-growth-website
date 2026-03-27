"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, Camera, ChevronLeft, Save, Calendar, Tag } from "lucide-react"
import { ImageUploader } from "@/components/ui/image-uploader"

const categories = [
  { id: "landscape", name: "风景" },
  { id: "portrait", name: "人物" },
  { id: "life", name: "生活" },
  { id: "travel", name: "旅行" },
]

export default function NewPhotoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    photoDate: new Date().toISOString().split("T")[0],
    category: "life",
    tags: "",
    thoughts: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.imageUrl.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        }),
      })

      if (response.ok) {
        router.push("/photos")
      }
    } catch (error) {
      console.error("上传照片失败:", error)
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
                href="/photos"
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
            <h1 className="text-lg font-semibold">上传照片</h1>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.title.trim() || !formData.imageUrl.trim()}
              className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-accent)] transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "上传中..." : "发布"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[var(--theme-surface)] rounded-2xl p-8 shadow-lg border border-[var(--theme-border)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 图片上传 */}
            <ImageUploader
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              label="照片 *"
              previewClassName="aspect-video"
            />

            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium mb-2">标题 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field w-full"
                placeholder="给这张照片起个标题..."
                required
              />
            </div>

            {/* 分类 */}
            <div>
              <label className="block text-sm font-medium mb-2">分类</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      formData.category === cat.id
                        ? "border-[var(--theme-primary)] bg-[var(--theme-primary)] text-white"
                        : "border-[var(--theme-border)] hover:border-[var(--theme-primary)]"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 日期 */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                拍摄日期
              </label>
              <input
                type="date"
                value={formData.photoDate}
                onChange={(e) => setFormData({ ...formData, photoDate: e.target.value })}
                className="input-field w-full"
              />
            </div>

            {/* 标签 */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <Tag className="w-4 h-4 mr-1" />
                标签
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="input-field w-full"
                placeholder="用逗号分隔多个标签，如：海边,夕阳,旅行"
              />
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm font-medium mb-2">描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field w-full min-h-[100px] resize-none"
                placeholder="描述这张照片的故事..."
              />
            </div>

            {/* 摄影心得 */}
            <div>
              <label className="block text-sm font-medium mb-2">摄影心得</label>
              <textarea
                value={formData.thoughts}
                onChange={(e) => setFormData({ ...formData, thoughts: e.target.value })}
                className="input-field w-full min-h-[100px] resize-none"
                placeholder="分享拍摄这张照片的心得体会..."
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-[var(--theme-border)]">
              <Link
                href="/photos"
                className="px-6 py-2 rounded-lg border border-[var(--theme-border)] hover:bg-[var(--theme-secondary)] transition-colors"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.title.trim() || !formData.imageUrl.trim()}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                <Camera className="w-5 h-5" />
                <span>{loading ? "上传中..." : "发布照片"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
