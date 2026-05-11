import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import type { Prisma } from "@prisma/client"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  allowedPhotoCategories,
  optionalString,
  parseDate,
  parseImageUrl,
  parsePhotoCategory,
  parseTags,
  requiredString,
} from "@/lib/validation"

// 获取所有照片
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const where: Prisma.PhotoEntryWhereInput = { published: true }
    if (category && category !== "all") {
      if (!allowedPhotoCategories.includes(category as (typeof allowedPhotoCategories)[number])) {
        return NextResponse.json({ error: "照片分类不正确" }, { status: 400 })
      }
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

    const body = await request.json()
    const title = requiredString(body.title, "标题", 100)
    const description = optionalString(body.description, 1_000)
    const imageUrl = parseImageUrl(body.imageUrl)
    const photoDate = parseDate(body.photoDate, "拍摄日期", false)
    const category = parsePhotoCategory(body.category)
    const tags = parseTags(body.tags)
    const thoughts = optionalString(body.thoughts, 5_000)

    const photo = await prisma.photoEntry.create({
      data: {
        title,
        description,
        imageUrl,
        photoDate,
        category,
        tags: JSON.stringify(tags),
        thoughts,
        authorId: session.user.id,
      },
    })

    return NextResponse.json(photo, { status: 201 })
  } catch (error) {
    console.error("添加照片错误:", error)
    const message = error instanceof Error ? error.message : "添加失败"
    return NextResponse.json({ error: message }, { status: 400 })
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
