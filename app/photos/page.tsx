"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, Camera, Calendar, Tag, ChevronLeft, Plus, Grid, List, MessageCircle, Trash2, X } from "lucide-react"

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
    if (!confirm("确定要删除这张照片吗？删除后无法恢复。")) return

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

  if (status === "loading" || loading) {
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
    const cat = categories.find(c => c.id === categoryId)
    return cat?.name || categoryId
  }

  return (
    <div className="min-h-screen">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 glass border-b border-[var(--theme-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
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
            <h1 className="text-lg font-semibold">摄影记录</h1>
            <Link
              href="/photos/new"
              className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-accent)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">上传照片</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-6">
            <Camera className="w-10 h-10 text-purple-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">摄影记录</h1>
          <p className="text-[var(--theme-text-muted)] max-w-2xl mx-auto">
            用镜头捕捉生活中的美好瞬间，记录成长的每一个精彩时刻。
          </p>
        </div>

        {/* 分类筛选和视图切换 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          {/* 分类标签 */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-[var(--theme-primary)] text-white"
                    : "bg-[var(--theme-surface)] text-[var(--theme-text)] hover:bg-[var(--theme-secondary)] border border-[var(--theme-border)]"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* 视图切换 */}
          <div className="flex items-center space-x-2 bg-[var(--theme-surface)] rounded-lg p-1 border border-[var(--theme-border)]">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-[var(--theme-primary)] text-white"
                  : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-[var(--theme-primary)] text-white"
                  : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 照片网格 */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="group bg-[var(--theme-surface)] rounded-2xl overflow-hidden shadow-lg card-hover border border-[var(--theme-border)] animate-fade-in relative"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* 删除按钮 - 右上角 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeletePhoto(photo.id)
                  }}
                  disabled={deleting === photo.id}
                  className="absolute top-3 right-3 z-20 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 disabled:opacity-50"
                  title="删除照片"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div 
                  className="aspect-square overflow-hidden cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover image-hover"
                  />
                </div>
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <h3 className="font-semibold mb-1 truncate">{photo.title}</h3>
                  <div className="flex items-center justify-between text-sm text-[var(--theme-text-muted)]">
                    <span>{getCategoryName(photo.category)}</span>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{photo._count.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="group bg-[var(--theme-surface)] rounded-2xl overflow-hidden shadow-lg card-hover border border-[var(--theme-border)] animate-fade-in relative"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col sm:flex-row">
                  <div 
                    className="sm:w-48 h-48 sm:h-auto overflow-hidden cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover image-hover"
                    />
                  </div>
                  <div 
                    className="flex-1 p-6 cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold">{photo.title}</h3>
                      <span className="px-3 py-1 rounded-full bg-[var(--theme-secondary)] text-xs">
                        {getCategoryName(photo.category)}
                      </span>
                    </div>
                    <p className="text-[var(--theme-text-muted)] text-sm mb-4 line-clamp-2">
                      {photo.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-[var(--theme-text-muted)]">
                      <div className="flex items-center space-x-4">
                        {photo.photoDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(photo.photoDate)}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{photo._count.comments} 条留言</span>
                        </div>
                      </div>
                      <span>{photo.author.nickname || photo.author.username}</span>
                    </div>
                  </div>
                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeletePhoto(photo.id)
                    }}
                    disabled={deleting === photo.id}
                    className="absolute top-4 right-4 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 disabled:opacity-50"
                    title="删除照片"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空状态 */}
        {photos.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--theme-secondary)] mb-6">
              <Camera className="w-10 h-10 text-[var(--theme-text-muted)]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {selectedCategory === "all" ? "还没有照片" : "该分类暂无照片"}
            </h3>
            <p className="text-[var(--theme-text-muted)] mb-6">
              {selectedCategory === "all" 
                ? "开始上传你们的精彩照片吧！" 
                : "选择其他分类或上传新照片"}
            </p>
            <Link
              href="/photos/new"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>上传第一张照片</span>
            </Link>
          </div>
        )}
      </main>

      {/* 照片详情弹窗 */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="bg-[var(--theme-surface)] rounded-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {/* 删除按钮 */}
            <button
              onClick={() => handleDeletePhoto(selectedPhoto.id)}
              disabled={deleting === selectedPhoto.id}
              className="absolute top-4 left-4 z-20 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              title="删除照片"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="aspect-video">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="w-full h-full object-contain bg-black"
              />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedPhoto.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--theme-text-muted)]">
                    {selectedPhoto.photoDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(selectedPhoto.photoDate)}</span>
                      </div>
                    )}
                    <span className="px-3 py-1 rounded-full bg-[var(--theme-secondary)]">
                      {getCategoryName(selectedPhoto.category)}
                    </span>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{selectedPhoto._count.comments} 条留言</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedPhoto.description && (
                <p className="text-[var(--theme-text)] mb-4">
                  {selectedPhoto.description}
                </p>
              )}

              {selectedPhoto.thoughts && (
                <div className="bg-[var(--theme-secondary)] rounded-xl p-4 mb-4">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Camera className="w-4 h-4 mr-2" />
                    摄影心得
                  </h4>
                  <p className="text-[var(--theme-text-muted)] text-sm">
                    {selectedPhoto.thoughts}
                  </p>
                </div>
              )}

              {/* 标签 */}
              {selectedPhoto.tags && (
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(selectedPhoto.tags).map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-[var(--theme-secondary)] text-sm text-[var(--theme-text-muted)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
