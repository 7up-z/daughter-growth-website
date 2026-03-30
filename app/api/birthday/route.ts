import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// 获取所有生日视频
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const videos = await prisma.birthdayVideo.findMany({
      orderBy: [
        { year: "desc" },
        { createdAt: "desc" }
      ],
    })

    return NextResponse.json(videos)
  } catch (error) {
    console.error("获取生日视频错误:", error)
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}

// 添加生日视频
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { year, title, bvid, description } = await request.json()

    if (!year || !title || !bvid) {
      return NextResponse.json({ error: "请填写所有必填字段" }, { status: 400 })
    }

    const video = await prisma.birthdayVideo.create({
      data: {
        year: parseInt(year),
        title,
        bvid,
        description,
      },
    })

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error("添加生日视频错误:", error)
    return NextResponse.json({ error: "添加失败" }, { status: 500 })
  }
}

// 删除生日视频
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "缺少视频ID" }, { status: 400 })
    }

    // 检查是否是管理员
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "无权删除" }, { status: 403 })
    }

    await prisma.birthdayVideo.delete({
      where: { id },
    })

    return NextResponse.json({ message: "删除成功" })
  } catch (error) {
    console.error("删除生日视频错误:", error)
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}
