"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { BookOpen, Camera, LockKeyhole } from "lucide-react"
import { currentFamilyYear } from "@/lib/memory-archive"
import { ArchiveRecords } from "@/components/ui/archive-records"
import { FamilyMasthead } from "@/components/ui/family-masthead"
import { ArchiveError, useMemoryArchive, YearSelector } from "@/components/ui/memory-archive-controls"

export default function TimelinePage() {
  const { status } = useSession()
  const router = useRouter()
  const { archive, years, selectedYear, loading, failed, retry } = useMemoryArchive("timeline", status === "authenticated")
  const pages = archive ? Math.ceil(archive.total / archive.pageSize) : 0

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login")
  }, [status, router])

  return (
    <div className="yearbook-shell chronicle-shell">
      <div className="yearbook-container">
        <FamilyMasthead />
        <main className="chronicle-timeline">
          <div className="chronicle-heading">
            <span className="chronicle-year" aria-hidden="true">{selectedYear ?? currentFamilyYear()}</span>
            <h1 className="yearbook-display">成长时间线<span className="sr-only"> {selectedYear ?? currentFamilyYear()} 年</span></h1>
            {status === "authenticated" && (
              <div className="archive-actions" role="group" aria-label="新增成长记录">
                <Link href="/travel/new" className="family-button family-button-primary">
                  <BookOpen size={17} aria-hidden="true" /> 写旅行日记
                </Link>
                <Link href="/gallery/new" className="family-button family-button-outline">
                  <Camera size={17} aria-hidden="true" /> 上传摄影照片
                </Link>
                <Link href="/diary/new" className="family-button family-button-outline" prefetch={false}>
                  <LockKeyhole size={17} aria-hidden="true" /> 写私密日记
                </Link>
              </div>
            )}
          </div>

          <p className="chronicle-intro">日子一页页翻过，当时寻常，后来都成了故事。</p>

          <div className="archive-layout chronicle-layout">
            <YearSelector years={years} selected={selectedYear} path="/timeline" />
            <div className="archive-content" aria-busy={loading}>
              {loading && <p className="archive-status" role="status">正在加载时间线…</p>}
              {failed && <ArchiveError retry={retry} />}
              {archive && (
                <>
                  {archive.recent.length ? (
                    <ArchiveRecords records={archive.recent} />
                  ) : (
                    <div className="archive-status">
                      <p>这一年还没有时间线记录。</p>
                    </div>
                  )}

                  <div className="archive-pagination">
                    <p>共 {archive.total} 条记录</p>
                    {pages > 1 && (
                      <nav aria-label="时间线分页">
                        {archive.page > 1 && <Link href={`/timeline?year=${archive.year}&page=${archive.page - 1}`}>上一页</Link>}
                        <span>第 {archive.page} / {pages} 页</span>
                        {archive.page < pages && <Link href={`/timeline?year=${archive.year}&page=${archive.page + 1}`}>下一页</Link>}
                      </nav>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
