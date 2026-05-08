import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, email, password, nickname } = body

    console.log("Signup request:", { username, email })

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

    // Check if this is the first user (make them admin)
    const userCount = await prisma.user.count()
    const role = userCount === 0 ? "admin" : "user"

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        nickname: nickname || username,
        theme: "warm",
        role,
      },
    })

    console.log("User created:", user.id)

    return NextResponse.json({
      message: "Registration successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        theme: user.theme,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
