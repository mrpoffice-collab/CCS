"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, Loader2, Eye, EyeOff, ExternalLink } from "lucide-react"

interface ESPConnection {
  provider: string
  isConnected: boolean
  subscriberCount?: number
  lastSynced?: string
}

export default function SettingsPage() {
  const [espConnections, setEspConnections] = useState<ESPConnection[]>([
    { provider: "beehiiv", isConnected: false },
    { provider: "convertkit", isConnected: false },
    { provider: "mailchimp", isConnected: false },
  ])

  const [activeProvider, setActiveProvider] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const providerInfo: Record<string, { name: string; color: string; bgColor: string; helpUrl: string; placeholder: string }> = {
    beehiiv: {
      name: "Beehiiv",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      helpUrl: "https://app.beehiiv.com/settings/integrations",
      placeholder: "bh_xxxxxxxxxxxxxxxx",
    },
    convertkit: {
      name: "ConvertKit",
      color: "text-red-600",
      bgColor: "bg-red-100",
      helpUrl: "https://app.convertkit.com/account_settings/developer_settings",
      placeholder: "ck_xxxxxxxxxxxxxxxx",
    },
    mailchimp: {
      name: "Mailchimp",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      helpUrl: "https://mailchimp.com/help/about-api-keys/",
      placeholder: "xxxxxxxxxxxxxxxx-us1",
    },
  }

  async function handleConnect(provider: string) {
    setIsConnecting(true)
    setConnectionError(null)

    try {
      const res = await fetch("/api/esp/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to connect")
      }

      setEspConnections(prev =>
        prev.map(conn =>
          conn.provider === provider
            ? { ...conn, isConnected: true, subscriberCount: data.subscriberCount, lastSynced: new Date().toISOString() }
            : conn
        )
      )

      setActiveProvider(null)
      setApiKey("")
    } catch (err) {
      setConnectionError(err instanceof Error ? err.message : "Connection failed")
    } finally {
      setIsConnecting(false)
    }
  }

  async function handleDisconnect(provider: string) {
    try {
      const res = await fetch("/api/esp/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      })

      if (res.ok) {
        setEspConnections(prev =>
          prev.map(conn =>
            conn.provider === provider
              ? { ...conn, isConnected: false, subscriberCount: undefined }
              : conn
          )
        )
      }
    } catch (err) {
      console.error("Failed to disconnect:", err)
    }
  }

  // Load existing connections on mount
  useEffect(() => {
    async function loadConnections() {
      try {
        const res = await fetch("/api/esp/status")
        if (res.ok) {
          const data = await res.json()
          if (data.connections) {
            setEspConnections(data.connections)
          }
        }
      } catch (err) {
        // Silently fail - demo mode
      }
    }
    loadConnections()
  }, [])

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and integrations</p>
      </div>

      {/* Email Service Providers */}
      <Card>
        <CardHeader>
          <CardTitle>Email Service Providers</CardTitle>
          <CardDescription>
            Connect your newsletter platform to import subscriber data and track growth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {espConnections.map((conn) => {
            const info = providerInfo[conn.provider]
            const isExpanded = activeProvider === conn.provider

            return (
              <div key={conn.provider} className="border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 ${info.bgColor} rounded-lg flex items-center justify-center ${info.color} font-bold`}>
                      {info.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{info.name}</p>
                      {conn.isConnected ? (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Connected
                          {conn.subscriberCount && ` • ${conn.subscriberCount.toLocaleString()} subscribers`}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not connected</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {conn.isConnected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(conn.provider)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setActiveProvider(isExpanded ? null : conn.provider)}
                      >
                        {isExpanded ? "Cancel" : "Connect"}
                      </Button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t bg-muted/30">
                    <div className="pt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${conn.provider}-api-key`}>API Key</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              id={`${conn.provider}-api-key`}
                              type={showApiKey ? "text" : "password"}
                              placeholder={info.placeholder}
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Get your API key from{" "}
                          <a
                            href={info.helpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {info.name} Settings <ExternalLink className="h-3 w-3" />
                          </a>
                        </p>
                      </div>

                      {connectionError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                          <X className="h-4 w-4" />
                          {connectionError}
                        </div>
                      )}

                      <Button
                        onClick={() => handleConnect(conn.provider)}
                        disabled={!apiKey || isConnecting}
                        className="w-full"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          "Connect & Import"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Ad Platforms - Info Only */}
      <Card>
        <CardHeader>
          <CardTitle>Advertising Platforms</CardTitle>
          <CardDescription>
            CCS generates ad copy that you manually paste into your ad platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold">
                X
              </div>
              <div>
                <p className="font-medium">Twitter/X Ads</p>
                <p className="text-sm text-muted-foreground">Copy generated ads to Twitter Ads Manager</p>
              </div>
            </div>
            <a
              href="https://ads.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Open <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600 font-bold">
                in
              </div>
              <div>
                <p className="font-medium">LinkedIn Ads</p>
                <p className="text-sm text-muted-foreground">Copy generated ads to LinkedIn Campaign Manager</p>
              </div>
            </div>
            <a
              href="https://www.linkedin.com/campaignmanager"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Open <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground text-center pt-2">
            No API integration needed - generate copy in Campaigns, then paste directly into your ad platform
          </p>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>Manage your subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="font-medium">Current Plan: Free</p>
            <p className="text-sm text-muted-foreground">3 campaigns/month, demo AI generation</p>
          </div>
          <div className="flex gap-4">
            <Button>Upgrade to Starter</Button>
            <Button variant="outline">View Plans</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
