"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, Video, Calendar, ChevronLeft, Play, Plus, Trash2, X } from "lucide-react"

interface BirthdayVideo {
  id: string
  year: number
  title: string
  bvid: string
  description: string | null
  thumbnail: string | null
}

export default function BirthdayPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [videos, setVideos] = useState<BirthdayVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<BirthdayVideo | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    title: "",
    bvid: "",
    description: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch("/api/birthday")
      if (response.ok) {
        const data = await response.json()
        setVideos(data)
      }
    } catch (error) {
      console.error("获取视频失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/birthday", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowAddModal(false)
        setFormData({ year: new Date().getFullYear(), title: "", bvid: "", description: "" })
        fetchVideos()
      } else {
        const error = await response.json()
        alert(error.error || "添加失败")
      }
    } catch (error) {
      console.error("添加视频失败:", error)
      alert("添加失败，请重试")
    }
  }

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("确定要删除这个视频吗？删除后无法恢复。")) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/birthday?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setVideos(videos.filter(v => v.id !== id))
        if (selectedVideo?.id === id) {
          setSelectedVideo(null)
        }
      } else {
        const error = await response.json()
        alert(error.error || "删除失败")
      }
    } catch (error) {
      console.error("删除视频失败:", error)
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
            <h1 className="text-lg font-semibold">生日视频</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-accent)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">添加</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pink-100 mb-6">
            <Video className="w-10 h-10 text-pink-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">生日视频</h1>
          <p className="text-[var(--theme-text-muted)] max-w-2xl mx-auto">
            每一年的生日都是成长的里程碑，这些视频记录了宝贝从呱呱坠地到如今的点点滴滴。
          </p>
        </div>

        {/* 视频列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="bg-[var(--theme-surface)] rounded-2xl overflow-hidden shadow-lg card-hover border border-[var(--theme-border)] animate-fade-in group relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* 删除按钮 - 右上角 */}
              <button
                onClick={() => handleDeleteVideo(video.id)}
                disabled={deleting === video.id}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 disabled:opacity-50"
                title="删除视频"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* 视频缩略图 */}
              <div 
                className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 relative cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-pink-500 ml-1" />
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-white/90 text-sm font-semibold text-pink-600">
                    {video.year}年
                  </span>
                </div>
              </div>

              {/* 视频信息 */}
              <div className="p-6">
                <div className="flex items-center space-x-2 text-sm text-[var(--theme-text-muted)] mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{video.year}岁生日</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                <p className="text-sm text-[var(--theme-text-muted)] line-clamp-2">
                  {video.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {videos.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--theme-secondary)] mb-6">
              <Video className="w-10 h-10 text-[var(--theme-text-muted)]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">还没有视频</h3>
            <p className="text-[var(--theme-text-muted)] mb-6">
              添加第一个生日视频吧！
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>添加视频</span>
            </button>
          </div>
        )}
      </main>

      {/* 添加视频弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-[var(--theme-surface)] rounded-2xl p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">添加生日视频</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-[var(--theme-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">年份 *</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="input-field w-full"
                  min="2000"
                  max="2100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">标题 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field w-full"
                  placeholder="例如：5岁生日"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">B站BV号 *</label>
                <input
                  type="text"
                  value={formData.bvid}
                  onChange={(e) => setFormData({ ...formData, bvid: e.target.value })}
                  className="input-field w-full"
                  placeholder="例如：BV1xx411c7mD"
                  required
                />
                <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                  从B站视频链接中复制BV号
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field w-full min-h-[80px] resize-none"
                  placeholder="写下这个生日的特别回忆..."
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-[var(--theme-border)] hover:bg-[var(--theme-secondary)] transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 视频播放弹窗 */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="bg-[var(--theme-surface)] rounded-2xl overflow-hidden max-w-4xl w-full animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {/* 删除按钮 */}
            <button
              onClick={() => handleDeleteVideo(selectedVideo.id)}
              disabled={deleting === selectedVideo.id}
              className="absolute top-4 left-4 z-20 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              title="删除视频"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="aspect-video bg-black">
              <iframe
                src={`https://player.bilibili.com/player.html?bvid=${selectedVideo.bvid}&page=1&high_quality=1&danmaku=0`}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedVideo.title}</h3>
                  <p className="text-[var(--theme-text-muted)] mt-1">
                    {selectedVideo.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
