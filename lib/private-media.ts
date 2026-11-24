export const maxImageBytes = 4 * 1024 * 1024
export const imageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
export const imageAccept = imageMimeTypes.join(",")

export function isPrivateImageKey(key: string) {
  return /^(?:[0-9a-f-]{36}|[0-9a-f]{64})\.(?:jpg|png|webp|gif)$/.test(key)
}

export function parsePrivateImageUrl(value: unknown, label: string): string
export function parsePrivateImageUrl(value: unknown, label: string, required: false): string | undefined
export function parsePrivateImageUrl(value: unknown, label: string, required = true) {
  if (!required && (value === undefined || value === null || value === "")) return undefined
  const prefix = "/api/media/"
  if (typeof value !== "string" || !value.startsWith(prefix) || !isPrivateImageKey(value.slice(prefix.length))) {
    throw new Error(`请先上传${label}`)
  }
  return value
}
