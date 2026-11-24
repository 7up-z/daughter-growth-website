export type MemoryType = "photo" | "travel" | "birthday" | "message"

export type MemoryRecord = {
  id: string
  type: MemoryType
  title: string
  detail: string
  date: string
  year: number
  usesArchiveDate: boolean
  href: string
  imageUrl: string | null
  author: string
}

export type MemorySummary = {
  counts: { photos: number; travels: number; birthdayVideos: number; messages: number }
  recent: MemoryRecord[]
}

export type MemoryArchive = MemorySummary & {
  years: number[]
  year: number
  page: number
  total: number
  pageSize: number
}

const familyTimeZone = "Asia/Shanghai"

export function currentFamilyYear() {
  return Number(new Intl.DateTimeFormat("en", { year: "numeric", timeZone: familyTimeZone }).format(new Date()))
}

export function formatMemoryDate(record: Pick<MemoryRecord, "type" | "year" | "date">) {
  if (record.type === "birthday") return `${record.year}年`
  return new Date(record.date).toLocaleDateString("zh-CN", {
    timeZone: familyTimeZone, year: "numeric", month: "long", day: "numeric",
  })
}
