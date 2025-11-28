import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import OpenAI from "openai"

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  })
}

interface PromotionKit {
  twitterPosts: { content: string; type: string }[]
  linkedinPost: { content: string }
  redditPost: { title: string; body: string; subredditTips: string }
  pinterestPin: { title: string; description: string; boardIdea: string }
  crossPromoPitch: { subject: string; body: string }
  twitterAd?: { tweet: string; headline: string }
}

// Demo promotion kit for when OpenAI API key is not configured
function getDemoPromotionKit(newsletterName: string, niche: string): PromotionKit {
  const nicheText = niche || "your industry"

  return {
    twitterPosts: [
      {
        content: `I've been writing ${newsletterName} for a while now, and I'm still amazed by the responses I get.\n\nIf you want ${nicheText} insights that actually help you, link in bio.`,
        type: "Personal story"
      },
      {
        content: `Most ${nicheText} newsletters are boring.\n\n${newsletterName} isn't.\n\nWe keep it short, useful, and actually worth reading.\n\nSubscribe free: [link]`,
        type: "Value proposition"
      },
      {
        content: `New issue of ${newsletterName} just dropped 🔥\n\nThis week:\n• Trend everyone's missing\n• 3 actionable tips\n• 1 tool that changed my workflow\n\nRead it here: [link]`,
        type: "Issue teaser"
      }
    ],
    linkedinPost: {
      content: `I started ${newsletterName} because I was tired of sifting through noise to find signal in ${nicheText}.\n\nEvery week, I spend hours researching so you don't have to.\n\nThe result? A 5-minute read that gives you:\n→ The most important ${nicheText} updates\n→ Actionable insights you can use immediately\n→ Trends to watch (before everyone else catches on)\n\nIt's free. No spam. Unsubscribe anytime.\n\nJoin 1,000+ readers who start their week smarter.\n\n🔗 Link in comments`
    },
    redditPost: {
      title: `I curate ${nicheText} insights so you don't have to - free newsletter`,
      body: `Hey everyone,\n\nI've been running ${newsletterName} for a while now. It's a free weekly newsletter where I break down the most important ${nicheText} news and trends.\n\nWhat you get:\n- 5-minute read, once a week\n- No fluff, just actionable insights\n- Completely free\n\nI started it because I was spending hours every week reading through everything, and figured others might benefit from a curated version.\n\nHappy to answer any questions! Link in my profile if interested.`,
      subredditTips: `Try subreddits related to ${nicheText}. Look for ones that allow self-promotion on specific days, or contribute value first before sharing.`
    },
    pinterestPin: {
      title: `${newsletterName}: Your Weekly ${nicheText} Update`,
      description: `Get the best ${nicheText} insights delivered to your inbox every week. ${newsletterName} saves you hours of research with curated, actionable content. Subscribe free and join thousands of readers! #newsletter #${nicheText.replace(/\s+/g, '')} #productivity`,
      boardIdea: `Create a board called "${nicheText} Tips & Resources" and pin valuable content alongside your newsletter pins for better reach.`
    },
    crossPromoPitch: {
      subject: `Cross-promo? ${newsletterName} x Your Newsletter`,
      body: `Hey!\n\nI run ${newsletterName}, a newsletter about ${nicheText}. I've been reading your newsletter and love what you're doing.\n\nWould you be interested in a cross-promotion? Here's what I'm thinking:\n\n• We each mention the other's newsletter once\n• No cost, just mutual exposure\n• I can write a custom blurb about your newsletter\n\nMy newsletter has [X] subscribers who would genuinely be interested in your content.\n\nLet me know if you're interested!\n\nBest,\n[Your name]`
    },
    twitterAd: {
      tweet: `Stop wasting time on ${nicheText} news that doesn't matter.\n\n${newsletterName} cuts through the noise.\n\n5 minutes. Once a week. Actually useful.`,
      headline: `Get smarter about ${nicheText}`
    }
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { newsletterName, newsletterDescription, niche } = body

    if (!newsletterName || !newsletterDescription) {
      return NextResponse.json(
        { error: "Newsletter name and description are required" },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0

    let kit: PromotionKit

    if (!hasOpenAIKey) {
      // Use demo promotion kit when no API key is set
      console.log("No OpenAI API key configured, using demo promotion kit")
      kit = getDemoPromotionKit(newsletterName, niche)
    } else {
      const systemPrompt = `You are an expert newsletter growth strategist. You help newsletter creators promote their newsletters through organic social media and outreach.

Your content should be:
- Authentic and not salesy
- Optimized for each platform's best practices
- Focused on value, not hype
- Written in a conversational tone

Always return valid JSON.`

      const userPrompt = `Generate a weekly promotion kit for this newsletter:

Newsletter Name: ${newsletterName}
Description: ${newsletterDescription}
Niche: ${niche || "General"}

Generate the following in JSON format:
{
  "twitterPosts": [
    { "content": "...", "type": "Personal story" },
    { "content": "...", "type": "Value proposition" },
    { "content": "...", "type": "Issue teaser" }
  ],
  "linkedinPost": {
    "content": "..." (longer form, professional tone, use line breaks and bullet points)
  },
  "redditPost": {
    "title": "..." (engaging but not clickbaity, Reddit hates obvious self-promo),
    "body": "..." (value-first approach, mention newsletter naturally, offer to help),
    "subredditTips": "..." (suggest 2-3 relevant subreddits and posting strategy)
  },
  "pinterestPin": {
    "title": "..." (under 100 chars, keyword-rich),
    "description": "..." (under 500 chars, include hashtags),
    "boardIdea": "..." (suggest a board name and strategy)
  },
  "crossPromoPitch": {
    "subject": "...",
    "body": "..." (friendly DM/email to send to other newsletter creators)
  },
  "twitterAd": {
    "tweet": "..." (under 200 chars, compelling hook),
    "headline": "..." (under 50 chars for ad card)
  }
}

Requirements:
- Twitter posts should be under 280 characters each
- Each Twitter post should have a different angle/type
- LinkedIn post should be 150-300 words, use emojis sparingly
- Reddit post should be authentic and value-first (Redditors hate obvious ads)
- Pinterest pin should be SEO-optimized with relevant hashtags
- Cross-promo pitch should be friendly but professional
- Twitter ad should be punchy and direct`

      const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.8,
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error("No response from AI")
      }

      kit = JSON.parse(content)
    }

    return NextResponse.json({
      kit,
      isDemo: !hasOpenAIKey,
    })
  } catch (error) {
    console.error("Error generating promotion kit:", error)
    return NextResponse.json(
      { error: "Failed to generate promotion kit" },
      { status: 500 }
    )
  }
}
