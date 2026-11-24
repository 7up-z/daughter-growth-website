import { createHash, randomBytes } from "node:crypto"

export const invitationLifetime = 7 * 24 * 60 * 60 * 1000

export function createInvitationCode() {
  return randomBytes(24).toString("base64url")
}

export function hashInvitationCode(code: string) {
  return createHash("sha256").update(code).digest("hex")
}

export function isInvitationCode(code: unknown): code is string {
  return typeof code === "string" && /^[A-Za-z0-9_-]{32}$/.test(code)
}

export function normalizeFamilyEmail(email: unknown) {
  if (typeof email !== "string") return null
  const normalized = email.trim().toLowerCase()
  return normalized.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : null
}
