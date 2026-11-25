import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import { getFamilySession } from "@/lib/auth"
import { parseEntryPlace, readEntryPlace, type MappedEntry } from "@/lib/entry-place"
import { prisma } from "@/lib/prisma"

export async function GET() {
  if (!(await getFamilySession())) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const [travels, photos] = await Promise.all([
    prisma.travelEntry.findMany({
      where: { published: true, place: { not: Prisma.DbNull } },
      select: { id: true, title: true, travelDate: true, place: true },
    }),
    prisma.photoEntry.findMany({
      where: { published: true, place: { not: Prisma.DbNull } },
      select: { id: true, title: true, photoDate: true, createdAt: true, place: true },
    }),
  ])

  const entries: MappedEntry[] = []
  for (const { id, title, travelDate, place } of travels) {
    const marker = readEntryPlace(place)
    if (marker) entries.push({ id, title, place: marker, type: "travel", date: travelDate.toISOString() })
  }
  for (const { id, title, photoDate, createdAt, place } of photos) {
    const marker = readEntryPlace(place)
    if (marker) entries.push({ id, title, place: marker, type: "photo", date: (photoDate ?? createdAt).toISOString() })
  }
  return NextResponse.json(entries.sort((a, b) => b.date.localeCompare(a.date)))
}

export async function PATCH(request: Request) {
  const session = await getFamilySession()
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 })

  let update
  try {
    const body = await request.json()
    if (!body || (body.type !== "travel" && body.type !== "photo") ||
        typeof body.id !== "string" || !body.id || body.id.length > 100 || !Object.hasOwn(body, "place")) {
      return NextResponse.json({ error: "请选择需要修改的条目" }, { status: 400 })
    }
    update = { id: body.id, type: body.type, place: parseEntryPlace(body.place) }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "地点格式不正确" }, { status: 400 })
  }

  const where = { id: update.id, ...(session.user.role === "admin" ? {} : { authorId: session.user.id }) }
  const data = { place: update.place ?? Prisma.DbNull }
  const { count } = update.type === "travel"
    ? await prisma.travelEntry.updateMany({ where, data })
    : await prisma.photoEntry.updateMany({ where, data })

  if (!count) return NextResponse.json({ error: "未找到可编辑的条目" }, { status: 404 })
  return NextResponse.json({ place: update.place })
}
