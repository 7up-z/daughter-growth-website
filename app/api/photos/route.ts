import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// 获取所有照片
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const where: any = { published: true }
    if (category && category !== "all") {
      where.category = category
    }

    const photos = await prisma.photoEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    })

    return NextResponse.json(photos)
  } catch (error) {
    console.error("获取照片错误:", error)
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}

// 添加照片
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { title, description, imageUrl, photoDate, category, tags, thoughts } = await request.json()

    if (!title || !imageUrl) {
      return NextResponse.json({ error: "请填写标题和图片链接" }, { status: 400 })
    }

    const photo = await prisma.photoEntry.create({
      data: {
        title,
        description,
        imageUrl,
        photoDate: photoDate ? new Date(photoDate) : null,
        category: category || "life",
        tags: JSON.stringify(tags || []),
        thoughts,
        authorId: session.user.id,
      },
    })

    return NextResponse.json(photo, { status: 201 })
  } catch (error) {
    console.error("添加照片错误:", error)
    return NextResponse.json({ error: "添加失败" }, { status: 500 })
  }
}

// 删除照片
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "缺少照片ID" }, { status: 400 })
    }

    // 获取用户角色和照片信息
    const [user, photo] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      }),
      prisma.photoEntry.findUnique({
        where: { id },
      })
    ])

    if (!photo) {
      return NextResponse.json({ error: "照片不存在" }, { status: 404 })
    }

    // 管理员可以删除任何照片，普通用户只能删除自己的照片
    const isAdmin = user?.role === "admin"
    const isAuthor = photo.authorId === session.user.id

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ error: "无权删除" }, { status: 403 })
    }

    await prisma.photoEntry.delete({
      where: { id },
    })

    return NextResponse.json({ message: "删除成功" })
  } catch (error) {
    console.error("删除照片错误:", error)
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}
