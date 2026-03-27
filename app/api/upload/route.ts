import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { put } from "@vercel/blob"

// 使用 Vercel Blob 存储上传的文件
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "请选择要上传的图片" }, { status: 400 })
    }

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "只能上传图片文件" }, { status: 400 })
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "图片大小不能超过10MB" }, { status: 400 })
    }

    // 上传到 Vercel Blob
    const blob = await put(`images/${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    return NextResponse.json({ 
      url: blob.url,
      filename: file.name,
      size: file.size 
    })
  } catch (error) {
    console.error("上传图片错误:", error)
    return NextResponse.json({ error: "上传失败" }, { status: 500 })
  }
}
