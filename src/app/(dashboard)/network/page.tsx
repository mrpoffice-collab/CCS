import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle, XCircle } from "lucide-react"

export default function NetworkPage() {
  const partners = [
    {
      id: "1",
      name: "Startup Weekly",
      subscribers: "8,000",
      categories: ["Business", "Startups"],
      tagline: "Weekly deep-dives on startup strategy and growth",
      matchScore: 92,
    },
    {
      id: "2",
      name: "AI Digest",
      subscribers: "12,000",
      categories: ["Technology", "AI"],
      tagline: "Curated AI news and tutorials for developers",
      matchScore: 87,
    },
    {
      id: "3",
      name: "Product Notes",
      subscribers: "6,000",
      categories: ["Product", "Design"],
      tagline: "Product management insights for builders",
      matchScore: 81,
    },
  ]

  const pendingRequests = [
    {
      id: "1",
      from: "Finance Daily",
      subscribers: "15,000",
      message: "Would love to cross-promote! Our audiences align well.",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Cross-Promotion Network</h1>
        <p className="text-muted-foreground">Connect with other newsletter creators for subscriber swaps</p>
      </div>

      {/* My Listing */}
      <Card>
        <CardHeader>
          <CardTitle>Your Listing</CardTitle>
          <CardDescription>How your newsletter appears to potential partners</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Newsletter Name</Label>
              <Input defaultValue="Tech Insider Weekly" />
            </div>
            <div className="space-y-2">
              <Label>Subscriber Range</Label>
              <select className="w-full border rounded-md px-3 py-2">
                <option value="1k-5k">1,000 - 5,000</option>
                <option value="5k-10k">5,000 - 10,000</option>
                <option value="10k-25k">10,000 - 25,000</option>
                <option value="25k-50k">25,000 - 50,000</option>
                <option value="50k+">50,000+</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input placeholder="Daily insights for tech founders and investors" />
          </div>
          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2">
              {["Technology", "Startups", "Business"].map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Listing Active</span>
            </label>
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests ({pendingRequests.length})</CardTitle>
            <CardDescription>Newsletters that want to cross-promote with you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{request.from}</h4>
                    <span className="text-sm text-muted-foreground">
                      {request.subscribers} subscribers
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    "{request.message}"
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button size="sm" variant="outline">
                    <XCircle className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Browse Partners */}
      <Card>
        <CardHeader>
          <CardTitle>Browse Partners</CardTitle>
          <CardDescription>Find newsletters to cross-promote with</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <select className="border rounded-md px-3 py-2 text-sm">
              <option value="">All Categories</option>
              <option value="technology">Technology</option>
              <option value="business">Business</option>
              <option value="finance">Finance</option>
            </select>
            <select className="border rounded-md px-3 py-2 text-sm">
              <option value="">All Sizes</option>
              <option value="1k-5k">1k - 5k</option>
              <option value="5k-10k">5k - 10k</option>
              <option value="10k-25k">10k - 25k</option>
            </select>
          </div>
          <div className="space-y-4">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{partner.name}</h4>
                    <span className="text-sm text-muted-foreground">
                      {partner.subscribers} subscribers
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{partner.tagline}</p>
                  <div className="flex gap-2 mt-2">
                    {partner.categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 bg-muted text-xs rounded-full"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm mb-2">
                    Match Score: <span className="font-semibold text-primary">{partner.matchScore}%</span>
                  </div>
                  <Button size="sm">Request Swap</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
