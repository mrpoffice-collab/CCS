"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Twitter, Linkedin, Search, Sparkles, AlertCircle } from "lucide-react"
import { AdCopyDisplay, TwitterVariation, LinkedInVariation, SEOVariation } from "@/components/ad-copy-display"
import { PLATFORM_SPECS } from "@/lib/platform-specs"

interface Newsletter {
  id: string
  name: string
  description: string | null
  subscriberCount: number | null
  niche: string | null
}

// Demo newsletters for testing without database
const DEMO_NEWSLETTERS: Newsletter[] = [
  {
    id: "demo-newsletter-1",
    name: "Tech Insider Weekly",
    description: "Curated insights on startups, AI, and emerging tech trends delivered every Tuesday. Perfect for founders and tech professionals who want to stay ahead.",
    subscriberCount: 12500,
    niche: "Technology & Startups",
  },
  {
    id: "demo-newsletter-2",
    name: "The Marketing Minute",
    description: "Actionable marketing tips and strategies in under 5 minutes. Growth hacks, case studies, and tactics that actually work.",
    subscriberCount: 8200,
    niche: "Marketing & Growth",
  },
  {
    id: "demo-newsletter-3",
    name: "Creator Economy Daily",
    description: "Daily briefing on the creator economy - monetization strategies, platform updates, and success stories from top creators.",
    subscriberCount: 5800,
    niche: "Creator Economy",
  },
]

type Platform = "twitter" | "linkedin" | "seo" | ""

