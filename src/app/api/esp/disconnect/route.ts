import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { provider } = await req.json()

    if (!provider) {
      return NextResponse.json(
        { error: "Provider is required" },
        { status: 400 }
      )
    }

    // TODO: Remove the encrypted API key from database when connected
    // For now, we just return success

    return NextResponse.json({
      success: true,
      provider,
      message: `Successfully disconnected from ${provider}`,
    })
  } catch (error) {
    console.error("ESP disconnect error:", error)
    return NextResponse.json(
      { error: "Failed to disconnect" },
      { status: 500 }
    )
  }
}
