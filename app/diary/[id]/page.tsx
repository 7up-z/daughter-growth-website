import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { LockKeyhole, Pencil } from "lucide-react"
import { ThemedHeader, ThemedPageHero, ThemedShell } from "@/components/ui/theme-shell"
import { getFamilySession } from "@/lib/auth"
import { diaryDateInput, formatDiaryRelease, visibleDiaries } from "@/lib/private-diary"
import { prisma } from "@/lib/prisma"

const audiences = { OWNER: "仅自己", MEMBERS: "指定成员可见", FAMILY: "全体家人可见" } as const

export default async function DiaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getFamilySession()
  if (!session) redirect("/login")
  const { id } = await params
  const entry = await prisma.privateDiary.findFirst({
    where: { id, ...visibleDiaries(session.user.id) },
    select: {
      title: true, content: true, diaryDate: true, audience: true, openAt: true, authorId: true,
      author: { select: { nickname: true, username: true } },
    },
  })
  if (!entry) notFound()

  const isAuthor = entry.authorId === session.user.id
  const date = diaryDateInput(entry.diaryDate)

  return (
    <ThemedShell>
      <ThemedHeader title="私密日记" backHref="/diary" backLabel="返回私密日记" action={isAuthor && (
        <Link href={`/diary/${encodeURIComponent(id)}/edit`} prefetch={false} className="family-button family-button-outline">
          <Pencil size={16} aria-hidden="true" /> 编辑日记
        </Link>
      )} />
      <main className="min-w-0 break-words">
        <ThemedPageHero title={entry.title} />
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--yearbook-muted)]">
          <time dateTime={date}>{date}</time>
          <span>{entry.author.nickname || entry.author.username}</span>
          {isAuthor && (
            <span className="inline-flex items-center gap-2">
              <LockKeyhole size={16} aria-hidden="true" />
              {audiences[entry.audience]}
              {entry.openAt && <span>· {formatDiaryRelease(entry.openAt)}起（北京时间）</span>}
            </span>
          )}
        </div>
        <article className="editorial-prose diary-reading">{entry.content}</article>
      </main>
    </ThemedShell>
  )
}
