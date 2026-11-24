"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import type { MemoryArchive } from "@/lib/memory-archive"

export function useMemoryArchive(mode: "timeline" | "year", active: boolean) {
  const params = useSearchParams()
  const query = new URLSearchParams({ mode })
  const year = params.get("year")
  const page = params.get("page")
  if (year) query.set("year", year)
  if (mode === "timeline" && page) query.set("page", page)
  const url = `/api/memory/summary?${query}`

  const [response, setResponse] = useState<{ url: string; archive: MemoryArchive | null } | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!active) return
    const controller = new AbortController()
    async function load() {
      try {
        const res = await fetch(url, { signal: controller.signal, cache: "no-store" })
        if (!res.ok) throw new Error("获取家庭档案失败")
        const archive: MemoryArchive = await res.json()
        if (!controller.signal.aborted) setResponse({ url, archive })
      } catch {
        if (!controller.signal.aborted) setResponse({ url, archive: null })
      }
    }
    void load()
    return () => controller.abort()
  }, [url, active, retry])

  const current = active && response?.url === url ? response : null
  const previous = active ? response?.archive : null
  return {
    archive: current?.archive ?? null,
    years: previous?.years ?? [],
    selectedYear: current?.archive?.year ?? (year ? Number(year) : previous?.year),
    loading: !current,
    failed: current?.archive === null,
    retry: () => {
      setResponse(null)
      setRetry((value) => value + 1)
    },
  }
}

export function YearSelector({ years, selected, path }: { years: number[]; selected?: number; path: string }) {
  if (!years.length) return null
  return (
    <nav aria-label="按年份查看" className="archive-years">
      <p>按年查看</p>
      <div className="archive-year-links">
        {years.map((year) => (
          <Link
            key={year}
            href={`${path}?year=${year}`}
            aria-current={year === selected ? "page" : undefined}
            aria-label={`${year}年`}
            scroll={false}
          >
            {year}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export function ArchiveError({ retry }: { retry: () => void }) {
  return (
    <div className="archive-status" role="alert">
      <p>暂时无法读取记录。</p>
      <button type="button" onClick={retry} className="family-button family-button-outline">重试</button>
    </div>
  )
}
