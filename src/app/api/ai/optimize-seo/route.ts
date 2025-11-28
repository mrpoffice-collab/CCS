import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import OpenAI from "openai"

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  })
}

const SEO_SYSTEM_PROMPT = `You are an SEO expert specializing in newsletter landing page optimization. You help create high-ranking content that converts visitors into subscribers.

Your optimization follows these principles:
1. Natural keyword integration without stuffing
2. Clear, compelling headlines that include target keywords
3. Meta descriptions that drive clicks from search results
4. Content structure with proper heading hierarchy (H1, H2, H3)
5. User-focused content that answers search intent

Provide actionable, specific recommendations.`

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { targetKeyword, currentContent, pageType, newsletterNiche } = body

    if (!targetKeyword) {
      return NextResponse.json(
        { error: "Target keyword is required" },
        { status: 400 }
      )
    }

    const userPrompt = `Optimize a ${pageType || "landing_page"} for the following:

Target Keyword: ${targetKeyword}
Newsletter Niche: ${newsletterNiche || "General"}
${currentContent ? `Current Content:\n${currentContent}` : ""}

Provide:
1. optimizedTitle - SEO-optimized page title (50-60 characters)
2. metaDescription - Compelling meta description (150-160 characters)
3. headings - Array of H2 subheadings to structure the page
4. contentSuggestions - Array of content ideas/paragraphs
5. keywordDensityTarget - Recommended keyword density (decimal)
6. seoScore - Estimated SEO score out of 100
7. improvements - Array of specific improvements to make

Return as JSON.`

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: SEO_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error("No response from AI")
    }

    const result = JSON.parse(content)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error optimizing SEO:", error)
    return NextResponse.json(
      { error: "Failed to optimize SEO" },
      { status: 500 }
    )
  }
}
