import { get } from "@vercel/blob"
import { getFamilySession } from "@/lib/auth"
import { imageMimeTypes, isPrivateImageKey } from "@/lib/private-media"

const mediaHeaders = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "Cross-Origin-Resource-Policy": "same-origin",
}

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  if (!(await getFamilySession())) return new Response(null, { status: 401, headers: mediaHeaders })

  const { key } = await params
  if (!isPrivateImageKey(key)) return new Response(null, { status: 404, headers: mediaHeaders })
  const token = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN
  if (!token) return new Response(null, { status: 503, headers: mediaHeaders })

  try {
    const result = await get(`family-images/${key}`, { access: "private", token })
    if (!result || result.statusCode !== 200 || !imageMimeTypes.includes(result.blob.contentType)) {
      await result?.stream?.cancel()
      return new Response(null, { status: 404, headers: mediaHeaders })
    }

    const headers = new Headers({ ...mediaHeaders, "Content-Type": result.blob.contentType })
    const size = result.headers.get("content-length")
    if (size) headers.set("Content-Length", size)
    return new Response(result.stream, { headers })
  } catch {
    return new Response(null, { status: 502, headers: mediaHeaders })
  }
}
