"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowRight, Cake, Camera, MapPin, MessageCircle } from "lucide-react"
import { ArchiveRecords } from "@/components/ui/archive-records"
import { FamilyMasthead } from "@/components/ui/family-masthead"
import { ArchiveError, useMemoryArchive, YearSelector } from "@/components/ui/memory-archive-controls"

export default function YearReviewPage() {
  const { status } = useSession()
  const router = useRouter()
  const { archive, years, selectedYear, loading, failed, retry } = useMemoryArchive("year", status === "authenticated")

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login")
  }, [status, router])

  return (
    <div className="yearbook-shell">
      <div className="yearbook-container">
        <FamilyMasthead />
        <main className="archive-main">
          <div className="archive-page-heading">
            <h1 className="yearbook-display">{selectedYear ? `${selectedYear} 年度回顾` : "年度回顾"}</h1>
            {selectedYear && (
              <Link href={`/timeline?year=${selectedYear}`} className="family-text-link">
                查看完整时间线 <ArrowRight size={15} aria-hidden="true" />
              </Link>
            )}
          </div>
          <div className="archive-layout">
            <YearSelector years={years} selected={selectedYear} path="/year-review" />
            <div className="archive-content" aria-busy={loading}>
              {loading && <p className="archive-status" role="status">正在加载年度回顾…</p>}
              {failed && <ArchiveError retry={retry} />}
              {archive && (
                <>
                  <section className="archive-year-counts" aria-label="年度记录统计">
                    {[
                      { label: "照片", count: archive.counts.photos, icon: Camera, href: "/gallery" },
                      { label: "旅行", count: archive.counts.travels, icon: MapPin, href: "/travel" },
                      { label: "生日影像", count: archive.counts.birthdayVideos, icon: Cake, href: "/birthday" },
                      { label: "家庭留言", count: archive.counts.messages, icon: MessageCircle, href: "/messages" },
                    ].map(({ label, count, icon: Icon, href }) => (
                      <Link key={label} href={href}>
                        <p className="archive-year-count">{count}</p>
                        <p className="archive-year-count-label"><Icon size={16} aria-hidden="true" /> {label}</p>
                      </Link>
                    ))}
                  </section>
                  {archive.recent.length
                    ? <ArchiveRecords records={archive.recent} />
                    : <p className="archive-status">这一年还没有年度记录。</p>}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
