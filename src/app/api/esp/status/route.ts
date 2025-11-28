import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // TODO: Fetch actual connection status from database
    // For now, return empty connections (demo mode)
    const connections = [
      { provider: "beehiiv", isConnected: false },
      { provider: "convertkit", isConnected: false },
      { provider: "mailchimp", isConnected: false },
    ]

    return NextResponse.json({ connections })
  } catch (error) {
    console.error("ESP status error:", error)
    return NextResponse.json(
      { error: "Failed to get status" },
      { status: 500 }
    )
  }
}
