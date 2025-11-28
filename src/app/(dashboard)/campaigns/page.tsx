import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Twitter, Linkedin, Search, MoreVertical } from "lucide-react"

export default function CampaignsPage() {
  const campaigns = [
    {
      id: "1",
      name: "Summer Launch",
      platform: "twitter",
      status: "active",
      budget: 500,
      spent: 262,
      subscribers: 234,
      cpa: 1.12,
    },
    {
      id: "2",
      name: "Tech Founders",
      platform: "linkedin",
      status: "active",
      budget: 300,
      spent: 208,
      subscribers: 89,
      cpa: 2.34,
    },
    {
      id: "3",
      name: "Q4 Push",
      platform: "twitter",
      status: "draft",
      budget: 1000,
      spent: 0,
      subscribers: 0,
      cpa: 0,
    },
    {
      id: "4",
      name: "SEO - AI Tools",
      platform: "seo",
      status: "active",
      budget: null,
      spent: null,
      subscribers: 156,
      cpa: null,
    },
  ]

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return <Twitter className="h-5 w-5" />
      case "linkedin":
        return <Linkedin className="h-5 w-5" />
      case "seo":
        return <Search className="h-5 w-5" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
            Active
          </span>
        )
      case "draft":
        return (
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
            Draft
          </span>
        )
      case "paused":
        return (
          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
            Paused
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Manage your ad campaigns across all platforms</p>
        </div>
        <Button asChild>
          <Link href="/campaigns/new">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <select className="border rounded-md px-3 py-2 text-sm">
              <option value="">All Platforms</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
              <option value="seo">SEO</option>
            </select>
            <select className="border rounded-md px-3 py-2 text-sm">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-sm">Campaign</th>
                  <th className="text-left p-4 font-medium text-sm">Platform</th>
                  <th className="text-left p-4 font-medium text-sm">Status</th>
                  <th className="text-right p-4 font-medium text-sm">Budget</th>
                  <th className="text-right p-4 font-medium text-sm">Spent</th>
                  <th className="text-right p-4 font-medium text-sm">Subs</th>
                  <th className="text-right p-4 font-medium text-sm">CPA</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-t">
                    <td className="p-4">
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {campaign.name}
                      </Link>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {getPlatformIcon(campaign.platform)}
                        <span className="capitalize">{campaign.platform}</span>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(campaign.status)}</td>
                    <td className="p-4 text-right">
                      {campaign.budget ? `$${campaign.budget}` : "-"}
                    </td>
                    <td className="p-4 text-right">
                      {campaign.spent !== null ? `$${campaign.spent}` : "-"}
                    </td>
                    <td className="p-4 text-right">{campaign.subscribers}</td>
                    <td className="p-4 text-right">
                      {campaign.cpa ? `$${campaign.cpa.toFixed(2)}` : "-"}
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
