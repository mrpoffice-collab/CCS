import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, ExternalLink, Eye, Users, BarChart3, MoreVertical } from "lucide-react"

export default function LandingPagesPage() {
  const pages = [
    {
      id: "1",
      title: "Best AI Tools 2024",
      slug: "best-ai-tools-2024",
      status: "published",
      views: 2340,
      conversions: 234,
      conversionRate: 10.0,
      seoScore: 92,
    },
    {
      id: "2",
      title: "Startup News for Founders",
      slug: "startup-news",
      status: "published",
      views: 1890,
      conversions: 156,
      conversionRate: 8.3,
      seoScore: 87,
    },
    {
      id: "3",
      title: "Weekly Tech Digest",
      slug: "weekly-tech-digest",
      status: "draft",
      views: 0,
      conversions: 0,
      conversionRate: 0,
      seoScore: 65,
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
            Published
          </span>
        )
      case "draft":
        return (
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
            Draft
          </span>
        )
      default:
        return null
    }
  }

  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Landing Pages</h1>
          <p className="text-muted-foreground">SEO-optimized pages to capture subscribers</p>
        </div>
        <Button asChild>
          <Link href="/pages/new">
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {pages.map((page) => (
          <Card key={page.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{page.title}</h3>
                    {getStatusBadge(page.status)}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    /p/{page.slug}
                    {page.status === "published" && (
                      <Link
                        href={`/p/${page.slug}`}
                        target="_blank"
                        className="hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/pages/${page.id}`}>Edit</Link>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6 mt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{page.views.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{page.conversions}</p>
                    <p className="text-xs text-muted-foreground">Conversions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{page.conversionRate}%</p>
                    <p className="text-xs text-muted-foreground">Conv. Rate</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <span className={`font-bold ${getSeoScoreColor(page.seoScore)}`}>
                      SEO
                    </span>
                  </div>
                  <div>
                    <p className={`text-2xl font-semibold ${getSeoScoreColor(page.seoScore)}`}>
                      {page.seoScore}
                    </p>
                    <p className="text-xs text-muted-foreground">SEO Score</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
