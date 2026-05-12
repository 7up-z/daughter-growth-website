"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Video, Calendar, Play, Plus, Trash2, X } from "lucide-react"
import { ThemedHeader, ThemedLoading, ThemedPageHero, ThemedShell, useCurrentThemeStyle } from "@/components/ui/theme-shell"

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
  const current = useCurrentThemeStyle()
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
    return <ThemedLoading />
  }

  if (!session) {
    return null
  }

  return (
    <ThemedShell>
      <ThemedHeader
        title="生日视频"
        action={
          <button onClick={() => setShowAddModal(true)} className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black transition ${current.primaryButton}`}>
            <Plus className="h-4 w-4" />
            添加
          </button>
        }
      />

      <main>
        <ThemedPageHero
          eyebrow="Birthday Films"
          title="生日视频"
          description="把每一年的生日影像按时间收藏，回看成长里最有仪式感的时刻。"
          icon={<Video className="h-4 w-4" />}
        />

        {/* 视频列表 */}
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <article
              key={video.id}
              className={`group overflow-hidden rounded-[1.5rem] border transition ${current.card}`}
            >
              {/* 视频缩略图 */}
              <div
                className={`relative aspect-video cursor-pointer ${current.preview}`}
                onClick={() => setSelectedVideo(video)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform group-hover:scale-110 ${current.cardIcon}`}>
                    <Play className="ml-0.5 h-7 w-7" />
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <span className={`rounded-full border px-3 py-1 text-xs font-black ${current.pickerCard}`}>
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
                  className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-gray-500 opacity-0 transition-all hover:bg-red-500 hover:text-white group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 视频信息 */}
              <div className="p-4">
                <div className={`mb-2 flex items-center gap-2 text-xs font-bold ${current.secondaryText}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{video.year}岁生日</span>
                </div>
                <h3 className="mb-1 font-black">{video.title}</h3>
                {video.description && (
                  <p className={`line-clamp-2 text-sm ${current.secondaryText}`}>
                    {video.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* 空状态 */}
        {videos.length === 0 && (
          <div className={`mt-6 rounded-[2rem] border py-16 text-center ${current.pickerCard}`}>
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${current.cardIcon}`}>
              <Video className="w-8 h-8" />
            </div>
            <h3 className="mb-2 text-lg font-black">还没有视频</h3>
            <p className={`mb-6 ${current.secondaryText}`}>
              添加第一个生日视频吧
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-black transition ${current.primaryButton}`}
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
          <div className={`w-full max-w-md rounded-[1.5rem] border p-6 ${current.pickerCard}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">添加生日视频</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full bg-current/10 p-2 transition-colors hover:bg-current/15"
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
                  className="flex-1 rounded-full border border-current/20 px-4 py-2 font-black transition hover:bg-current/10"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className={`flex-1 rounded-full px-4 py-2 font-black transition ${current.primaryButton}`}
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
            className={`w-full max-w-3xl overflow-hidden rounded-[1.5rem] border ${current.pickerCard}`}
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
    </ThemedShell>
  )
}
