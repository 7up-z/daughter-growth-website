"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowRight, CloudUpload, Pencil } from "lucide-react"
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
    <div className="yearbook-shell">
      <div className="yearbook-container">
        <FamilyMasthead />
        <main className="archive-main">
          <div className="archive-page-heading">
            <h1 className="yearbook-display">成长时间线</h1>
            {status === "authenticated" && (
              <div className="archive-actions">
                {selectedYear && (
                  <Link href={`/year-review?year=${selectedYear}`} className="family-text-link archive-review-link">
                    年度回顾 <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                )}
                <Link href="/gallery/new" className="family-button family-button-primary">
                  <CloudUpload size={19} aria-hidden="true" /> 上传照片
                </Link>
                <Link href="/travel/new" className="family-button family-button-outline archive-journal-link">
                  <Pencil size={17} aria-hidden="true" /> 写日记
                </Link>
              </div>
            )}
          </div>

          <div className="archive-layout">
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

          {status === "authenticated" && (
            <div className="archive-mobile-links">
              {selectedYear && (
                <Link href={`/year-review?year=${selectedYear}`} className="family-text-link">
                  年度回顾 <ArrowRight size={15} aria-hidden="true" />
                </Link>
              )}
              <Link href="/travel/new" className="family-text-link">
                <Pencil size={16} aria-hidden="true" /> 写日记
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
