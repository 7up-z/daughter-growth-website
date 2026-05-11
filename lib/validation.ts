const MAX_TEXT_LENGTH = 10_000
const MAX_SHORT_TEXT_LENGTH = 200

export const allowedPhotoCategories = ["landscape", "portrait", "life", "travel"] as const
export type PhotoCategory = (typeof allowedPhotoCategories)[number]

export const allowedThemes = ["paper", "cinematic", "playful", "future"] as const
export type UserTheme = (typeof allowedThemes)[number]

export function normalizeString(value: unknown, maxLength = MAX_SHORT_TEXT_LENGTH) {
  if (typeof value !== "string") return ""
  return value.trim().slice(0, maxLength)
}

export function optionalString(value: unknown, maxLength = MAX_SHORT_TEXT_LENGTH) {
  const normalized = normalizeString(value, maxLength)
  return normalized || undefined
}

export function requiredString(value: unknown, fieldName: string, maxLength = MAX_SHORT_TEXT_LENGTH) {
  const normalized = normalizeString(value, maxLength)
  if (!normalized) {
    throw new Error(`${fieldName}不能为空`)
  }
  return normalized
}

export function requiredLongText(value: unknown, fieldName: string) {
  return requiredString(value, fieldName, MAX_TEXT_LENGTH)
}

export function parseDate(value: unknown, fieldName: string, required?: true): Date
export function parseDate(value: unknown, fieldName: string, required: false): Date | null
export function parseDate(value: unknown, fieldName: string, required = true) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(`${fieldName}不能为空`)
    return null
  }

  if (typeof value !== "string" && !(value instanceof Date)) {
    throw new Error(`${fieldName}格式不正确`)
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName}格式不正确`)
  }

  return date
}

export function parseInteger(value: unknown, fieldName: string) {
  const number = typeof value === "number" ? value : Number.parseInt(String(value), 10)
  if (!Number.isInteger(number)) {
    throw new Error(`${fieldName}必须是整数`)
  }
  return number
}

export function parsePhotoCategory(value: unknown): PhotoCategory {
  const category = normalizeString(value) || "life"
  if (!allowedPhotoCategories.includes(category as PhotoCategory)) {
    throw new Error("照片分类不正确")
  }
  return category as PhotoCategory
}

export function parseTags(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((tag) => normalizeString(tag, 30))
    .filter(Boolean)
    .slice(0, 20)
}

export function parseTheme(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined

  const theme = normalizeString(value)
  if (!allowedThemes.includes(theme as UserTheme)) {
    throw new Error("主题不正确")
  }
  return theme as UserTheme
}

export function parseImageUrl(value: unknown, fieldName?: string, required?: true): string
export function parseImageUrl(value: unknown, fieldName: string, required: false): string | undefined
export function parseImageUrl(value: unknown, fieldName = "图片链接", required = true) {
  const url = normalizeString(value, 2_000)
  if (!url) {
    if (required) throw new Error(`${fieldName}不能为空`)
    return undefined
  }

  const isAllowedRelativePath = url.startsWith("/")
  const isAllowedDataUrl = url.startsWith("data:image/")
  const isAllowedHttpUrl = (() => {
    try {
      const parsed = new URL(url)
      return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch {
      return false
    }
  })()

  if (!isAllowedRelativePath && !isAllowedDataUrl && !isAllowedHttpUrl) {
    throw new Error(`${fieldName}格式不正确`)
  }

  return url
}
