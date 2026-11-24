import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import sharp from "sharp"
import { getFamilySession } from "@/lib/auth"
import { imageMimeTypes, maxImageBytes } from "@/lib/private-media"

export async function POST(request: Request) {
  const session = await getFamilySession()
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const token = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN
  if (!token) return NextResponse.json({ error: "私有图片存储暂不可用" }, { status: 503 })

  const formData = await request.formData().catch(() => null)
  const file = formData?.get("image")
  if (!(file instanceof File) || !imageMimeTypes.includes(file.type) || file.size === 0) {
    return NextResponse.json({ error: "请选择 JPG、PNG、WebP 或 GIF 图片" }, { status: 400 })
  }
  if (file.size > maxImageBytes) {
    return NextResponse.json({ error: "图片大小不能超过 4 MB" }, { status: 413 })
  }

  const input = Buffer.from(await file.arrayBuffer())
  const image = sharp(input, { animated: true, limitInputPixels: 40_000_000 })
  const metadata = await image.metadata().catch(() => null)
  const format = metadata?.format
  if (!metadata || (format !== "jpeg" && format !== "png" && format !== "webp" && format !== "gif")) {
    return NextResponse.json({ error: "图片格式有误或文件已损坏" }, { status: 400 })
  }

  let sanitized: Buffer
  try {
    // Normalizing the image removes GPS and other source metadata.
    sanitized = await (metadata.pages && metadata.pages > 1 ? image : image.autoOrient()).toBuffer()
  } catch {
    return NextResponse.json({ error: "这张图片无法读取" }, { status: 400 })
  }

  const key = `${randomUUID()}.${format === "jpeg" ? "jpg" : format}`
  try {
    await put(`family-images/${key}`, sanitized, { access: "private", token, contentType: `image/${format}` })
    return NextResponse.json({ url: `/api/media/${key}`, filename: file.name, size: sanitized.length })
  } catch {
    return NextResponse.json({ error: "上传失败，请稍后重试" }, { status: 502 })
  }
}
