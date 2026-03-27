import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// 获取用户信息
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        nickname: true,
        avatar: true,
        theme: true,
        createdAt: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("获取用户信息错误:", error)
    return NextResponse.json(
      { error: "获取用户信息失败" },
      { status: 500 }
    )
  }
}

// 更新用户信息
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      )
    }

    const { nickname, avatar, theme } = await request.json()

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        nickname: nickname || undefined,
        avatar: avatar || undefined,
        theme: theme || undefined,
      },
      select: {
        id: true,
        username: true,
        email: true,
        nickname: true,
        avatar: true,
        theme: true,
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("更新用户信息错误:", error)
    return NextResponse.json(
      { error: "更新用户信息失败" },
      { status: 500 }
    )
  }
}
