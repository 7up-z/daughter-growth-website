import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { put } from "@vercel/blob"

const MAX_IMAGE_SIZE = 10 * 1024 * 1024

function sanitizeFilename(filename: string) {
  const cleaned = filename.replace(/[^a-zA-Z0-9._-]/g, "-")
  return cleaned || "image"
}

// 使用 Vercel Blob 存储上传的文件
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("image")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请选择要上传的图片" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "只能上传图片文件" }, { status: 400 })
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "图片大小不能超过10MB" }, { status: 400 })
    }

    const filename = sanitizeFilename(file.name)
    const blob = await put(`images/${session.user.id}/${Date.now()}-${filename}`, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      filename,
      size: file.size
    })
  } catch (error) {
    console.error("上传图片错误:", error)
    return NextResponse.json({ error: "上传失败" }, { status: 500 })
  }
}
