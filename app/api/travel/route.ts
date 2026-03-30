import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// 获取所有旅行日记
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    // 如果提供了ID，返回单个日记详情
    if (id) {
      const entry = await prisma.travelEntry.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
              username: true,
              avatar: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  nickname: true,
                  username: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: { comments: true },
          },
        },
      })

      if (!entry) {
        return NextResponse.json({ error: "日记不存在" }, { status: 404 })
      }

      return NextResponse.json(entry)
    }

    // 返回所有日记列表
    const entries = await prisma.travelEntry.findMany({
      where: { published: true },
      orderBy: { travelDate: "desc" },
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

    return NextResponse.json(entries)
  } catch (error) {
    console.error("获取旅行日记错误:", error)
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}

// 添加旅行日记
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { title, content, location, travelDate, coverImage } = await request.json()

    if (!title || !content || !travelDate) {
      return NextResponse.json({ error: "请填写所有必填字段" }, { status: 400 })
    }

    const entry = await prisma.travelEntry.create({
      data: {
        title,
        content,
        location,
        travelDate: new Date(travelDate),
        coverImage,
        images: "[]",
        authorId: session.user.id,
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error("添加旅行日记错误:", error)
    return NextResponse.json({ error: "添加失败" }, { status: 500 })
  }
}

// 删除旅行日记
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "缺少日记ID" }, { status: 400 })
    }

    // 获取用户角色和日记信息
    const [user, entry] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      }),
      prisma.travelEntry.findUnique({
        where: { id },
      })
    ])

    if (!entry) {
      return NextResponse.json({ error: "日记不存在" }, { status: 404 })
    }

    // 管理员可以删除任何日记，普通用户只能删除自己的日记
    const isAdmin = user?.role === "admin"
    const isAuthor = entry.authorId === session.user.id

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ error: "无权删除" }, { status: 403 })
    }

    await prisma.travelEntry.delete({
      where: { id },
    })

    return NextResponse.json({ message: "删除成功" })
  } catch (error) {
    console.error("删除旅行日记错误:", error)
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}
