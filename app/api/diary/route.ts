import { NextResponse } from "next/server"
import { getFamilySession } from "@/lib/auth"
import { parseDiaryInput, saveDiary } from "@/lib/private-diary"

async function handleSave(request: Request, editing: boolean) {
  const session = await getFamilySession()
  if (!session) return NextResponse.json({ error: "请先登录" }, { status: 401 })
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 415 })
  }

  let id: string | null = null
  let input
  try {
    const body = await request.json()
    input = parseDiaryInput(body, session.user.id)
    if (editing) {
      if (typeof body.id !== "string" || !body.id || body.id.length > 100) {
        return NextResponse.json({ error: "日记不存在" }, { status: 404 })
      }
      id = body.id
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error && !(error instanceof SyntaxError) ? error.message : "请求格式不正确" }, { status: 400 })
  }

  try {
    const result = await saveDiary(session.user.id, id, input)
    if (result.status === "missing") return NextResponse.json({ error: "日记不存在" }, { status: 404 })
    return NextResponse.json({ id: result.id }, { status: editing ? 200 : 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "成员的访问状态已改变，请重新选择") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "保存失败，请稍后重试" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return handleSave(request, false)
}

export async function PATCH(request: Request) {
  return handleSave(request, true)
}
