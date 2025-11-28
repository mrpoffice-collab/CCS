import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, TrendingUp, TrendingDown, Users, DollarSign, Target, Twitter, Linkedin, Search } from "lucide-react"
import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {session?.user?.name?.split(" ")[0]}</h1>
          <p className="text-muted-foreground">Here's how your newsletter is performing</p>
        </div>
        <Button asChild>
          <Link href="/campaigns/new">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Link>
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,450</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+8%</span> vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+1,234</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: "72%" }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">72% of monthly goal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg CPA</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.45</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-green-500" />
              <span className="text-green-500">-15%</span> vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Channel Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Twitter</CardTitle>
            <Twitter className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">456 subs</div>
            <p className="text-xs text-muted-foreground">$1.20 CPA</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LinkedIn</CardTitle>
            <Linkedin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234 subs</div>
            <p className="text-xs text-muted-foreground">$2.10 CPA</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO</CardTitle>
            <Search className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">544 subs</div>
            <p className="text-xs text-muted-foreground">Free (organic)</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active Campaigns</CardTitle>
            <CardDescription>Your currently running campaigns</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/campaigns">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Twitter className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Summer Launch</p>
                  <p className="text-sm text-muted-foreground">Twitter Ads</p>
                </div>
              </div>
              <div className="flex items-center gap-8 text-sm">
                <div className="text-center">
                  <p className="font-medium">234</p>
                  <p className="text-muted-foreground">Subs</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">$1.12</p>
                  <p className="text-muted-foreground">CPA</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">$262</p>
                  <p className="text-muted-foreground">Spent</p>
                </div>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                  Active
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Linkedin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Tech Founders</p>
                  <p className="text-sm text-muted-foreground">LinkedIn Ads</p>
                </div>
              </div>
              <div className="flex items-center gap-8 text-sm">
                <div className="text-center">
                  <p className="font-medium">89</p>
                  <p className="text-muted-foreground">Subs</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">$2.34</p>
                  <p className="text-muted-foreground">CPA</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">$208</p>
                  <p className="text-muted-foreground">Spent</p>
                </div>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                  Active
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Search className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Best AI Tools 2024</p>
                  <p className="text-sm text-muted-foreground">SEO Landing Page</p>
                </div>
              </div>
              <div className="flex items-center gap-8 text-sm">
                <div className="text-center">
                  <p className="font-medium">156</p>
                  <p className="text-muted-foreground">Subs</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">-</p>
                  <p className="text-muted-foreground">CPA</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">-</p>
                  <p className="text-muted-foreground">Spent</p>
                </div>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                  Live
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
