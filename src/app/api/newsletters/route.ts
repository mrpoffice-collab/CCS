import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { newsletters } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { randomBytes } from "crypto"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userNewsletters = await db.query.newsletters.findMany({
      where: eq(newsletters.userId, session.user.id),
    })

    return NextResponse.json({ newsletters: userNewsletters })
  } catch (error) {
    console.error("Error fetching newsletters:", error)
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
    const { name, description, websiteUrl, niche, espProvider, espApiKey, espListId } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const webhookSecret = randomBytes(32).toString("hex")

    const [newsletter] = await db
      .insert(newsletters)
      .values({
        userId: session.user.id,
        name,
        description,
        websiteUrl,
        niche,
        espProvider,
        espApiKeyEncrypted: espApiKey, // TODO: encrypt
        espListId,
        espWebhookSecret: webhookSecret,
      })
      .returning()

    return NextResponse.json({
      newsletter,
      webhookUrl: `/api/webhooks/esp/${newsletter.id}`,
      webhookSecret,
    })
  } catch (error) {
    console.error("Error creating newsletter:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
