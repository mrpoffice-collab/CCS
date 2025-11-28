import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { campaigns } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const newsletterId = searchParams.get("newsletterId")
    const platform = searchParams.get("platform")
    const status = searchParams.get("status")

    let whereClause = eq(campaigns.userId, session.user.id)

    const userCampaigns = await db.query.campaigns.findMany({
      where: whereClause,
      with: {
        newsletter: true,
        ads: true,
      },
      orderBy: (campaigns, { desc }) => [desc(campaigns.createdAt)],
    })

    return NextResponse.json({ campaigns: userCampaigns })
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      newsletterId,
      name,
      platform,
      objective,
      dailyBudgetCents,
      totalBudgetCents,
      targeting,
      startDate,
      endDate,
      aiGeneratedCopy,
      status = "draft",
    } = body

    if (!newsletterId || !name || !platform) {
      return NextResponse.json(
        { error: "Newsletter, name, and platform are required" },
        { status: 400 }
      )
    }

    const [campaign] = await db
      .insert(campaigns)
      .values({
        userId: session.user.id,
        newsletterId,
        name,
        platform,
        objective,
        dailyBudgetCents,
        totalBudgetCents,
        targeting,
        aiGeneratedCopy,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status,
      })
      .returning()

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
