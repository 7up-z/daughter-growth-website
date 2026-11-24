import { createHash, randomUUID } from "node:crypto"
import { openAsBlob } from "node:fs"
import { get, head, put } from "@vercel/blob"
import pg from "pg"

const [mode = "--inventory", videoId, file] = process.argv.slice(2)
const token = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN
const databaseUrl = process.env.DATABASE_URL
const publicOrigin = process.env.BLOB_LEGACY_PUBLIC_ORIGIN
const validOrigin = /^https:\/\/[a-z\d-]+\.public\.blob\.vercel-storage\.com$/i
const imageExtensions = new Map([
  ["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"], ["image/gif", "gif"],
])
const maxLegacyImageBytes = 25 * 1024 * 1024
const fields = [
  { table: "PhotoEntry", column: "imageUrl" },
  { table: "TravelEntry", column: "coverImage" },
  { table: "TravelEntry", column: "images", array: true },
  { table: "User", column: "avatar" },
  { table: "BirthdayVideo", column: "thumbnail" },
]

if (!databaseUrl || !["--inventory", "--copy-images", "--attach-video"].includes(mode)) {
  throw new Error("Set DATABASE_URL and choose --inventory, --copy-images, or --attach-video <id> <local file>")
}
if (mode !== "--inventory" && !token) throw new Error("BLOB_PRIVATE_READ_WRITE_TOKEN is required")
if (mode === "--copy-images" && !validOrigin.test(publicOrigin ?? "")) {
  throw new Error("BLOB_LEGACY_PUBLIC_ORIGIN must be the exact HTTPS origin of the old public Blob store")
}

const db = new pg.Client({ connectionString: databaseUrl })
await db.connect()

function classify(value) {
  if (value.startsWith("/api/media/")) return "private"
  try {
    const url = new URL(value)
    if (url.origin === publicOrigin && !url.username && !url.password && !url.search && !url.hash) {
      return "copyable"
    }
    if (validOrigin.test(url.origin)) return "otherPublicBlob"
  } catch {
    // Relative paths need an explicit source, so they are left in place.
  }
  return "otherSource"
}

function entries(value, array) {
  if (!array) return [value]
  try {
    const decoded = JSON.parse(value)
    return Array.isArray(decoded) ? decoded : []
  } catch {
    return []
  }
}

async function copyImage(source) {
  const response = await fetch(source, { redirect: "error", signal: AbortSignal.timeout(30000) })
  const contentType = response.headers.get("content-type")?.split(";")[0]
  const extension = imageExtensions.get(contentType)
  const size = Number(response.headers.get("content-length"))
  if (!response.ok || !extension || !size || size > maxLegacyImageBytes) {
    await response.body?.cancel()
    throw new Error("Unexpected image type, size or upstream response")
  }
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length !== size) throw new Error("Source size did not match response")
  const hash = createHash("sha256").update(bytes).digest("hex")
  const key = `${hash}.${extension}`
  const path = `family-images/${key}`
  const getPrivate = () => get(path, { access: "private", token, useCache: false })
  let copy = await getPrivate()
  if (!copy) {
    await put(path, bytes, { access: "private", token, contentType, allowOverwrite: true })
    copy = await getPrivate()
  }
  if (copy?.statusCode !== 200 || copy.blob.size !== size || copy.blob.contentType !== contentType) {
    await copy?.stream?.cancel()
    throw new Error("Private copy could not be verified")
  }
  const copiedBytes = Buffer.from(await new Response(copy.stream).arrayBuffer())
  if (createHash("sha256").update(copiedBytes).digest("hex") !== hash) {
    throw new Error("Private copy checksum did not match")
  }
  return `/api/media/${key}`
}

async function processImages() {
  const counts = { private: 0, copyable: 0, otherPublicBlob: 0, otherSource: 0, copied: 0, retained: 0 }
  const copied = new Map()
  for (const { table, column, array } of fields) {
    const { rows } = await db.query(`SELECT "id", "${column}" AS value FROM "${table}" WHERE "${column}" IS NOT NULL`)
    for (const { id, value } of rows) {
      const sources = entries(value, array)
      const replacements = []
      for (const source of sources) {
        if (typeof source !== "string" || !source) {
          replacements.push(source)
          continue
        }

        const kind = classify(source)
        counts[kind]++
        if (mode !== "--copy-images" || kind !== "copyable") {
          replacements.push(source)
          continue
        }

        try {
          if (!copied.has(source)) copied.set(source, await copyImage(source))
          replacements.push(copied.get(source))
        } catch {
          counts.retained++
          replacements.push(source)
        }
      }

      const changed = replacements.filter((replacement, index) => replacement !== sources[index]).length
      if (changed) {
        const target = array ? JSON.stringify(replacements) : replacements[0]
        const result = await db.query(
          `UPDATE "${table}" SET "${column}" = $1 WHERE "id" = $2 AND "${column}" = $3`,
          [target, id, value],
        )
        counts.copied += result.rowCount ? changed : 0
        counts.retained += result.rowCount ? 0 : changed
      }
    }
  }
  const { rows: [videos] } = await db.query(
    'SELECT count(*) FILTER (WHERE "privateVideoKey" IS NULL)::int AS external, count("privateVideoKey")::int AS private FROM "BirthdayVideo"',
  )
  console.log(JSON.stringify({ imageReferences: counts, birthdayVideos: videos }, null, 2))
  if (counts.retained) process.exitCode = 1
}

async function attachVideo() {
  if (!videoId || !file || !file.toLowerCase().endsWith(".mp4")) throw new Error("Choose an existing birthday record and an MP4 file")
  const record = await db.query('SELECT "privateVideoKey" FROM "BirthdayVideo" WHERE "id" = $1', [videoId])
  if (!record.rowCount || record.rows[0].privateVideoKey) throw new Error("Record does not exist or already has a private video")

  const video = await openAsBlob(file, { type: "video/mp4" })
  const signature = Buffer.from(await video.slice(0, 12).arrayBuffer())
  if (signature.toString("ascii", 4, 8) !== "ftyp" || video.size < 12) throw new Error("The file is not a valid MP4 container")
  const path = `family-videos/${randomUUID()}.mp4`
  await put(path, video, { token, access: "private", contentType: "video/mp4", multipart: true })
  const metadata = await head(path, { token })
  if (metadata.size !== video.size || metadata.contentType !== "video/mp4") throw new Error("Private video could not be verified")
  const attached = await db.query(
    'UPDATE "BirthdayVideo" SET "privateVideoKey" = $1 WHERE "id" = $2 AND "privateVideoKey" IS NULL',
    [path, videoId],
  )
  if (!attached.rowCount) throw new Error("Birthday record changed while uploading")
  console.log("Private video attached.")
}

try {
  if (mode === "--attach-video") await attachVideo()
  else await processImages()
} finally {
  await db.end()
}
