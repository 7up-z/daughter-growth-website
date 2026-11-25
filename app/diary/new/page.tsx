import { redirect } from "next/navigation"
import { ThemedHeader, ThemedPageHero, ThemedShell } from "@/components/ui/theme-shell"
import { getFamilySession } from "@/lib/auth"
import { diaryMemberOptions, diaryReleaseInput } from "@/lib/private-diary"
import { DiaryForm } from "../diary-form"

export default async function NewDiaryPage() {
  const session = await getFamilySession()
  if (!session) redirect("/login")
  const members = await diaryMemberOptions(session.user.id)

  return (
    <ThemedShell maxWidth="max-w-4xl">
      <ThemedHeader title="写私密日记" backHref="/diary" />
      <main>
        <ThemedPageHero title="写私密日记" />
        <DiaryForm members={members} initial={{
          title: "", content: "", diaryDate: diaryReleaseInput(new Date()).slice(0, 10),
          audience: "OWNER", openAt: "", readerIds: [],
        }} />
      </main>
    </ThemedShell>
  )
}
