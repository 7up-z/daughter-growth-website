import { redirect } from "next/navigation"
import { getFamilySession } from "@/lib/auth"
import { FamilyMembers } from "./family-members"

export default async function FamilySettingsPage() {
  const session = await getFamilySession()
  if (!session) redirect("/login")
  if (session.user.role !== "admin") redirect("/profile")

  return <FamilyMembers />
}
