/**
 * Platform-specific ad specifications
 * Based on official platform documentation (2024)
 *
 * Sources:
 * - Twitter/X: https://business.x.com/en/help/campaign-setup/creative-ad-specifications
 * - LinkedIn: https://www.linkedin.com/help/linkedin/answer/a426534
 */

export const PLATFORM_SPECS = {
  twitter: {
    name: "Twitter/X",
    adTypes: {
      promoted_tweet: {
        name: "Promoted Tweet",
        tweetCopy: { max: 280, withLink: 257, recommended: 250 },
        headline: { max: 70, recommended: 50 },
        description: "Standard promoted tweet with optional media",
      },
      website_card: {
        name: "Website Card",
        tweetCopy: { max: 256, recommended: 240 },
        headline: { max: 70, recommended: 50 },
        description: "Card with website preview and CTA button",
      },
    },
    ctaOptions: [
      { value: "subscribe", label: "Subscribe" },
      { value: "learn_more", label: "Learn More" },
      { value: "read_more", label: "Read More" },
      { value: "sign_up", label: "Sign Up" },
      { value: "shop_now", label: "Shop Now" },
    ],
    tone: "casual, direct, conversational",
    bestPractices: [
      "Use hashtags sparingly (1-2 max)",
      "Ask questions to drive engagement",
      "Use numbers and specific stats",
      "Keep it punchy and scannable",
      "Emojis can boost engagement when relevant",
    ],
  },

  linkedin: {
    name: "LinkedIn",
    adTypes: {
      single_image: {
        name: "Single Image Ad",
        introText: { max: 600, recommended: 150 },
        headline: { max: 200, recommended: 70 },
        description: { max: 70, recommended: 70 },
        description_note: "Intro text is the main body copy above the image",
      },
      text_ad: {
        name: "Text Ad",
        headline: { max: 25, recommended: 25 },
        description: { max: 75, recommended: 75 },
        description_note: "Small sidebar ads",
      },
      sponsored_content: {
        name: "Sponsored Content",
        introText: { max: 600, recommended: 150 },
        headline: { max: 200, recommended: 70 },
        description_note: "Native feed content format",
      },
    },
    ctaOptions: [
      { value: "subscribe", label: "Subscribe" },
      { value: "learn_more", label: "Learn More" },
      { value: "sign_up", label: "Sign Up" },
      { value: "download", label: "Download" },
      { value: "get_quote", label: "Get Quote" },
      { value: "apply_now", label: "Apply Now" },
      { value: "register", label: "Register" },
    ],
    tone: "professional, authoritative, thought-leadership",
    bestPractices: [
      "Lead with a strong insight or statistic",
      "Speak to professional aspirations",
      "Use industry-specific language",
      "Mention credentials or social proof",
      "Avoid casual language and emojis",
    ],
  },

  seo: {
    name: "SEO Landing Page",
    fields: {
      pageTitle: { max: 60, recommended: 55, description: "Displayed in browser tab and Google results" },
      metaDescription: { max: 160, recommended: 155, description: "Shown in Google search results" },
      h1Headline: { max: 70, recommended: 60, description: "Main page heading" },
      bodyContent: { min: 300, recommended: 500, description: "Main page content for SEO" },
    },
    bestPractices: [
      "Include target keyword in title and H1",
      "Write meta description as a compelling CTA",
      "Use keyword naturally, avoid stuffing",
      "Focus on user intent, not just keywords",
      "Include clear value proposition",
    ],
  },
} as const

export type Platform = keyof typeof PLATFORM_SPECS

// Helper to get character limit display text
export function getCharLimitText(max: number, recommended?: number): string {
  if (recommended && recommended < max) {
    return `${recommended} chars recommended (${max} max)`
  }
  return `${max} chars max`
}

// Platform-specific system prompts for AI generation
export const PLATFORM_PROMPTS = {
  twitter: `You are an expert Twitter/X advertising copywriter specializing in newsletter growth.

TWITTER AD SPECIFICATIONS:
- Tweet copy: 280 characters max (257 if including a link)
- Headline (for cards): 70 characters max, 50 recommended to avoid truncation
- Keep tweets punchy, scannable, and direct

TWITTER VOICE & STYLE:
- Casual, conversational tone
- Use "you" and speak directly to the reader
- Numbers and specific stats perform well
- Questions drive engagement
- Emojis can boost engagement (use 1-2 max, if appropriate)
- Hashtags: 1-2 max, only if highly relevant
- Avoid corporate speak

EFFECTIVE TWITTER AD PATTERNS:
- "I spent X hours/years doing Y. Here's what I learned:"
- "X people already know this secret about Y"
- Controversial take + value promise
- Specific number + benefit

Generate ad copy that feels native to Twitter, not like an ad.`,

  linkedin: `You are an expert LinkedIn advertising copywriter specializing in professional newsletter growth.

LINKEDIN AD SPECIFICATIONS:
- Introductory text (main copy): 600 characters max, 150 recommended to avoid truncation
- Headline: 200 characters max, 70 recommended for full visibility
- Professional tone is mandatory

LINKEDIN VOICE & STYLE:
- Professional, authoritative, thought-leadership tone
- Lead with insights, data, or industry trends
- Speak to professional aspirations and career growth
- Use industry-specific terminology appropriately
- NO emojis, NO casual language
- Credentials and social proof are highly effective
- First-person professional voice works well

EFFECTIVE LINKEDIN AD PATTERNS:
- "After [X years/experience], I discovered..."
- "The top [X%] of [professionals] know this..."
- Industry insight + exclusive access
- Problem in industry + your solution

Generate ad copy that positions the newsletter as essential professional reading.`,

  seo: `You are an expert SEO copywriter specializing in high-converting landing pages for newsletter signups.

SEO PAGE SPECIFICATIONS:
- Page title: 60 characters max (55 recommended) - appears in Google results
- Meta description: 160 characters max (155 recommended) - appears below title in Google
- H1 headline: 70 characters max - main visible heading on page

SEO BEST PRACTICES:
- Include target keyword naturally in title and H1
- Write meta description as a compelling call-to-action
- Focus on search intent - what is the user trying to accomplish?
- Use power words that drive clicks: "free", "exclusive", "proven", "essential"
- Include numbers when relevant (e.g., "Join 10,000+ subscribers")
- Avoid keyword stuffing - write for humans first

EFFECTIVE SEO PATTERNS:
- Title: "[Keyword] - [Benefit] | [Brand]"
- Meta: Compelling reason to click + what they'll get
- H1: Clear value proposition with keyword

Generate SEO content optimized for both search engines AND conversions.`,
} as const

// Ad copy structure by platform
export interface TwitterAdCopy {
  tweetCopy: string        // Main tweet text (280 chars max)
  headline: string         // Card headline if using website card (70 chars)
  ctaText: string          // CTA button text
  hashtags?: string[]      // Optional hashtags
  reasoning: string        // Why this variation might work
}

export interface LinkedInAdCopy {
  introText: string        // Main body copy above image (600 chars, 150 recommended)
  headline: string         // Below image headline (200 chars, 70 recommended)
  ctaText: string          // CTA button text
  reasoning: string        // Why this variation might work
}

export interface SEOContent {
  pageTitle: string        // Browser title & Google (60 chars)
  metaDescription: string  // Google snippet (160 chars)
  h1Headline: string       // Page heading (70 chars)
  reasoning: string        // Why this variation might work
}

export type AdCopyVariation = TwitterAdCopy | LinkedInAdCopy | SEOContent
