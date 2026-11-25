import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requiredLongText, requiredString } from "@/lib/validation"

export const diaryIntro = "有些话想先留给自己，有些话等到了日子，再慢慢说给家人听。"

const shanghaiOffset = 8 * 60 * 60 * 1000

export function diaryDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function diaryReleaseInput(date: Date) {
  return new Date(date.getTime() + shanghaiOffset).toISOString().slice(0, 16)
}

export function formatDiaryRelease(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Shanghai",
  }).format(date)
}

export function visibleDiaries(viewerId: string, now = new Date()): Prisma.PrivateDiaryWhereInput {
  return {
    OR: [
      { authorId: viewerId },
      { audience: "FAMILY", openAt: { lte: now } },
      {
        audience: "MEMBERS",
        readers: { some: { userId: viewerId } },
        OR: [{ openAt: null }, { openAt: { lte: now } }],
      },
    ],
  }
}

export async function diaryMemberOptions(authorId: string) {
  const users = await prisma.user.findMany({
    where: { accessStatus: "ACTIVE", id: { not: authorId } },
    select: { id: true, nickname: true, username: true },
    orderBy: { username: "asc" },
  })
  return users.map(({ id, nickname, username }) => ({
    id,
    name: nickname && nickname !== username ? `${nickname}（${username}）` : username,
  }))
}

export function parseDiaryInput(data: unknown, authorId: string) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("请填写日记内容")
  const body = data as Record<string, unknown>
  const title = requiredString(body.title, "标题", 100)
  const content = requiredLongText(body.content, "正文")

  if (typeof body.diaryDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.diaryDate)) {
    throw new Error("请选择有效的记录日期")
  }
  const diaryDate = new Date(`${body.diaryDate}T00:00:00.000Z`)
  if (!Number.isFinite(diaryDate.getTime()) || diaryDateInput(diaryDate) !== body.diaryDate) {
    throw new Error("请选择有效的记录日期")
  }

  const { audience } = body
  if (audience !== "OWNER" && audience !== "MEMBERS" && audience !== "FAMILY") {
    throw new Error("请选择可见范围")
  }

  let openAt = null
  if (audience !== "OWNER" && body.openAt !== "" && body.openAt != null) {
    if (typeof body.openAt !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(body.openAt)) {
      throw new Error("请选择有效的开放时间")
    }
    openAt = new Date(`${body.openAt}:00+08:00`)
    if (!Number.isFinite(openAt.getTime()) || diaryReleaseInput(openAt) !== body.openAt) {
      throw new Error("请选择有效的开放时间")
    }
  }
  if (audience === "FAMILY" && !openAt) throw new Error("向全体家人开放需要选择时间")

  let readerIds: string[] = []
  if (audience === "MEMBERS") {
    if (!Array.isArray(body.readerIds) || !body.readerIds.length || body.readerIds.length > 100 ||
        !body.readerIds.every((id) => typeof id === "string" && id.length > 0 && id.length <= 100 && id !== authorId)) {
      throw new Error("请从下拉框选择可读成员")
    }
    readerIds = Array.from(new Set<string>(body.readerIds))
  }

  return { title, content, diaryDate, audience, openAt, readerIds } as const
}

export async function saveDiary(authorId: string, id: string | null, payload: ReturnType<typeof parseDiaryInput>) {
  const { readerIds, ...data } = payload
  return prisma.$transaction(async (tx) => {
    if (id) {
      const updated = await tx.privateDiary.updateMany({ where: { id, authorId }, data })
      if (updated.count === 0) return { status: "missing" } as const
    }

    const activeReaders = readerIds.length ? await tx.user.count({
      where: { id: { in: readerIds }, accessStatus: "ACTIVE" },
    }) : 0
    if (activeReaders !== readerIds.length) throw new Error("成员的访问状态已改变，请重新选择")

    if (!id) {
      const diary = await tx.privateDiary.create({ data: { ...data, authorId }, select: { id: true } })
      id = diary.id
    } else {
      await tx.privateDiaryReader.deleteMany({ where: { diaryId: id } })
    }
    if (readerIds.length) {
      const diaryId = id
      await tx.privateDiaryReader.createMany({ data: readerIds.map((userId) => ({ diaryId, userId })) })
    }
    return { status: "saved", id } as const
  })
}
