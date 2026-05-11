import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requiredLongText } from "@/lib/validation"

// 添加评论
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const body = await request.json()
    const content = requiredLongText(body.content, "评论内容")
    const travelEntryId = typeof body.travelEntryId === "string" ? body.travelEntryId : undefined
    const photoEntryId = typeof body.photoEntryId === "string" ? body.photoEntryId : undefined

    if (!travelEntryId && !photoEntryId) {
      return NextResponse.json({ error: "缺少关联内容ID" }, { status: 400 })
    }

    if (travelEntryId && photoEntryId) {
      return NextResponse.json({ error: "评论只能关联一类内容" }, { status: 400 })
    }

    if (travelEntryId) {
      const entry = await prisma.travelEntry.findUnique({ where: { id: travelEntryId }, select: { id: true } })
      if (!entry) return NextResponse.json({ error: "日记不存在" }, { status: 404 })
    }

    if (photoEntryId) {
      const photo = await prisma.photoEntry.findUnique({ where: { id: photoEntryId }, select: { id: true } })
      if (!photo) return NextResponse.json({ error: "照片不存在" }, { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
        travelEntryId: travelEntryId || null,
        photoEntryId: photoEntryId || null,
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

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("添加评论错误:", error)
    const message = error instanceof Error ? error.message : "添加评论失败"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

// 删除评论
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "缺少评论ID" }, { status: 400 })
    }

    const [user, comment] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      }),
      prisma.comment.findUnique({
        where: { id },
      })
    ])

    if (!comment) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 })
    }

    const isAdmin = user?.role === "admin"
    const isAuthor = comment.authorId === session.user.id

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ error: "无权删除" }, { status: 403 })
    }

    await prisma.comment.delete({
      where: { id },
    })

    return NextResponse.json({ message: "删除成功" })
  } catch (error) {
    console.error("删除评论错误:", error)
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}
