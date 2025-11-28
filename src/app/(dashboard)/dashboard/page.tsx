"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Copy, Check, Twitter, Linkedin, Users, Zap, RefreshCw, MessageCircle } from "lucide-react"

interface PromotionKit {
  twitterPosts: { content: string; type: string }[]
  linkedinPost: { content: string }
  redditPost: { title: string; body: string; subredditTips: string }
  pinterestPin: { title: string; description: string; boardIdea: string }
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

          {/* Reddit Post */}
          {promotionKit.redditPost && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg">Reddit Post</CardTitle>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">FREE</span>
                </div>
                <CardDescription>Value-first approach for relevant subreddits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative group">
                  <div className="p-4 bg-muted/50 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                       onClick={() => copyToClipboard(
                         `${promotionKit.redditPost.title}\n\n${promotionKit.redditPost.body}`,
                         "reddit"
                       )}>
                    <p className="text-xs text-muted-foreground mb-1">Title:</p>
                    <p className="text-sm font-medium mb-3">{promotionKit.redditPost.title}</p>
                    <p className="text-xs text-muted-foreground mb-1">Post Body:</p>
                    <p className="text-sm whitespace-pre-wrap mb-3">{promotionKit.redditPost.body}</p>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Subreddit Tips:</p>
                      <p className="text-xs text-muted-foreground">{promotionKit.redditPost.subredditTips}</p>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 p-2">
                    {copiedItem === "reddit" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pinterest Pin */}
          {promotionKit.pinterestPin && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                  </svg>
                  <CardTitle className="text-lg">Pinterest Pin</CardTitle>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">FREE</span>
                </div>
                <CardDescription>Visual content with SEO-optimized description</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative group">
                  <div className="p-4 bg-muted/50 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                       onClick={() => copyToClipboard(
                         `${promotionKit.pinterestPin.title}\n\n${promotionKit.pinterestPin.description}`,
                         "pinterest"
                       )}>
                    <p className="text-xs text-muted-foreground mb-1">Pin Title:</p>
                    <p className="text-sm font-medium mb-3">{promotionKit.pinterestPin.title}</p>
                    <p className="text-xs text-muted-foreground mb-1">Description:</p>
                    <p className="text-sm whitespace-pre-wrap mb-3">{promotionKit.pinterestPin.description}</p>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Board Strategy:</p>
                      <p className="text-xs text-muted-foreground">{promotionKit.pinterestPin.boardIdea}</p>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 p-2">
                    {copiedItem === "pinterest" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
