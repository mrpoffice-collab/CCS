"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

const STEPS = [
  { id: 1, title: "Newsletter Details" },
  { id: 2, title: "Connect ESP" },
  { id: 3, title: "Ad Platforms" },
  { id: 4, title: "First Campaign" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const progress = (currentStep / STEPS.length) * 100

  async function handleNext() {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsLoading(true)
      // Mark onboarding as complete
      router.push("/dashboard")
    }
  }

  function handleSkip() {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </span>
            <div className="flex gap-2">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`h-2 w-8 rounded-full ${
                    step.id <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Tell us about your newsletter"}
            {currentStep === 2 && "Connect your email service provider"}
            {currentStep === 3 && "Connect your advertising accounts"}
            {currentStep === 4 && "Let's set up your first campaign"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Newsletter Name *</Label>
                <Input id="name" placeholder="e.g., Tech Insider Weekly" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="w-full min-h-[100px] border rounded-md px-3 py-2 text-sm"
                  placeholder="What's your newsletter about?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="niche">Niche/Category</Label>
                <select id="niche" className="w-full border rounded-md px-3 py-2">
                  <option value="">Select a category</option>
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="finance">Finance</option>
                  <option value="health">Health & Wellness</option>
                  <option value="marketing">Marketing</option>
                  <option value="productivity">Productivity</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input id="website" type="url" placeholder="https://yournewsletter.com" />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your ESP to sync subscribers and track conversions.
              </p>
              <div className="grid gap-4">
                {[
                  { name: "Beehiiv", color: "orange" },
                  { name: "ConvertKit", color: "red" },
                  { name: "Mailchimp", color: "yellow" },
                ].map((esp) => (
                  <button
                    key={esp.name}
                    className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-10 bg-${esp.color}-100 rounded-lg flex items-center justify-center text-${esp.color}-600 font-bold`}
                      >
                        {esp.name.charAt(0)}
                      </div>
                      <span className="font-medium">{esp.name}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect ad platforms to run subscriber acquisition campaigns.
              </p>
              <div className="grid gap-4">
                <button className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                      X
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Twitter/X Ads</p>
                      <p className="text-sm text-muted-foreground">
                        Target followers of accounts in your niche
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </button>
                <button className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                      in
                    </div>
                    <div className="text-left">
                      <p className="font-medium">LinkedIn Ads</p>
                      <p className="text-sm text-muted-foreground">
                        Reach professionals by job title
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-medium">Recommended: Twitter Campaign</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Based on your niche, we recommend starting with Twitter ads to target
                  followers of relevant accounts.
                </p>
                <div className="text-sm space-y-1">
                  <p>• Target followers of industry leaders</p>
                  <p>• Starting daily budget: $20</p>
                  <p>• AI-optimized ad copy included</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button className="flex-1" onClick={() => router.push("/campaigns/new")}>
                  Create This Campaign
                </Button>
                <Button variant="outline" onClick={() => router.push("/campaigns/new")}>
                  Start from Scratch
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-4 border-t">
            <Button variant="ghost" onClick={handleSkip}>
              {currentStep === STEPS.length ? "Skip to Dashboard" : "Skip"}
            </Button>
            <Button onClick={handleNext} disabled={isLoading}>
              {currentStep === STEPS.length ? "Finish Setup" : "Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
