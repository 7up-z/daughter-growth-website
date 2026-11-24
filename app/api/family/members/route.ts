import { NextResponse } from "next/server"
import { getFamilySession } from "@/lib/auth"
import { createInvitationCode, hashInvitationCode, invitationLifetime, normalizeFamilyEmail } from "@/lib/family-invitation"
import { prisma } from "@/lib/prisma"

async function getAdministrator() {
  const session = await getFamilySession()
  return session?.user.role === "admin" ? session.user : null
}

function forbidden() {
  return NextResponse.json({ error: "仅管理员可管理家庭成员" }, { status: 403 })
}

export async function GET() {
  if (!(await getAdministrator())) return forbidden()
  const [members, invitations] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, username: true, nickname: true, email: true, role: true, accessStatus: true },
    }),
    prisma.familyInvitation.findMany({
      where: { usedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, expiresAt: true },
    }),
  ])
  return NextResponse.json({ members, invitations }, { headers: { "Cache-Control": "private, no-store" } })
}

export async function POST(request: Request) {
  const admin = await getAdministrator()
  if (!admin) return forbidden()
  const body = await request.json().catch(() => null)
  const email = normalizeFamilyEmail(body?.email)
  if (!email) return NextResponse.json({ error: "请输入有效的家人邮箱" }, { status: 400 })

  const member = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } })
  if (member) return NextResponse.json({ error: "该邮箱已有账号，可直接在成员列表中管理" }, { status: 409 })

  const code = createInvitationCode()
  const expiresAt = new Date(Date.now() + invitationLifetime)
  await prisma.familyInvitation.create({
    data: { email, creatorId: admin.id, codeHash: hashInvitationCode(code), expiresAt },
  })
  return NextResponse.json({ code, expiresAt }, { status: 201, headers: { "Cache-Control": "no-store" } })
}

export async function PATCH(request: Request) {
  if (!(await getAdministrator())) return forbidden()
  const body = await request.json().catch(() => null)
  if (typeof body?.id !== "string" || !["ACTIVE", "REVOKED"].includes(body?.accessStatus)) {
    return NextResponse.json({ error: "成员或访问状态无效" }, { status: 400 })
  }

  const result = await prisma.user.updateMany({
    where: { id: body.id, role: { not: "admin" }, accessStatus: { not: body.accessStatus } },
    data: { accessStatus: body.accessStatus, sessionVersion: { increment: 1 } },
  })
  return result.count
    ? NextResponse.json({ message: "已更新成员权限" })
    : NextResponse.json({ error: "成员不存在或权限状态无法更新" }, { status: 409 })
}

export async function DELETE(request: Request) {
  if (!(await getAdministrator())) return forbidden()
  const id = new URL(request.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "缺少邀请编号" }, { status: 400 })

  const result = await prisma.familyInvitation.updateMany({
    where: { id, usedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  })
  return result.count
    ? NextResponse.json({ message: "已撤销邀请" })
    : NextResponse.json({ error: "邀请已失效" }, { status: 409 })
}
