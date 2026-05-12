"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Camera, Calendar, Plus, Grid, List, Trash2, X } from "lucide-react"
import { ThemedHeader, ThemedLoading, ThemedPageHero, ThemedShell, useCurrentThemeStyle } from "@/components/ui/theme-shell"

interface PhotoEntry {
  id: string
  title: string
  description: string | null
  imageUrl: string
  photoDate: string | null
  category: string
  tags: string
  thoughts: string | null
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

const categories = [
  { id: "all", name: "全部" },
  { id: "landscape", name: "风景" },
  { id: "portrait", name: "人物" },
  { id: "life", name: "生活" },
  { id: "travel", name: "旅行" },
]

export default function PhotosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const current = useCurrentThemeStyle()
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoEntry | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const fetchPhotos = useCallback(async () => {
    try {
      const url = selectedCategory === "all"
        ? "/api/photos"
        : `/api/photos?category=${selectedCategory}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setPhotos(data)
      }
    } catch (error) {
      console.error("获取照片失败:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchPhotos()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [fetchPhotos])

  const handleDeletePhoto = async (id: string) => {
    if (!confirm("确定要删除这张照片吗？")) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/photos?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPhotos(photos.filter(p => p.id !== id))
        if (selectedPhoto?.id === id) {
          setSelectedPhoto(null)
        }
      } else {
        const error = await response.json()
        alert(error.error || "删除失败")
      }
    } catch (error) {
      console.error("删除照片失败:", error)
      alert("删除失败，请重试")
    } finally {
      setDeleting(null)
    }
  }

  const canDelete = (photo: PhotoEntry) => {
    if (!session) return false
    const isAdmin = session.user.role === "admin"
    const isAuthor = photo.author.id === session.user.id
    return isAdmin || isAuthor
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId
  }

  if (status === "loading" || loading) {
    return <ThemedLoading />
  }

  if (!session) {
    return null
  }

  return (
    <ThemedShell>
      <ThemedHeader
        title="摄影记录"
        action={
          <>
              <div className={`flex items-center overflow-hidden rounded-full border ${current.pickerCard}`}>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? current.cardIcon : ""}`}
                  aria-label="网格视图"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? current.cardIcon : ""}`}
                  aria-label="列表视图"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <Link href="/photos/new" className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black transition ${current.primaryButton}`}>
                <Plus className="w-4 h-4 mr-1" />
                上传
              </Link>
          </>
        }
      />

      <main>
          <ThemedPageHero
            eyebrow="Photo Gallery"
            title="摄影记录"
            icon={<Camera className="h-4 w-4" />}
          />

          {/* 分类筛选 */}
          <div className="my-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                  selectedCategory === cat.id
                    ? current.primaryButton
                    : current.pickerCard
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 空状态 */}
          {photos.length === 0 && (
            <div className={`rounded-[2rem] border py-16 text-center ${current.pickerCard}`}>
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${current.cardIcon}`}>
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="mb-2 text-lg font-black">还没有照片</h3>
              <p className={`mb-6 ${current.secondaryText}`}>
                开始记录美好瞬间吧
              </p>
              <Link href="/photos/new" className={`inline-flex rounded-full px-5 py-3 font-black transition ${current.primaryButton}`}>
                上传第一张照片
              </Link>
            </div>
          )}

          {/* 网格视图 */}
          {photos.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo) => (
                <article
                  key={photo.id}
                  className={`group overflow-hidden rounded-[1.5rem] border transition ${current.card}`}
                >
                  {/* 图片 */}
                  <div
                    className="aspect-[4/3] overflow-hidden cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  {/* 信息 */}
                  <div className="p-4">
                    <span className={`mb-2 inline-block rounded-full border px-3 py-1 text-xs font-black ${current.pickerCard}`}>
                      {getCategoryName(photo.category)}
                    </span>
                    <h3
                      className="mb-1 cursor-pointer font-black"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      {photo.title}
                    </h3>
                    <div className={`flex items-center justify-between text-sm ${current.secondaryText}`}>
                      <span>{formatDate(photo.photoDate)}</span>
                      <span>{photo._count.comments} 评论</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* 列表视图 */}
          {photos.length > 0 && viewMode === "list" && (
            <div className="space-y-4">
              {photos.map((photo) => (
                <article
                  key={photo.id}
                  className={`group flex gap-5 rounded-[1.5rem] border p-4 transition ${current.card}`}
                >
                  {/* 图片 */}
                  <div
                    className="h-32 w-48 flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  {/* 信息 */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className={`mb-2 inline-block rounded-full border px-3 py-1 text-xs font-black ${current.pickerCard}`}>
                        {getCategoryName(photo.category)}
                      </span>
                      <h3
                        className="mb-1 cursor-pointer font-black"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        {photo.title}
                      </h3>
                      {photo.description && (
                        <p className={`line-clamp-2 text-sm ${current.secondaryText}`}>
                          {photo.description}
                        </p>
                      )}
                    </div>
                    <div className={`flex items-center justify-between text-sm ${current.secondaryText}`}>
                      <span>{formatDate(photo.photoDate)}</span>
                      <span>{photo._count.comments} 评论</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
      </main>

      {/* 照片详情弹窗 */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className={`relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-[1.5rem] border ${current.pickerCard}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 删除按钮 */}
            {canDelete(selectedPhoto) && (
              <button
                onClick={() => handleDeletePhoto(selectedPhoto.id)}
                disabled={deleting === selectedPhoto.id}
                className="absolute top-4 left-4 z-20 p-2 bg-red-500 text-white hover:bg-red-600 rounded-full"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <div className="grid md:grid-cols-2">
              {/* 图片 */}
              <div className="aspect-square md:aspect-auto">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 信息 */}
              <div className="p-6">
                <span className={`mb-3 inline-block rounded-full border px-3 py-1 text-xs font-black ${current.pickerCard}`}>
                  {getCategoryName(selectedPhoto.category)}
                </span>
                <h2 className="text-xl font-bold mb-3">
                  {selectedPhoto.title}
                </h2>
                {selectedPhoto.description && (
                  <p className="text-[var(--theme-text-secondary)] mb-4">
                    {selectedPhoto.description}
                  </p>
                )}
                {selectedPhoto.thoughts && (
                  <div className="mb-4 rounded-2xl bg-current/10 p-3">
                    <p className={`text-sm italic ${current.secondaryText}`}>
                      {selectedPhoto.thoughts}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-[var(--theme-text-muted)] pt-4 border-t border-[var(--theme-border)]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedPhoto.photoDate)}
                  </span>
                  <span>{selectedPhoto._count.comments} 评论</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ThemedShell>
  )
}
