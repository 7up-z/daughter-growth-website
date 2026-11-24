import { head } from "@vercel/blob"
import { getFamilySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const mediaHeaders = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "Cross-Origin-Resource-Policy": "same-origin",
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getFamilySession())) return new Response(null, { status: 401, headers: mediaHeaders })

  const { id } = await params
  const video = await prisma.birthdayVideo.findUnique({ where: { id }, select: { privateVideoKey: true } })
  if (!video?.privateVideoKey) return new Response(null, { status: 404, headers: mediaHeaders })

  const token = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN
  if (!token) return new Response(null, { status: 503, headers: mediaHeaders })
  const range = request.headers.get("range")
  if (range && !/^bytes=(?:\d+-\d*|-\d+)$/.test(range)) {
    return new Response(null, { status: 416, headers: mediaHeaders })
  }

  try {
    const metadata = await head(video.privateVideoKey, { token })
    const url = new URL(metadata.url)
    if (url.protocol !== "https:" || !/^[a-z\d-]+\.private\.blob\.vercel-storage\.com$/.test(url.hostname) ||
        metadata.contentType !== "video/mp4" || metadata.pathname !== video.privateVideoKey) {
      return new Response(null, { status: 502, headers: mediaHeaders })
    }

    const headers = new Headers({ authorization: `Bearer ${token}` })
    if (range) headers.set("range", range)
    const response = await fetch(url, { headers, redirect: "error", cache: "no-store" })
    if (response.status !== 200 && response.status !== 206 && response.status !== 416) {
      await response.body?.cancel()
      return new Response(null, { status: 502, headers: mediaHeaders })
    }

    const resultHeaders = new Headers(mediaHeaders)
    resultHeaders.set("Content-Type", "video/mp4")
    for (const name of ["content-length", "content-range", "accept-ranges"]) {
      const value = response.headers.get(name)
      if (value) resultHeaders.set(name, value)
    }
    return new Response(response.body, { status: response.status, headers: resultHeaders })
  } catch {
    return new Response(null, { status: 502, headers: mediaHeaders })
  }
}
