import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"
import { hashInvitationCode, isInvitationCode, normalizeFamilyEmail } from "@/lib/family-invitation"
import { prisma } from "@/lib/prisma"
import { optionalString, requiredString } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const code = body?.invitationCode
    if (!isInvitationCode(code)) {
      return NextResponse.json({ error: "请填写有效的家庭邀请码" }, { status: 403 })
    }

    const email = normalizeFamilyEmail(body.email)
    const username = requiredString(body.username, "用户名", 50)
    const nickname = optionalString(body.nickname, 50) || username
    const password = body.password
    if (!email) return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 })
    if (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password) > 72) {
      return NextResponse.json({ error: "密码须至少 8 个字符，且不超过 72 字节" }, { status: 400 })
    }

    const codeHash = hashInvitationCode(code)
    const invitation = await prisma.familyInvitation.findUnique({
      where: { codeHash },
      select: { email: true, expiresAt: true, usedAt: true, revokedAt: true },
    })
    if (!invitation || invitation.email !== email || invitation.usedAt || invitation.revokedAt || invitation.expiresAt <= new Date()) {
      return NextResponse.json({ error: "邀请码无效、已过期或与邮箱不匹配" }, { status: 403 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const created = await prisma.$transaction(async (tx) => {
      const now = new Date()
      const claimed = await tx.familyInvitation.updateMany({
        where: { codeHash, email, usedAt: null, revokedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      })
      if (!claimed.count) return false

      await tx.user.create({
        data: { username, email, password: hashedPassword, nickname, accessStatus: "ACTIVE" },
      })
      return true
    })

    return created
      ? NextResponse.json({ message: "注册成功" }, { status: 201 })
      : NextResponse.json({ error: "邀请码已失效" }, { status: 403 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "用户名或邮箱已存在" }, { status: 409 })
    }
    if (error instanceof Error && error.message === "用户名不能为空") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 })
  }
}
