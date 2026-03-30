import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, email, password, nickname } = body

    console.log("Register request:", { username, email })

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Please fill in all required fields" },
        { status: 400 }
      )
    }

    // Check if user exists
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
        { error: "Username or email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 检查是否是第一个用户，如果是则设为管理员
    const userCount = await prisma.user.count()
    const role = userCount === 0 ? "admin" : "user"

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        nickname: nickname || username,
        role,
      },
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

    console.log("User created:", user.id)

    return NextResponse.json(
      { message: "Registration successful", user },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: error.message || "Registration failed, please try again" },
      { status: 500 }
    )
  }
}
