import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const [photos, travels, birthdayVideos, messages, counts] = await Promise.all([
      prisma.photoEntry.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: {
          author: {
            select: { nickname: true, username: true },
          },
        },
      }),
      prisma.travelEntry.findMany({
        where: { published: true },
        orderBy: { travelDate: "desc" },
        take: 4,
        include: {
          author: {
            select: { nickname: true, username: true },
          },
        },
      }),
      prisma.birthdayVideo.findMany({
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
        take: 4,
      }),
      prisma.comment.findMany({
        where: {
          travelEntryId: null,
          photoEntryId: null,
        },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: {
          author: {
            select: { nickname: true, username: true },
          },
        },
      }),
      Promise.all([
        prisma.photoEntry.count({ where: { published: true } }),
        prisma.travelEntry.count({ where: { published: true } }),
        prisma.birthdayVideo.count(),
        prisma.comment.count({
          where: {
            travelEntryId: null,
            photoEntryId: null,
          },
        }),
      ]),
    ])

    const recent = [
      ...photos.map((item) => ({
        id: item.id,
        type: "photo" as const,
        title: item.title,
        detail: item.category,
        date: item.photoDate ?? item.createdAt,
        href: "/gallery",
        imageUrl: item.imageUrl,
        author: item.author.nickname || item.author.username,
      })),
      ...travels.map((item) => ({
        id: item.id,
        type: "travel" as const,
        title: item.title,
        detail: item.location || "旅行记录",
        date: item.travelDate,
        href: `/travel/${item.id}`,
        imageUrl: item.coverImage,
        author: item.author.nickname || item.author.username,
      })),
      ...birthdayVideos.map((item) => ({
        id: item.id,
        type: "birthday" as const,
        title: item.title,
        detail: `${item.year} 年生日影像`,
        date: item.createdAt,
        href: "/birthday",
        imageUrl: item.thumbnail,
        author: "Family Memories",
      })),
      ...messages.map((item) => ({
        id: item.id,
        type: "message" as const,
        title: item.content.slice(0, 36),
        detail: "家庭留言",
        date: item.createdAt,
        href: "/messages",
        imageUrl: null,
        author: item.author.nickname || item.author.username,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6)

    return NextResponse.json({
      counts: {
        photos: counts[0],
        travels: counts[1],
        birthdayVideos: counts[2],
        messages: counts[3],
      },
      recent,
    })
  } catch (error) {
    console.error("获取家庭记忆汇总错误:", error)
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}

