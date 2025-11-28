"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Copy, Twitter, Linkedin, Search, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
  text: string
  label: string
}

function CopyButton({ text, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-7 px-2 text-xs"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 mr-1 text-green-500" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-3 w-3 mr-1" />
          Copy {label}
        </>
      )}
    </Button>
  )
}

interface CopyFieldProps {
  label: string
  value: string
  charLimit?: number
  recommended?: number
  multiline?: boolean
}

function CopyField({ label, value, charLimit, recommended, multiline }: CopyFieldProps) {
  const charCount = value.length
  const isOverLimit = charLimit ? charCount > charLimit : false
  const isOverRecommended = recommended ? charCount > recommended : false

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <div className="flex items-center gap-2">
          {charLimit && (
            <span className={cn(
              "text-xs",
              isOverLimit ? "text-red-500 font-medium" :
              isOverRecommended ? "text-yellow-600" : "text-muted-foreground"
            )}>
              {charCount}/{recommended || charLimit}
              {recommended && charLimit && recommended < charLimit && ` (max ${charLimit})`}
            </span>
          )}
          <CopyButton text={value} label="" />
        </div>
      </div>
      <div className={cn(
        "p-3 rounded-md bg-muted/50 border text-sm",
        isOverLimit && "border-red-300 bg-red-50",
        multiline && "whitespace-pre-wrap"
      )}>
        {value}
      </div>
    </div>
  )
}

// Twitter Ad Copy Display
interface TwitterVariation {
  tweetCopy: string
  headline: string
  ctaText: string
  hashtags?: string[]
  reasoning: string
}

