"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Film, Play, Plus, Trash2, X } from "lucide-react"
import { ThemedHeader, ThemedLoading, ThemedPageHero, ThemedShell, useCurrentThemeStyle } from "@/components/ui/theme-shell"

import { MediaDialog } from "@/components/ui/media-dialog"

interface BirthdayVideo {
  id: string
  year: number
  title: string
  bvid: string | null
  videoUrl: string | null
  description: string | null
  thumbnail: string | null
}

export default function BirthdayPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const linkedVideo = useSearchParams().get("video")
  const current = useCurrentThemeStyle()
  const [videos, setVideos] = useState<BirthdayVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [openVideoId, setOpenVideoId] = useState<string | null>(null)
  const [chosenVideoId, setChosenVideoId] = useState<string | null>(null)
  const featuredVideo = videos.find((video) => video.id === chosenVideoId) ?? videos[0]
  const selectedVideo = videos.find((video) => video.id === (linkedVideo ?? openVideoId))
  const isAdmin = session?.user.role === "admin"

  function closeVideo() {
    setOpenVideoId(null)
    if (linkedVideo) router.replace("/birthday", { scroll: false })
  }
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

  const fetchVideos = useCallback(async () => {
    setLoadError(false)
    try {
      const response = await fetch("/api/birthday")
      if (!response.ok) throw new Error("无法读取生日影像")
      setVideos(await response.json())
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status !== "authenticated") return
    const timer = window.setTimeout(() => void fetchVideos(), 0)
    return () => window.clearTimeout(timer)
  }, [status, fetchVideos])

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
        setVideos((previous) => previous.filter((video) => video.id !== id))
        if (selectedVideo?.id === id) {
          closeVideo()
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
        title="生日影像"
        action={
          <button onClick={() => setShowAddModal(true)} className="family-button family-button-primary">
            <Plus className="h-4 w-4" />
            添加生日影像
          </button>
        }
      />

      <main>
        <ThemedPageHero
          title="生日影像"
          description="烛火亮起，笑声比歌先到。镜头里，是一年一岁的我们。"
        />

        {linkedVideo && !selectedVideo && <p className="mt-5 text-sm" role="status">这段影像已删除或不可查看。</p>}
        {loadError && <p role="alert" className="editorial-empty">暂时无法读取生日影像。 <button type="button" className="family-text-link" onClick={() => void fetchVideos()}>重试</button></p>}
        {!loadError && featuredVideo && (
          <>
            <article className="birthday-feature">
              <button type="button" className="birthday-poster" onClick={() => setOpenVideoId(featuredVideo.id)}
                aria-label={`播放 ${featuredVideo.title}`}>
                <img src={featuredVideo.thumbnail || "/images/module-birthday-video.png"} alt="" />
                <span className="birthday-play"><Play size={27} fill="currentColor" aria-hidden="true" /> 播放</span>
              </button>
              <div className="birthday-feature-copy">
                <p className="birthday-year">{featuredVideo.year} 年</p>
                <h2 className="yearbook-display">{featuredVideo.title}</h2>
                {featuredVideo.description && <p>{featuredVideo.description}</p>}
              </div>
            </article>
            {videos.length > 1 && (
              <section className="birthday-archive" aria-labelledby="birthday-archive-title">
                <h2 id="birthday-archive-title" className="yearbook-display">历年影像</h2>
                <ul className="birthday-strip">
                  {videos.map((video) => (
                    <li key={video.id}>
                      <button type="button" aria-pressed={featuredVideo.id === video.id}
                        onClick={() => setChosenVideoId(video.id)}>
                        {video.thumbnail ? <img src={video.thumbnail} alt="" loading="lazy" /> : <span className="birthday-strip-placeholder"><Film size={24} aria-hidden="true" /></span>}
                        <span className="birthday-strip-label"><strong>{video.year} 年</strong><span>{video.title}</span></span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
        {!loadError && !featuredVideo && (
          <div className="editorial-empty">
            <h2 className="yearbook-display">还没有生日影像</h2>
            <button type="button" className="family-text-link" onClick={() => setShowAddModal(true)}>添加第一段影像</button>
          </div>
        )}
      </main>

      {/* 添加视频弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-md rounded-[1.5rem] border p-6 ${current.pickerCard}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">添加生日影像</h2>
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

      {selectedVideo && (
        <MediaDialog title={selectedVideo.title} onClose={closeVideo}>
          <div className="birthday-player">
            {selectedVideo.videoUrl ? (
              <video src={selectedVideo.videoUrl} controls playsInline preload="metadata" aria-label={selectedVideo.title} />
            ) : selectedVideo.bvid ? (
              <iframe
                src={`https://player.bilibili.com/player.html?bvid=${encodeURIComponent(selectedVideo.bvid)}&page=1&high_quality=1&danmaku=0`}
                title={selectedVideo.title}
                referrerPolicy="no-referrer"
                allowFullScreen
              />
            ) : <p role="status">暂无可播放的影像。</p>}
          </div>
          <div className="media-caption">
            {selectedVideo.bvid && !selectedVideo.videoUrl && <p>由哔哩哔哩播放，站外可见范围由视频发布设置决定。</p>}
            {selectedVideo.description && <p>{selectedVideo.description}</p>}
            {isAdmin && (
              <button type="button" className="family-text-link" disabled={deleting === selectedVideo.id}
                onClick={() => void handleDeleteVideo(selectedVideo.id)}>
                <Trash2 size={16} aria-hidden="true" /> 删除影像
              </button>
            )}
          </div>
        </MediaDialog>
      )}
    </ThemedShell>
  )
}
