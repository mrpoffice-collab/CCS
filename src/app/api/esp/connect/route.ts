import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// ESP API client functions
async function testBeehiivConnection(apiKey: string) {
  const res = await fetch("https://api.beehiiv.com/v2/publications", {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    throw new Error("Invalid Beehiiv API key")
  }

  const data = await res.json()
  const publication = data.data?.[0]

  if (!publication) {
    throw new Error("No publications found in Beehiiv account")
  }

  // Get subscriber count
  const statsRes = await fetch(`https://api.beehiiv.com/v2/publications/${publication.id}/stats`, {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  })

  let subscriberCount = 0
  if (statsRes.ok) {
    const statsData = await statsRes.json()
    subscriberCount = statsData.data?.total_subscriptions || 0
  }

  return {
    publicationId: publication.id,
    publicationName: publication.name,
    subscriberCount,
  }
}

async function testConvertKitConnection(apiKey: string) {
  const res = await fetch(`https://api.convertkit.com/v3/account?api_key=${apiKey}`)

  if (!res.ok) {
    throw new Error("Invalid ConvertKit API key")
  }

  const data = await res.json()

  // Get subscriber count
  const subscribersRes = await fetch(`https://api.convertkit.com/v3/subscribers?api_key=${apiKey}`)
  let subscriberCount = 0

  if (subscribersRes.ok) {
    const subscribersData = await subscribersRes.json()
    subscriberCount = subscribersData.total_subscribers || 0
  }

  return {
    accountName: data.name || "ConvertKit Account",
    subscriberCount,
  }
}

async function testMailchimpConnection(apiKey: string) {
  // Mailchimp API keys end with datacenter like -us1, -us2, etc.
  const datacenter = apiKey.split("-").pop()

  if (!datacenter) {
    throw new Error("Invalid Mailchimp API key format (should end with datacenter like -us1)")
  }

  const res = await fetch(`https://${datacenter}.api.mailchimp.com/3.0/`, {
    headers: {
      "Authorization": `apikey ${apiKey}`,
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    throw new Error("Invalid Mailchimp API key")
  }

  const data = await res.json()

  // Get lists to find subscriber count
  const listsRes = await fetch(`https://${datacenter}.api.mailchimp.com/3.0/lists`, {
    headers: {
      "Authorization": `apikey ${apiKey}`,
      "Content-Type": "application/json",
    },
  })

  let subscriberCount = 0
  if (listsRes.ok) {
    const listsData = await listsRes.json()
    // Sum up subscribers across all lists
    subscriberCount = listsData.lists?.reduce((sum: number, list: { stats?: { member_count?: number } }) => {
      return sum + (list.stats?.member_count || 0)
    }, 0) || 0
  }

  return {
    accountName: data.account_name || "Mailchimp Account",
    subscriberCount,
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { provider, apiKey } = await req.json()

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Provider and API key are required" },
        { status: 400 }
      )
    }

    let result

    switch (provider) {
      case "beehiiv":
        result = await testBeehiivConnection(apiKey)
        break
      case "convertkit":
        result = await testConvertKitConnection(apiKey)
        break
      case "mailchimp":
        result = await testMailchimpConnection(apiKey)
        break
      default:
        return NextResponse.json(
          { error: "Unsupported provider" },
          { status: 400 }
        )
    }

    // TODO: Store the encrypted API key in database when connected
    // For now, we just return success with subscriber count

    return NextResponse.json({
      success: true,
      provider,
      subscriberCount: result.subscriberCount,
      message: `Successfully connected to ${provider}`,
    })
  } catch (error) {
    console.error("ESP connection error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Connection failed" },
      { status: 400 }
    )
  }
}