function TwitterAdCopy({ variation, index }: { variation: TwitterVariation; index: number }) {
  const [showReasoning, setShowReasoning] = useState(false)

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Twitter className="h-4 w-4 text-blue-500" />
            Variation {index + 1}
          </CardTitle>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {variation.ctaText}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CopyField
          label="Tweet Copy"
          value={variation.tweetCopy}
          charLimit={280}
          recommended={257}
          multiline
        />
        <CopyField
          label="Card Headline"
          value={variation.headline}
          charLimit={70}
          recommended={50}
        />
        {variation.hashtags && variation.hashtags.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Hashtags</label>
            <div className="flex gap-2 flex-wrap">
              {variation.hashtags.map((tag, i) => (
                <button
                  key={i}
                  onClick={() => navigator.clipboard.writeText(`#${tag}`)}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setShowReasoning(!showReasoning)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {showReasoning ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          Why this might work
        </button>
        {showReasoning && (
          <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            {variation.reasoning}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// LinkedIn Ad Copy Display
interface LinkedInVariation {
  introText: string
  headline: string
  ctaText: string
  reasoning: string
}

function LinkedInAdCopy({ variation, index }: { variation: LinkedInVariation; index: number }) {
  const [showReasoning, setShowReasoning] = useState(false)

  return (
    <Card className="border-sky-200 bg-sky-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Linkedin className="h-4 w-4 text-sky-700" />
            Variation {index + 1}
          </CardTitle>
          <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full">
            {variation.ctaText}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CopyField
          label="Intro Text (Body Copy)"
          value={variation.introText}
          charLimit={600}
          recommended={150}
          multiline
        />
        <CopyField
          label="Headline"
          value={variation.headline}
          charLimit={200}
          recommended={70}
        />
        <button
          type="button"
          onClick={() => setShowReasoning(!showReasoning)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {showReasoning ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          Why this might work
        </button>
        {showReasoning && (
          <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            {variation.reasoning}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// SEO Content Display
interface SEOVariation {
  pageTitle: string
  metaDescription: string
  h1Headline: string
  reasoning: string
}

function SEOContentCopy({ variation, index }: { variation: SEOVariation; index: number }) {
  const [showReasoning, setShowReasoning] = useState(false)

  return (
    <Card className="border-green-200 bg-green-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Search className="h-4 w-4 text-green-600" />
          Variation {index + 1}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CopyField
          label="Page Title (Browser Tab & Google)"
          value={variation.pageTitle}
          charLimit={60}
          recommended={55}
        />
        <CopyField
          label="Meta Description (Google Snippet)"
          value={variation.metaDescription}
          charLimit={160}
          recommended={155}
          multiline
        />
        <CopyField
          label="H1 Headline (Main Page Heading)"
          value={variation.h1Headline}
          charLimit={70}
          recommended={60}
        />
        <button
          type="button"
          onClick={() => setShowReasoning(!showReasoning)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {showReasoning ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          SEO Strategy
        </button>
        {showReasoning && (
          <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            {variation.reasoning}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Copy All button for convenience
function CopyAllButton({ variations, platform }: { variations: unknown[]; platform: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopyAll() {
    let text = ""

    if (platform === "twitter") {
      const tvars = variations as TwitterVariation[]
      tvars.forEach((v, i) => {
        text += `=== VARIATION ${i + 1} ===\n\n`
        text += `TWEET COPY:\n${v.tweetCopy}\n\n`
        text += `CARD HEADLINE:\n${v.headline}\n\n`
        text += `CTA: ${v.ctaText}\n`
        if (v.hashtags?.length) text += `HASHTAGS: ${v.hashtags.map(h => `#${h}`).join(" ")}\n`
        text += "\n"
      })
    } else if (platform === "linkedin") {
      const lvars = variations as LinkedInVariation[]
      lvars.forEach((v, i) => {
        text += `=== VARIATION ${i + 1} ===\n\n`
        text += `INTRO TEXT:\n${v.introText}\n\n`
        text += `HEADLINE:\n${v.headline}\n\n`
        text += `CTA: ${v.ctaText}\n\n`
      })
    } else if (platform === "seo") {
      const svars = variations as SEOVariation[]
      svars.forEach((v, i) => {
        text += `=== VARIATION ${i + 1} ===\n\n`
        text += `PAGE TITLE:\n${v.pageTitle}\n\n`
        text += `META DESCRIPTION:\n${v.metaDescription}\n\n`
        text += `H1 HEADLINE:\n${v.h1Headline}\n\n`
      })
    }

    await navigator.clipboard.writeText(text.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleCopyAll}
      className="w-full"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2 text-green-500" />
          All Variations Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          Copy All Variations
        </>
      )}
    </Button>
  )
}

// Main export component
interface AdCopyDisplayProps {
  platform: "twitter" | "linkedin" | "seo"
  variations: TwitterVariation[] | LinkedInVariation[] | SEOVariation[]
  onRegenerate?: () => void
  isRegenerating?: boolean
}

export function AdCopyDisplay({
  platform,
  variations,
  onRegenerate,
  isRegenerating
}: AdCopyDisplayProps) {
  if (!variations || variations.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Generated Ad Copy ({variations.length} variations)
        </h3>
        {onRegenerate && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? "Regenerating..." : "Regenerate"}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {platform === "twitter" && (variations as TwitterVariation[]).map((v, i) => (
          <TwitterAdCopy key={i} variation={v} index={i} />
        ))}
        {platform === "linkedin" && (variations as LinkedInVariation[]).map((v, i) => (
          <LinkedInAdCopy key={i} variation={v} index={i} />
        ))}
        {platform === "seo" && (variations as SEOVariation[]).map((v, i) => (
          <SEOContentCopy key={i} variation={v} index={i} />
        ))}
      </div>

      <CopyAllButton variations={variations} platform={platform} />

      <p className="text-xs text-muted-foreground text-center">
        Click any field to copy it to your clipboard, then paste into{" "}
        {platform === "twitter" && "Twitter/X Ads Manager"}
        {platform === "linkedin" && "LinkedIn Campaign Manager"}
        {platform === "seo" && "your website CMS"}
      </p>
    </div>
  )
}

export type { TwitterVariation, LinkedInVariation, SEOVariation }
