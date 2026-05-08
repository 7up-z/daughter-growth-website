"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Camera, Calendar, ChevronLeft, Plus, Grid, List, Trash2, X, User } from "lucide-react"

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

  useEffect(() => {
    fetchPhotos()
  }, [selectedCategory])

  const fetchPhotos = async () => {
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
  }

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
    const isAdmin = (session.user as any).role === "admin"
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--theme-text-muted)]">加载中...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* 顶部导航 */}
      <header className="border-b border-[var(--theme-border)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 -ml-2 hover:bg-[var(--theme-bg-tertiary)] rounded transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <Link href="/dashboard" className="text-lg font-semibold">
                成长记录
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {/* 视图切换 */}
              <div className="flex items-center border border-[var(--theme-border)] rounded">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-[var(--theme-text)] text-white" : ""}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-[var(--theme-text)] text-white" : ""}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <Link href="/photos/new" className="btn btn-primary">
                <Plus className="w-4 h-4 mr-1" />
                上传
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* 页面内容 */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">摄影记录</h1>
            <p className="text-[var(--theme-text-secondary)]">
              定格每一个美好瞬间
            </p>
          </div>

          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-sm rounded ${
                  selectedCategory === cat.id
                    ? "bg-[var(--theme-text)] text-white"
                    : "bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)] hover:bg-[var(--theme-border)]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 空状态 */}
          {photos.length === 0 && (
            <div className="text-center py-16">
              <Camera className="w-12 h-12 mx-auto text-[var(--theme-text-muted)] mb-4" />
              <h3 className="text-lg font-medium mb-2">还没有照片</h3>
              <p className="text-[var(--theme-text-muted)] mb-6">
                开始记录美好瞬间吧
              </p>
              <Link href="/photos/new" className="btn btn-primary">
                上传第一张照片
              </Link>
            </div>
          )}

          {/* 网格视图 */}
          {photos.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <article
                  key={photo.id}
                  className="group card overflow-hidden"
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
                    <span className="tag mb-2 inline-block">
                      {getCategoryName(photo.category)}
                    </span>
                    <h3
                      className="font-medium mb-1 cursor-pointer hover:text-[var(--theme-accent)]"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      {photo.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-[var(--theme-text-muted)]">
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
            <div className="space-y-0">
              {photos.map((photo) => (
                <article
                  key={photo.id}
                  className="article-card group flex gap-6"
                >
                  {/* 图片 */}
                  <div
                    className="w-48 h-32 flex-shrink-0 overflow-hidden rounded cursor-pointer"
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
                      <span className="tag mb-2 inline-block">
                        {getCategoryName(photo.category)}
                      </span>
                      <h3
                        className="font-medium mb-1 cursor-pointer hover:text-[var(--theme-accent)]"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        {photo.title}
                      </h3>
                      {photo.description && (
                        <p className="text-sm text-[var(--theme-text-muted)] line-clamp-2">
                          {photo.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-[var(--theme-text-muted)]">
                      <span>{formatDate(photo.photoDate)}</span>
                      <span>{photo._count.comments} 评论</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 照片详情弹窗 */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] overflow-auto bg-white rounded-lg"
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
                <span className="tag mb-3 inline-block">
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
                  <div className="mb-4 p-3 bg-[var(--theme-bg-tertiary)] rounded">
                    <p className="text-sm text-[var(--theme-text-secondary)] italic">
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
    </div>
  )
}
