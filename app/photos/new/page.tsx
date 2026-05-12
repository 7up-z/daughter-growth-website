"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Camera, Save, Calendar, Tag } from "lucide-react"
import { ImageUploader } from "@/components/ui/image-uploader"
import { ThemedHeader, ThemedLoading, ThemedPageHero, ThemedShell, useCurrentThemeStyle } from "@/components/ui/theme-shell"

const categories = [
  { id: "landscape", name: "风景" },
  { id: "portrait", name: "人物" },
  { id: "life", name: "生活" },
  { id: "travel", name: "旅行" },
]

export default function NewPhotoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const current = useCurrentThemeStyle()
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
    return <ThemedLoading label="正在加载..." />
  }

  if (!session) {
    return null
  }

  return (
    <ThemedShell maxWidth="max-w-4xl">
      <ThemedHeader
        backHref="/photos"
        title="上传照片"
        action={
          <button
              onClick={handleSubmit}
              disabled={loading || !formData.title.trim() || !formData.imageUrl.trim()}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black transition disabled:opacity-60 ${current.primaryButton}`}
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "上传中..." : "发布"}</span>
            </button>
        }
      />

      <main>
        <ThemedPageHero
          eyebrow="New Photo"
          title="上传照片"
          icon={<Camera className="h-4 w-4" />}
        />
        <div className={`mt-6 rounded-[2rem] border p-6 sm:p-8 ${current.card}`}>
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
                className="input"
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
                    className={`rounded-full border px-4 py-2 font-black transition ${
                      formData.category === cat.id
                        ? current.primaryButton
                        : current.pickerCard
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
                className="input"
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
                className="input"
                placeholder="用逗号分隔多个标签，如：海边,夕阳,旅行"
              />
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm font-medium mb-2">描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input min-h-[100px] resize-none"
                placeholder="描述这张照片的故事..."
              />
            </div>

            {/* 摄影心得 */}
            <div>
              <label className="block text-sm font-medium mb-2">摄影心得</label>
              <textarea
                value={formData.thoughts}
                onChange={(e) => setFormData({ ...formData, thoughts: e.target.value })}
                className="input min-h-[100px] resize-none"
                placeholder="分享拍摄这张照片的心得体会..."
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-[var(--theme-border)]">
              <Link href="/photos" className="rounded-full border border-current/20 px-6 py-2 font-black transition hover:bg-current/10">
                取消
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.title.trim() || !formData.imageUrl.trim()}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-2 font-black transition disabled:opacity-60 ${current.primaryButton}`}
              >
                <Camera className="w-5 h-5" />
                <span>{loading ? "上传中..." : "发布照片"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </ThemedShell>
  )
}
