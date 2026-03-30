import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// 获取所有留言
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const messages = await prisma.comment.findMany({
      where: {
        travelEntryId: null,
        photoEntryId: null,
      },
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
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("获取留言错误:", error)
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}

// 添加留言
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { content } = await request.json()

    if (!content.trim()) {
      return NextResponse.json({ error: "留言内容不能为空" }, { status: 400 })
    }

    const message = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
      },
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
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("添加留言错误:", error)
    return NextResponse.json({ error: "添加失败" }, { status: 500 })
  }
}

// 删除留言
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "缺少留言ID" }, { status: 400 })
    }

    // 获取用户角色和留言信息
    const [user, message] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      }),
      prisma.comment.findUnique({
        where: { id },
      })
    ])

    if (!message) {
      return NextResponse.json({ error: "留言不存在" }, { status: 404 })
    }

    // 管理员可以删除任何留言，普通用户只能删除自己的留言
    const isAdmin = user?.role === "admin"
    const isAuthor = message.authorId === session.user.id

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ error: "无权删除" }, { status: 403 })
    }

    await prisma.comment.delete({
      where: { id },
    })

    return NextResponse.json({ message: "删除成功" })
  } catch (error) {
    console.error("删除留言错误:", error)
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}
