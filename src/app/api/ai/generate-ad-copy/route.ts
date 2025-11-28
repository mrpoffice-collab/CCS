import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import OpenAI from "openai"
import { PLATFORM_PROMPTS, PLATFORM_SPECS } from "@/lib/platform-specs"

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  })
}

// Demo ad copy for when OpenAI API key is not configured
function getDemoAdCopy(platform: string, newsletterName: string, count: number) {
  if (platform === "twitter") {
    return [
      {
        tweetCopy: `Stop doom-scrolling. Start learning. ${newsletterName} delivers the insights you need in 5 min/day.`,
        headline: "Get smarter in 5 minutes",
        ctaText: "Subscribe",
        hashtags: ["newsletter", "productivity"],
        reasoning: "Uses pattern interrupt + clear time investment benefit",
      },
      {
        tweetCopy: `10,000+ professionals read ${newsletterName} every morning. Here's why they won't start their day without it:`,
        headline: "Join 10k+ subscribers",
        ctaText: "Learn More",
        hashtags: ["morningroutine"],
        reasoning: "Social proof + curiosity gap creates engagement",
      },
      {
        tweetCopy: `I used to waste hours researching. Now I get everything I need from ${newsletterName}. Free. Every week.`,
        headline: "Save hours every week",
        ctaText: "Sign Up",
        hashtags: ["timesaver", "newsletter"],
        reasoning: "Personal testimonial style + clear value proposition",
      },
    ].slice(0, count)
  }

  if (platform === "linkedin") {
    return [
      {
        introText: `The most successful professionals don't have more time. They have better information. ${newsletterName} delivers it.`,
        headline: "Level up your expertise",
        ctaText: "Subscribe",
        reasoning: "Appeals to professional growth mindset",
      },
      {
        introText: `Every week, I curate the most important insights so you don't have to. Join ${newsletterName}.`,
        headline: "Curated insights, weekly",
        ctaText: "Learn More",
        reasoning: "Emphasizes curation value and time savings",
      },
      {
        introText: `Your competitors are reading ${newsletterName}. The question is: are you?`,
        headline: "Stay ahead of the curve",
        ctaText: "Sign Up",
        reasoning: "Creates competitive urgency without being pushy",
      },
    ].slice(0, count)
  }

  if (platform === "seo") {
    return [
      {
        pageTitle: `${newsletterName} - Free Weekly Newsletter`,
        metaDescription: `Join thousands of professionals getting curated insights delivered free. Subscribe to ${newsletterName} today.`,
        h1Headline: `Subscribe to ${newsletterName}`,
        reasoning: "Clean, keyword-focused with clear CTA",
      },
      {
        pageTitle: `${newsletterName} | Expert Insights Weekly`,
        metaDescription: `Get the best industry insights in 5 minutes. ${newsletterName} is the newsletter trusted by 10k+ readers.`,
        h1Headline: `Get Smarter with ${newsletterName}`,
        reasoning: "Benefit-focused with social proof element",
      },
      {
        pageTitle: `Subscribe to ${newsletterName} - Free`,
        metaDescription: `Stop missing out on key insights. ${newsletterName} curates the best content and delivers it to your inbox free.`,
        h1Headline: `Never Miss an Update`,
        reasoning: "FOMO approach with clear free value",
      },
    ].slice(0, count)
  }

  return []
}

