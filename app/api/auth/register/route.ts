import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { optionalString, requiredString } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const username = requiredString(body.username, "用户名", 50)
    const email = requiredString(body.email, "邮箱", 254).toLowerCase()
    const password = requiredString(body.password, "密码", 128)
    const nickname = optionalString(body.nickname, 50) || username

    if (password.length < 8) {
      return NextResponse.json(
        { error: "密码至少需要8位" },
        { status: 400 }
      )
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: "邮箱格式不正确" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "用户名或邮箱已存在" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userCount = await prisma.user.count()
    const role = userCount === 0 ? "admin" : "user"

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        nickname,
        role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        nickname: true,
        avatar: true,
        theme: true,
        role: true,
        createdAt: true,
      }
    })

    return NextResponse.json(
      { message: "注册成功", user },
      { status: 201 }
    )
  } catch (error) {
    console.error("Register error:", error)
    const message = error instanceof Error ? error.message : "注册失败，请重试"
    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}
