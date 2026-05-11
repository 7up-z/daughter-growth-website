import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { optionalString, parseDate, parseImageUrl, requiredLongText, requiredString } from "@/lib/validation"

// 获取所有旅行日记
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

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

    const body = await request.json()
    const title = requiredString(body.title, "标题", 100)
    const content = requiredLongText(body.content, "日记内容")
    const location = optionalString(body.location, 100)
    const travelDate = parseDate(body.travelDate, "旅行日期")
    const coverImage = parseImageUrl(body.coverImage, "封面图片", false)

    const entry = await prisma.travelEntry.create({
      data: {
        title,
        content,
        location,
        travelDate,
        coverImage,
        images: "[]",
        authorId: session.user.id,
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error("添加旅行日记错误:", error)
    const message = error instanceof Error ? error.message : "添加失败"
    return NextResponse.json({ error: message }, { status: 400 })
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