export default function NewCampaignPage() {
  const router = useRouter()
  const [platform, setPlatform] = useState<Platform>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [campaignName, setCampaignName] = useState("")
  const [selectedNewsletterId, setSelectedNewsletterId] = useState("")
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [targetAudience, setTargetAudience] = useState("")
  const [uniqueValue, setUniqueValue] = useState("")
  const [targetKeyword, setTargetKeyword] = useState("")

  // Generated copy state
  const [generatedCopy, setGeneratedCopy] = useState<{
    twitter?: TwitterVariation[]
    linkedin?: LinkedInVariation[]
    seo?: SEOVariation[]
  }>({})

  // Fetch newsletters on mount (falls back to demo data)
  useEffect(() => {
    async function fetchNewsletters() {
      try {
        const res = await fetch("/api/newsletters")
        if (res.ok) {
          const data = await res.json()
          const fetchedNewsletters = data.newsletters || []
          // Use fetched newsletters if available, otherwise use demo data
          setNewsletters(fetchedNewsletters.length > 0 ? fetchedNewsletters : DEMO_NEWSLETTERS)
        } else {
          // API failed, use demo data
          setNewsletters(DEMO_NEWSLETTERS)
        }
      } catch (err) {
        console.error("Failed to fetch newsletters, using demo data:", err)
        setNewsletters(DEMO_NEWSLETTERS)
      }
    }
    fetchNewsletters()
  }, [])

  const selectedNewsletter = newsletters.find(n => n.id === selectedNewsletterId)

  async function handleGenerateAdCopy() {
    if (!selectedNewsletter) {
      setError("Please select a newsletter first")
      return
    }
    if (!platform) {
      setError("Please select a platform")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const res = await fetch("/api/ai/generate-ad-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsletterName: selectedNewsletter.name,
          newsletterDescription: selectedNewsletter.description || `A newsletter about ${selectedNewsletter.niche || "various topics"}`,
          targetAudience: targetAudience || undefined,
          platform,
          subscriberCount: selectedNewsletter.subscriberCount || undefined,
          uniqueValue: uniqueValue || undefined,
          targetKeyword: platform === "seo" ? targetKeyword : undefined,
          count: 3,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to generate ad copy")
      }

      const data = await res.json()

      setGeneratedCopy(prev => ({
        ...prev,
        [platform]: data.variations,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate ad copy")
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleSaveDraft() {
    if (!campaignName || !selectedNewsletterId || !platform) {
      setError("Please fill in campaign name, select a newsletter, and choose a platform")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName,
          newsletterId: selectedNewsletterId,
          platform,
          status: "draft",
          aiGeneratedCopy: generatedCopy[platform as keyof typeof generatedCopy] || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save campaign")
      }

      router.push("/campaigns")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save campaign")
    } finally {
      setIsSaving(false)
    }
  }

  const platformSpec = platform ? PLATFORM_SPECS[platform as keyof typeof PLATFORM_SPECS] : null

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/campaigns">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Campaign</h1>
          <p className="text-muted-foreground">Generate AI-powered ad copy for your newsletter</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        {/* Campaign Details */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Basic information about your campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                placeholder="e.g., Summer Newsletter Push"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newsletter">Newsletter</Label>
              <select
                id="newsletter"
                className="w-full border rounded-md px-3 py-2"
                value={selectedNewsletterId}
                onChange={(e) => setSelectedNewsletterId(e.target.value)}
              >
                <option value="">Select newsletter</option>
                {newsletters.map((nl) => (
                  <option key={nl.id} value={nl.id}>
                    {nl.name} {nl.subscriberCount ? `(${nl.subscriberCount.toLocaleString()} subscribers)` : ""}
                  </option>
                ))}
              </select>
              {newsletters.some(n => n.id.startsWith("demo-")) && (
                <p className="text-xs text-orange-600">
                  Using demo newsletters for testing. Connect a database to use your own.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setPlatform("twitter")}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                    platform === "twitter" ? "border-blue-500 bg-blue-50" : "hover:bg-muted"
                  }`}
                >
                  <Twitter className={`h-6 w-6 ${platform === "twitter" ? "text-blue-500" : ""}`} />
                  <span className="text-sm font-medium">Twitter/X</span>
                  <span className="text-xs text-muted-foreground">$1.20 avg CPA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform("linkedin")}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                    platform === "linkedin" ? "border-sky-600 bg-sky-50" : "hover:bg-muted"
                  }`}
                >
                  <Linkedin className={`h-6 w-6 ${platform === "linkedin" ? "text-sky-700" : ""}`} />
                  <span className="text-sm font-medium">LinkedIn</span>
                  <span className="text-xs text-muted-foreground">$2.10 avg CPA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform("seo")}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                    platform === "seo" ? "border-green-500 bg-green-50" : "hover:bg-muted"
                  }`}
                >
                  <Search className={`h-6 w-6 ${platform === "seo" ? "text-green-600" : ""}`} />
                  <span className="text-sm font-medium">SEO Page</span>
                  <span className="text-xs text-muted-foreground">Free organic</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform-specific tips */}
        {platformSpec && (
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {platformSpec.name} Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                {platformSpec.bestPractices.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* AI Generation Context */}
        {platform && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {platform === "seo" ? "SEO Content Generation" : "Ad Copy Generation"}
                  </CardTitle>
                  <CardDescription>
                    Provide context to generate better copy (optional but recommended)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g., Startup founders, tech professionals, marketers"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uniqueValue">Unique Value Proposition</Label>
                <Input
                  id="uniqueValue"
                  placeholder="e.g., Daily insights in 5 minutes, curated by industry experts"
                  value={uniqueValue}
                  onChange={(e) => setUniqueValue(e.target.value)}
                />
              </div>
              {platform === "seo" && (
                <div className="space-y-2">
                  <Label htmlFor="targetKeyword">Target Keyword</Label>
                  <Input
                    id="targetKeyword"
                    placeholder="e.g., best startup newsletter, tech news daily"
                    value={targetKeyword}
                    onChange={(e) => setTargetKeyword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    The primary keyword you want to rank for in Google
                  </p>
                </div>
              )}

              <Button
                type="button"
                onClick={handleGenerateAdCopy}
                disabled={isGenerating || !selectedNewsletterId}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : `Generate ${platform === "seo" ? "SEO Content" : "Ad Copy"}`}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Generated Copy Display */}
        {platform && generatedCopy[platform as keyof typeof generatedCopy] && (
          <Card>
            <CardHeader>
              <CardTitle>
                {platform === "seo" ? "Generated SEO Content" : "Generated Ad Copy"}
              </CardTitle>
              <CardDescription>
                Click any field to copy it to your clipboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdCopyDisplay
                platform={platform as "twitter" | "linkedin" | "seo"}
                variations={generatedCopy[platform as keyof typeof generatedCopy]!}
                onRegenerate={handleGenerateAdCopy}
                isRegenerating={isGenerating}
              />
            </CardContent>
          </Card>
        )}

        {/* Instructions for manual copy/paste */}
        {platform && generatedCopy[platform as keyof typeof generatedCopy] && (
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-amber-800">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-900 space-y-2">
              {platform === "twitter" && (
                <>
                  <p>1. Copy the ad copy above using the copy buttons</p>
                  <p>2. Go to <a href="https://ads.twitter.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Twitter/X Ads Manager</a></p>
                  <p>3. Create a new campaign and paste your copy</p>
                  <p>4. Set your targeting, budget, and schedule in Twitter Ads</p>
                </>
              )}
              {platform === "linkedin" && (
                <>
                  <p>1. Copy the ad copy above using the copy buttons</p>
                  <p>2. Go to <a href="https://www.linkedin.com/campaignmanager" target="_blank" rel="noopener noreferrer" className="underline font-medium">LinkedIn Campaign Manager</a></p>
                  <p>3. Create a new campaign and paste your copy</p>
                  <p>4. Set your targeting, budget, and schedule in LinkedIn</p>
                </>
              )}
              {platform === "seo" && (
                <>
                  <p>1. Copy the SEO content above using the copy buttons</p>
                  <p>2. Go to your website CMS or page builder</p>
                  <p>3. Create a new landing page with the generated content</p>
                  <p>4. Add your newsletter signup form</p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/campaigns">Cancel</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSaving || !campaignName || !selectedNewsletterId || !platform}
          >
            {isSaving ? "Saving..." : "Save Campaign"}
          </Button>
        </div>
      </form>
    </div>
  )
}
