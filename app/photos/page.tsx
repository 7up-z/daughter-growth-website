"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, Camera, Calendar, Tag, ChevronLeft, Plus, Grid, List, MessageCircle, Trash2, X, Sparkles } from "lucide-react"

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
  { id: "all", name: "全部", icon: Grid },
  { id: "landscape", name: "风景", icon: Camera },
  { id: "portrait", name: "人物", icon: Heart },
  { id: "life", name: "生活", icon: Calendar },
  { id: "travel", name: "旅行", icon: Tag },
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
      month: "short",
      day: "numeric",
    })
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--theme-background)]">
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
    <div className="min-h-screen bg-[var(--theme-background)]">
      {/* 杂志风导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-black/5 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold hidden sm:block">成长记录</span>
              </Link>
            </div>
            <h1 className="text-lg font-semibold tracking-wide">摄影记录</h1>
            <Link
              href="/photos/new"
              className="flex items-center space-x-1 px-4 py-2 bg-[var(--theme-dark)] text-white hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline text-sm uppercase tracking-wider">上传</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* 杂志风 Hero 区域 */}
        <section className="relative py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center">
              <span className="magazine-subtitle mb-4 block">Photography</span>
              <h1 className="magazine-title text-5xl lg:text-6xl mb-6">
                摄影记录
              </h1>
              <div className="magazine-divider mx-auto" />
              <p className="text-lg text-[var(--theme-text-muted)] max-w-2xl mx-auto">
                用镜头捕捉生活中的美好瞬间，每一张照片都是时光的印记。
              </p>
            </div>
          </div>
        </section>

        {/* 分类筛选和视图切换 */}
        <section className="py-8 border-b border-[var(--theme-border)] bg-white sticky top-20 z-40">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* 分类筛选 */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 text-sm font-medium transition-all ${
                      selectedCategory === cat.id
                        ? "bg-[var(--theme-dark)] text-white"
                        : "bg-[var(--theme-background)] text-[var(--theme-text)] hover:bg-[var(--theme-secondary)]"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* 视图切换 */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid" ? "bg-[var(--theme-dark)] text-white" : "bg-[var(--theme-background)]"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list" ? "bg-[var(--theme-dark)] text-white" : "bg-[var(--theme-background)]"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 照片展示区域 */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {photos.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--theme-secondary)] mb-6">
                  <Camera className="w-10 h-10 text-[var(--theme-text-muted)]" />
                </div>
                <h3 className="text-2xl font-bold mb-2">还没有照片</h3>
                <p className="text-[var(--theme-text-muted)] mb-6">
                  开始记录美好瞬间吧！
                </p>
                <Link
                  href="/photos/new"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>上传第一张照片</span>
                </Link>
              </div>
            ) : viewMode === "grid" ? (
              /* 网格视图 - 杂志风瀑布流 */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="group relative bg-white shadow-lg card-hover overflow-hidden"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* 删除按钮 */}
                    {canDelete(photo) && (
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        disabled={deleting === photo.id}
                        className="absolute top-4 right-4 z-20 p-2 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* 图片 */}
                    <div 
                      className="aspect-[4/3] overflow-hidden cursor-pointer image-hover"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* 信息 */}
                    <div className="p-6">
                      <span className="magazine-tag mb-3">
                        {getCategoryName(photo.category)}
                      </span>
                      <h3 className="text-xl font-bold mb-2 text-[var(--theme-text)]">
                        {photo.title}
                      </h3>
                      {photo.description && (
                        <p className="text-[var(--theme-text-muted)] text-sm line-clamp-2 mb-3">
                          {photo.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-[var(--theme-text-muted)]">
                        <span>{formatDate(photo.photoDate)}</span>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{photo._count.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* 列表视图 */
              <div className="space-y-6">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group flex flex-col md:flex-row bg-white shadow-lg card-hover overflow-hidden"
                  >
                    {/* 图片 */}
                    <div 
                      className="md:w-1/3 aspect-video md:aspect-auto overflow-hidden cursor-pointer image-hover"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <span className="magazine-tag">
                            {getCategoryName(photo.category)}
                          </span>
                          {canDelete(photo) && (
                            <button
                              onClick={() => handleDeletePhoto(photo.id)}
                              disabled={deleting === photo.id}
                              className="p-2 text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-[var(--theme-text)]">
                          {photo.title}
                        </h3>
                        {photo.description && (
                          <p className="text-[var(--theme-text-muted)] line-clamp-2 mb-4">
                            {photo.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-[var(--theme-text-muted)]">
                        <span>{formatDate(photo.photoDate)}</span>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{photo._count.comments} 条评论</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 照片详情弹窗 */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] overflow-auto bg-white animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* 删除按钮 */}
            {canDelete(selectedPhoto) && (
              <button
                onClick={() => handleDeletePhoto(selectedPhoto.id)}
                disabled={deleting === selectedPhoto.id}
                className="absolute top-4 left-4 z-20 p-2 bg-red-500 text-white hover:bg-red-600 transition-colors"
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
              <div className="p-8">
                <span className="magazine-tag mb-4">
                  {getCategoryName(selectedPhoto.category)}
                </span>
                <h2 className="text-3xl font-bold mb-4 text-[var(--theme-text)]">
                  {selectedPhoto.title}
                </h2>
                {selectedPhoto.description && (
                  <p className="text-[var(--theme-text-muted)] mb-6">
                    {selectedPhoto.description}
                  </p>
                )}
                {selectedPhoto.thoughts && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">摄影心得</h4>
                    <p className="text-[var(--theme-text-muted)] italic">
                      {selectedPhoto.thoughts}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm text-[var(--theme-text-muted)] pt-6 border-t border-[var(--theme-border)]">
                  <span>{formatDate(selectedPhoto.photoDate)}</span>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{selectedPhoto._count.comments} 条评论</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
