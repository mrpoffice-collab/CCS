"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Copy, Check, Twitter, Linkedin, Users, Zap, RefreshCw } from "lucide-react"

interface PromotionKit {
  twitterPosts: { content: string; type: string }[]
  linkedinPost: { content: string }
  crossPromoPitch: { subject: string; body: string }
  twitterAd?: { tweet: string; headline: string }
}

export default function DashboardPage() {
  const [newsletterName, setNewsletterName] = useState("")
  const [newsletterDescription, setNewsletterDescription] = useState("")
  const [niche, setNiche] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [promotionKit, setPromotionKit] = useState<PromotionKit | null>(null)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  async function generateKit() {
    if (!newsletterName || !newsletterDescription) return

    setIsGenerating(true)

    try {
      const res = await fetch("/api/generate-promotion-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletterName, newsletterDescription, niche }),
      })

      if (res.ok) {
        const data = await res.json()
        setPromotionKit(data.kit)
      }
    } catch (err) {
      console.error("Failed to generate kit:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedItem(id)
    setTimeout(() => setCopiedItem(null), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Weekly Promotion Kit</h1>
        <p className="text-muted-foreground">
          Generate a week's worth of promotion content in seconds. Copy, paste, post.
        </p>
      </div>

      {/* Newsletter Info */}
      <Card>
        <CardHeader>
          <CardTitle>Your Newsletter</CardTitle>
          <CardDescription>
            Tell us about your newsletter to generate personalized content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Newsletter Name</Label>
            <Input
              id="name"
              placeholder="e.g., The Morning Brew"
              value={newsletterName}
              onChange={(e) => setNewsletterName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">What's it about? (1-2 sentences)</Label>
            <Input
              id="description"
              placeholder="e.g., Daily business news for busy professionals, delivered in 5 minutes"
              value={newsletterDescription}
              onChange={(e) => setNewsletterDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="niche">Niche/Industry</Label>
            <Input
              id="niche"
              placeholder="e.g., Tech, Finance, Marketing, Health"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            />
          </div>
          <Button
            onClick={generateKit}
            disabled={!newsletterName || !newsletterDescription || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating your kit...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate This Week's Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Kit */}
      {promotionKit && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Promotion Kit</h2>
            <p className="text-sm text-muted-foreground">Hover & click to copy</p>
          </div>

          {/* Twitter Posts */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Twitter className="h-5 w-5 text-slate-600" />
                <CardTitle className="text-lg">Twitter/X Posts</CardTitle>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">FREE</span>
              </div>
              <CardDescription>Post these throughout the week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {promotionKit.twitterPosts.map((post, i) => (
                <div key={i} className="relative group">
                  <div className="p-4 bg-muted/50 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                       onClick={() => copyToClipboard(post.content, `twitter-${i}`)}>
                    <p className="text-sm pr-10">{post.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">{post.type}</p>
                  </div>
                  <div className="absolute top-3 right-3 p-2">
                    {copiedItem === `twitter-${i}` ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* LinkedIn Post */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-sky-600" />
                <CardTitle className="text-lg">LinkedIn Post</CardTitle>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">FREE</span>
              </div>
              <CardDescription>Professional tone for LinkedIn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative group">
                <div className="p-4 bg-muted/50 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                     onClick={() => copyToClipboard(promotionKit.linkedinPost.content, "linkedin")}>
                  <p className="text-sm pr-10 whitespace-pre-wrap">{promotionKit.linkedinPost.content}</p>
                </div>
                <div className="absolute top-3 right-3 p-2">
                  {copiedItem === "linkedin" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cross-Promo Pitch */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-lg">Cross-Promo Pitch</CardTitle>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">FREE</span>
              </div>
              <CardDescription>DM this to similar newsletters to exchange mentions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative group">
                <div className="p-4 bg-muted/50 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                     onClick={() => copyToClipboard(
                       `Subject: ${promotionKit.crossPromoPitch.subject}\n\n${promotionKit.crossPromoPitch.body}`,
                       "crosspromo"
                     )}>
                  <p className="text-xs text-muted-foreground mb-1">Subject:</p>
                  <p className="text-sm font-medium mb-3">{promotionKit.crossPromoPitch.subject}</p>
                  <p className="text-xs text-muted-foreground mb-1">Message:</p>
                  <p className="text-sm whitespace-pre-wrap">{promotionKit.crossPromoPitch.body}</p>
                </div>
                <div className="absolute top-3 right-3 p-2">
                  {copiedItem === "crosspromo" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Twitter Ad (Optional) */}
          {promotionKit.twitterAd && (
            <Card className="border-dashed border-amber-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-lg">Twitter Ad</CardTitle>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">PAID - Optional</span>
                </div>
                <CardDescription>Boost growth with $20-50/week if you want faster results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative group">
                  <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-200 hover:border-amber-400 transition-colors cursor-pointer"
                       onClick={() => copyToClipboard(promotionKit.twitterAd!.tweet, "twitterad")}>
                    <p className="text-xs text-muted-foreground mb-1">Tweet:</p>
                    <p className="text-sm mb-3">{promotionKit.twitterAd.tweet}</p>
                    <p className="text-xs text-muted-foreground mb-1">Card Headline:</p>
                    <p className="text-sm font-medium">{promotionKit.twitterAd.headline}</p>
                  </div>
                  <div className="absolute top-3 right-3 p-2">
                    {copiedItem === "twitterad" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Regenerate */}
          <div className="text-center pt-4">
            <Button variant="outline" onClick={generateKit} disabled={isGenerating}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
              Generate Fresh Content
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
