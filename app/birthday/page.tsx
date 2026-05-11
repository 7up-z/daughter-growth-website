"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Video, Calendar, ChevronLeft, Play, Plus, Trash2, X } from "lucide-react"

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

  async function fetchVideos() {
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
    if (!confirm("确定要删除这个视频吗？")) return

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
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-1" />
              添加
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">生日视频</h1>
          <p className="text-[var(--theme-text-secondary)]">
            记录每一年的成长时刻
          </p>
        </div>

        {/* 视频列表 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <article
              key={video.id}
              className="card overflow-hidden group"
            >
              {/* 视频缩略图 */}
              <div
                className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 relative cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 text-amber-500 ml-0.5" />
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 rounded bg-white/90 text-xs font-medium text-amber-600">
                    {video.year}年
                  </span>
                </div>
                {/* 删除按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteVideo(video.id)
                  }}
                  disabled={deleting === video.id}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 text-gray-500 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 视频信息 */}
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-[var(--theme-text-muted)] mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{video.year}岁生日</span>
                </div>
                <h3 className="font-medium mb-1">{video.title}</h3>
                {video.description && (
                  <p className="text-sm text-[var(--theme-text-muted)] line-clamp-2">
                    {video.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* 空状态 */}
        {videos.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">还没有视频</h3>
            <p className="text-[var(--theme-text-muted)] mb-6">
              添加第一个生日视频吧
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-1" />
              添加视频
            </button>
          </div>
        )}
      </main>

      {/* 添加视频弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-[var(--theme-border)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">添加生日视频</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-[var(--theme-bg-tertiary)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">年份 *</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="input"
                  min="2000"
                  max="2100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">标题 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  placeholder="例如：5岁生日"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">B站BV号 *</label>
                <input
                  type="text"
                  value={formData.bvid}
                  onChange={(e) => setFormData({ ...formData, bvid: e.target.value })}
                  className="input"
                  placeholder="例如：BV1xx411c7mD"
                  required
                />
                <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                  从B站视频链接中复制BV号
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input min-h-[80px] resize-none"
                  placeholder="写下这个生日的特别回忆..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
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
            className="bg-white rounded-xl overflow-hidden max-w-3xl w-full border border-[var(--theme-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white"
            >
              <X className="w-5 h-5" />
            </button>
            {/* 删除按钮 */}
            <button
              onClick={() => handleDeleteVideo(selectedVideo.id)}
              disabled={deleting === selectedVideo.id}
              className="absolute top-4 left-4 z-20 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
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
            <div className="p-4">
              <h3 className="text-lg font-semibold">{selectedVideo.title}</h3>
              {selectedVideo.description && (
                <p className="text-sm text-[var(--theme-text-muted)] mt-1">
                  {selectedVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
