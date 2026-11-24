import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import { getFamilySession } from "@/lib/auth"
import { currentFamilyYear, type MemoryRecord, type MemorySummary } from "@/lib/memory-archive"
import { prisma } from "@/lib/prisma"

const timelinePageSize = 20
const recentLimit = 6

const events = Prisma.sql`
  WITH events AS (
    SELECT p."id", 'photo' AS type, p."title",
           CASE p."category"
             WHEN 'life' THEN '日常' WHEN 'travel' THEN '旅行' WHEN 'birthday' THEN '生日'
             WHEN 'festival' THEN '节日' WHEN 'featured' THEN '精选' ELSE '照片'
           END AS detail,
           COALESCE(p."photoDate", p."createdAt") AS date,
           p."photoDate" IS NULL AS "usesArchiveDate",
           '/gallery?photo=' || p."id" AS href, p."imageUrl",
           COALESCE(NULLIF(u."nickname", ''), u."username") AS author
      FROM "PhotoEntry" p JOIN "User" u ON u."id" = p."authorId"
     WHERE p."published"
    UNION ALL
    SELECT t."id", 'travel', t."title", COALESCE(NULLIF(t."location", ''), '旅行记录'),
           t."travelDate", false, '/travel/' || t."id", t."coverImage",
           COALESCE(NULLIF(u."nickname", ''), u."username")
      FROM "TravelEntry" t JOIN "User" u ON u."id" = t."authorId"
     WHERE t."published"
    UNION ALL
    SELECT b."id", 'birthday', b."title", '生日影像',
           make_timestamp(b."year", 1, 1, 0, 0, 0), false,
           '/birthday?video=' || b."id", b."thumbnail", 'Family Memories'
      FROM "BirthdayVideo" b
    UNION ALL
    SELECT c."id", 'message', left(c."content", 36), '家庭留言',
           c."createdAt", false, '/messages?message=' || c."id", NULL,
           COALESCE(NULLIF(u."nickname", ''), u."username")
      FROM "Comment" c JOIN "User" u ON u."id" = c."authorId"
     WHERE c."travelEntryId" IS NULL AND c."photoEntryId" IS NULL
  ), archive AS (
    SELECT *, EXTRACT(YEAR FROM (date AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Shanghai')::int AS year
      FROM events
  )
`

type DatabaseRecord = Omit<MemoryRecord, "date"> & { date: Date }
type YearCounts = MemorySummary["counts"] & { year: number }
const emptyCounts = { photos: 0, travels: 0, birthdayVideos: 0, messages: 0 }

function summaryCounts(rows: YearCounts[]): MemorySummary["counts"] {
  return rows.reduce((totals, row) => ({
    photos: totals.photos + row.photos,
    travels: totals.travels + row.travels,
    birthdayVideos: totals.birthdayVideos + row.birthdayVideos,
    messages: totals.messages + row.messages,
  }), emptyCounts)
}

export async function GET(request: Request) {
  try {
    if (!(await getFamilySession())) return NextResponse.json({ error: "未登录" }, { status: 401 })

    const params = new URL(request.url).searchParams
    const mode = params.get("mode")
    const requestedYear = params.get("year")
    const requestedPage = params.get("page") ?? "1"
    if ((mode !== null && mode !== "timeline" && mode !== "year") ||
        (requestedYear !== null && !/^[1-9]\d{3}$/.test(requestedYear)) ||
        !/^[1-9]\d{0,5}$/.test(requestedPage)) {
      return NextResponse.json({ error: "年份或页码不正确" }, { status: 400 })
    }

    const data = await prisma.$transaction(async (tx) => {
      const years = await tx.$queryRaw<YearCounts[]>`
        ${events}
        SELECT year, count(*) FILTER (WHERE type = 'photo')::int AS photos,
               count(*) FILTER (WHERE type = 'travel')::int AS travels,
               count(*) FILTER (WHERE type = 'birthday')::int AS "birthdayVideos",
               count(*) FILTER (WHERE type = 'message')::int AS messages
          FROM archive GROUP BY year ORDER BY year DESC
      `

      const now = currentFamilyYear()
      const year = requestedYear ? Number(requestedYear) : mode === "timeline" ? (years[0]?.year ?? now) : now
      const counts = summaryCounts(mode ? years.filter((row) => row.year === year) : years)
      const total = counts.photos + counts.travels + counts.birthdayVideos + counts.messages
      const pageSize = mode === "timeline" ? timelinePageSize : recentLimit
      const page = mode === "timeline" ? Math.min(Number(requestedPage), Math.max(1, Math.ceil(total / pageSize))) : 1
      const filter = mode ? Prisma.sql`WHERE year = ${year}` : Prisma.empty
      const records = await tx.$queryRaw<DatabaseRecord[]>`
        ${events}
        SELECT * FROM archive ${filter}
         ORDER BY date DESC, type, id LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
      `
      const recent = records.map((record) => ({ ...record, date: record.date.toISOString() }))
      if (!mode) return { counts, recent }

      const availableYears = [...new Set([now, year, ...years.map((row) => row.year)])].sort((a, b) => b - a)
      return { counts, recent, years: availableYears, year, page, total, pageSize }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead })

    return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) {
    console.error("获取家庭记忆汇总错误:", error)
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}