// Platform-specific user prompts with exact field requirements
function getUserPrompt(platform: string, data: {
  newsletterName: string
  newsletterDescription: string
  targetAudience: string
  subscriberCount?: number
  uniqueValue?: string
  targetKeyword?: string
  count: number
}) {
  const { newsletterName, newsletterDescription, targetAudience, subscriberCount, uniqueValue, targetKeyword, count } = data

  const baseContext = `
Newsletter Name: ${newsletterName}
Newsletter Description: ${newsletterDescription}
Target Audience: ${targetAudience || "General professionals"}
${subscriberCount ? `Current Subscribers: ${subscriberCount.toLocaleString()}` : ""}
${uniqueValue ? `Unique Value Proposition: ${uniqueValue}` : ""}
`.trim()

  if (platform === "twitter") {
    return `Generate ${count} Twitter/X ad copy variations for this newsletter:

${baseContext}

For EACH variation, provide a JSON object with:
- tweetCopy: The main tweet text (MUST be under 257 characters to allow for link)
- headline: Website card headline (MUST be under 50 characters to avoid truncation)
- ctaText: One of: "Subscribe", "Learn More", "Read More", "Sign Up"
- hashtags: Array of 1-2 relevant hashtags (without # symbol)
- reasoning: Brief explanation of why this approach might resonate

Return as: { "variations": [...] }`
  }

  if (platform === "linkedin") {
    return `Generate ${count} LinkedIn ad copy variations for this newsletter:

${baseContext}

For EACH variation, provide a JSON object with:
- introText: Main body copy above image (MUST be under 150 characters to avoid truncation on mobile)
- headline: Below-image headline (MUST be under 70 characters to display fully)
- ctaText: One of: "Subscribe", "Learn More", "Sign Up", "Download", "Register"
- reasoning: Brief explanation of why this professional angle might work

Return as: { "variations": [...] }`
  }

  if (platform === "seo") {
    return `Generate ${count} SEO-optimized content variations for a newsletter landing page:

${baseContext}
Target Keyword: ${targetKeyword || "newsletter"}

For EACH variation, provide a JSON object with:
- pageTitle: Browser/Google title (MUST be under 55 characters, include keyword naturally)
- metaDescription: Google snippet text (MUST be under 155 characters, make it a compelling CTA)
- h1Headline: Main page heading (MUST be under 60 characters, include keyword)
- reasoning: Brief explanation of the SEO and conversion strategy

Return as: { "variations": [...] }`
  }

  // Fallback for unknown platforms
  return `Generate ${count} ad copy variations for: ${baseContext}`
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      newsletterName,
      newsletterDescription,
      targetAudience,
      platform,
      subscriberCount,
      uniqueValue,
      targetKeyword,
      count = 3,
    } = body

    if (!newsletterDescription || !platform) {
      return NextResponse.json(
        { error: "Newsletter description and platform are required" },
        { status: 400 }
      )
    }

    // Validate platform
    if (!["twitter", "linkedin", "seo"].includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform. Must be twitter, linkedin, or seo" },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0

    let variations

    if (!hasOpenAIKey) {
      // Use demo ad copy when no API key is set
      console.log("No OpenAI API key configured, using demo ad copy")
      variations = getDemoAdCopy(platform, newsletterName || "Your Newsletter", count)
    } else {
      // Get platform-specific system prompt
      const systemPrompt = PLATFORM_PROMPTS[platform as keyof typeof PLATFORM_PROMPTS]

      // Get platform-specific user prompt
      const userPrompt = getUserPrompt(platform, {
        newsletterName: newsletterName || "Newsletter",
        newsletterDescription,
        targetAudience,
        subscriberCount,
        uniqueValue,
        targetKeyword,
        count,
      })

      const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.8, // Slightly higher for more creative variations
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error("No response from AI")
      }

      const result = JSON.parse(content)
      variations = result.variations || result
    }

    // Add platform metadata to response
    return NextResponse.json({
      platform,
      platformName: PLATFORM_SPECS[platform as keyof typeof PLATFORM_SPECS]?.name || platform,
      variations,
      specs: PLATFORM_SPECS[platform as keyof typeof PLATFORM_SPECS],
      isDemo: !hasOpenAIKey,
    })
  } catch (error) {
    console.error("Error generating ad copy:", error)
    return NextResponse.json(
      { error: "Failed to generate ad copy" },
      { status: 500 }
    )
  }
}
