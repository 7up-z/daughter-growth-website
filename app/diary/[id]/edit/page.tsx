import { notFound, redirect } from "next/navigation"
import { ThemedHeader, ThemedPageHero, ThemedShell } from "@/components/ui/theme-shell"
import { getFamilySession } from "@/lib/auth"
import { diaryDateInput, diaryMemberOptions, diaryReleaseInput } from "@/lib/private-diary"
import { prisma } from "@/lib/prisma"
import { DiaryForm } from "../../diary-form"

export default async function EditDiaryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getFamilySession()
  if (!session) redirect("/login")
  const { id } = await params
  const diary = await prisma.privateDiary.findFirst({
    where: { id, authorId: session.user.id },
    select: {
      id: true, title: true, content: true, diaryDate: true, audience: true, openAt: true,
      readers: { select: { userId: true } },
    },
  })
  if (!diary) notFound()

  const members = await diaryMemberOptions(session.user.id)
  const activeIds = new Set(members.map(({ id }) => id))

  return (
    <ThemedShell maxWidth="max-w-4xl">
      <ThemedHeader title="编辑日记" backHref={`/diary/${encodeURIComponent(id)}`} />
      <main>
        <ThemedPageHero title="编辑日记" />
        <DiaryForm members={members} initial={{
          id: diary.id, title: diary.title, content: diary.content, diaryDate: diaryDateInput(diary.diaryDate),
          audience: diary.audience, openAt: diary.openAt ? diaryReleaseInput(diary.openAt) : "",
          readerIds: diary.readers.map(({ userId }) => userId).filter((userId) => activeIds.has(userId)),
        }} />
      </main>
    </ThemedShell>
  )
}
