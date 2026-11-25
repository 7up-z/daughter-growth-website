"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { EntryPlaceEditor } from "@/components/map/entry-place-editor"
import { placeName, type EntryPlace } from "@/lib/entry-place"
import { MapPin, Plus, Grid, List, Trash2 } from "lucide-react"
import { ThemedHeader, ThemedLoading, ThemedPageHero, ThemedShell } from "@/components/ui/theme-shell"

import { MediaDialog } from "@/components/ui/media-dialog"

interface PhotoEntry {
  id: string
  title: string
  description: string | null
  imageUrl: string
  photoDate: string | null
  place: EntryPlace | null
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
  { id: "life", name: "日常" },
  { id: "travel", name: "旅行" },
  { id: "birthday", name: "生日" },
  { id: "festival", name: "节日" },
  { id: "featured", name: "精选" },
]

export default function PhotosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const linkedPhoto = useSearchParams().get("photo")
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [openPhotoId, setOpenPhotoId] = useState<string | null>(null)
  const selectedPhoto = photos.find((photo) => photo.id === (linkedPhoto ?? openPhotoId))

  function closePhoto() {
    setOpenPhotoId(null)
    if (linkedPhoto) router.replace("/gallery", { scroll: false })
  }
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const fetchPhotos = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setLoadError(false)
    try {
      const url = selectedCategory === "all" || linkedPhoto ? "/api/photos" : `/api/photos?category=${selectedCategory}`
      const response = await fetch(url, { signal, cache: "no-store" })
      if (!response.ok) throw new Error("获取照片失败")
      const data: PhotoEntry[] = await response.json()
      if (!signal?.aborted) setPhotos(data)
    } catch {
      if (!signal?.aborted) setLoadError(true)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [selectedCategory, linkedPhoto])

  useEffect(() => {
    if (status !== "authenticated") return
    const controller = new AbortController()
    const timer = window.setTimeout(() => void fetchPhotos(controller.signal), 0)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [status, fetchPhotos])

  const handleDeletePhoto = async (id: string) => {
    if (!confirm("确定要删除这张照片吗？")) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/photos?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPhotos((previous) => previous.filter((photo) => photo.id !== id))
        if (selectedPhoto?.id === id) {
          closePhoto()
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
    return new Date(dateString).toLocaleDateString("zh-CN", {
      timeZone: "Asia/Shanghai",
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
      <ThemedHeader title="摄影相册" action={
        <Link href="/gallery/new" className="family-button family-button-primary">
          <Plus size={17} aria-hidden="true" /> 上传摄影照片
        </Link>
      } />
      <main>
        <ThemedPageHero title="摄影相册" description="光从窗边掠过，有些寻常的瞬间，就这样留在了照片里。" />
        <div className="gallery-toolbar">
          <div className="editorial-tabs" role="group" aria-label="照片分类">
            {categories.map((category) => (
              <button key={category.id} type="button" aria-pressed={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}>{category.name}</button>
            ))}
          </div>
          <div className="editorial-tabs" role="group" aria-label="相册版式">
            <button type="button" aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")} aria-label="展墙视图">
              <Grid size={18} aria-hidden="true" />
            </button>
            <button type="button" aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")} aria-label="列表视图">
              <List size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
        {loadError && <p role="alert" className="editorial-empty">暂时无法读取照片。 <button type="button" className="family-text-link" onClick={() => void fetchPhotos()}>重试</button></p>}
        {!loadError && linkedPhoto && !selectedPhoto && <p role="status" className="editorial-empty">这张照片已删除或不可查看。</p>}
        {!loadError && !photos.length && (
          <div className="editorial-empty">
            <h2 className="yearbook-display">还没有照片</h2>
            <Link href="/gallery/new" className="family-text-link">上传第一张照片</Link>
          </div>
        )}
        {!loadError && !!photos.length && (
          <div className={`gallery-collection gallery-${viewMode}`}>
            {photos.map((photo) => (
              <article key={photo.id} className="gallery-print">
                <button type="button" className="gallery-print-image" onClick={() => setOpenPhotoId(photo.id)}
                  aria-label={`查看照片 ${photo.title}`}>
                  <img src={photo.imageUrl} alt="" loading="lazy" />
                </button>
                <div className="gallery-caption">
                  <h2 className="yearbook-display">
                    <button type="button" onClick={() => setOpenPhotoId(photo.id)}>{photo.title}</button>
                  </h2>
                  <div className="editorial-meta">
                    {photo.photoDate && <time dateTime={photo.photoDate}>{formatDate(photo.photoDate)}</time>}
                    {photo.place && <span><MapPin size={14} aria-hidden="true" /> {placeName(photo.place)}</span>}
                  </div>
                  {viewMode === "list" && photo.description && <p className="line-clamp-2">{photo.description}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {selectedPhoto && (
        <MediaDialog title={selectedPhoto.title} onClose={closePhoto}>
          <div className="gallery-lightbox">
            <div className="gallery-lightbox-image"><img src={selectedPhoto.imageUrl} alt={selectedPhoto.title} /></div>
            <div className="media-caption">
              <div className="editorial-meta">
                <span>{getCategoryName(selectedPhoto.category)}</span>
                {selectedPhoto.photoDate && <time dateTime={selectedPhoto.photoDate}>{formatDate(selectedPhoto.photoDate)}</time>}
                <span>{selectedPhoto._count.comments} 条留言</span>
              </div>
              {selectedPhoto.description && <p>{selectedPhoto.description}</p>}
              {selectedPhoto.thoughts && <blockquote>{selectedPhoto.thoughts}</blockquote>}
              {(selectedPhoto.place || canDelete(selectedPhoto)) && (
                <EntryPlaceEditor key={selectedPhoto.id} type="photo" id={selectedPhoto.id}
                  place={selectedPhoto.place} canEdit={canDelete(selectedPhoto)}
                  onSaved={(place) => setPhotos((previous) => previous.map((photo) =>
                    photo.id === selectedPhoto.id ? { ...photo, place } : photo))} />
              )}
              {canDelete(selectedPhoto) && (
                <button type="button" className="family-text-link" disabled={deleting === selectedPhoto.id}
                  onClick={() => void handleDeletePhoto(selectedPhoto.id)}>
                  <Trash2 size={16} aria-hidden="true" /> 删除照片
                </button>
              )}
            </div>
          </div>
        </MediaDialog>
      )}
    </ThemedShell>
  )
}
