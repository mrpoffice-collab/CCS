import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Twitter, Linkedin, Search, Users, Zap, BarChart3, Check, ArrowRight, Sparkles, TrendingUp, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold">CCS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Login
            </Link>
            <Button asChild className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600">
              <Link href="/login">Get Started Free</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-rose-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            AI-Powered Newsletter Growth
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 via-orange-800 to-rose-800 bg-clip-text text-transparent">
            Grow Your Newsletter
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text">Without Meta Ads</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Acquire subscribers through Twitter, LinkedIn, SEO, and cross-promotion.
            All managed from one beautiful dashboard with AI-powered optimization.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-lg px-8 py-6 rounded-xl shadow-lg shadow-orange-500/25">
              <Link href="/login">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 rounded-xl border-2">
              <Link href="#features">See How It Works</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-gray-500 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              Free plan available
            </span>
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-500 mt-1">Newsletter Creators</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">2M+</div>
              <div className="text-sm text-gray-500 mt-1">Subscribers Acquired</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">$1.20</div>
              <div className="text-sm text-gray-500 mt-1">Average CPA</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">3x</div>
              <div className="text-sm text-gray-500 mt-1">Faster Growth</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Multiple Growth Channels,
              <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent"> One Platform</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Stop relying on a single acquisition channel. Diversify your growth with AI-optimized campaigns across every major platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-shadow duration-300 overflow-hidden group">
              <CardHeader className="pb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Twitter className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Twitter/X Ads</CardTitle>
                <CardDescription className="text-base">
                  Target followers of thought leaders in your niche. Our AI generates ad copy that converts cold audiences into subscribers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Avg. $1.20 CPA
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-shadow duration-300 overflow-hidden group">
              <CardHeader className="pb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-600 to-sky-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Linkedin className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">LinkedIn Ads</CardTitle>
                <CardDescription className="text-base">
                  Reach professionals by job title, company size, and industry. Perfect for B2B newsletters targeting decision makers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Avg. $2.10 CPA
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-shadow duration-300 overflow-hidden group">
              <CardHeader className="pb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Search className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">SEO Landing Pages</CardTitle>
                <CardDescription className="text-base">
                  AI-optimized landing pages that rank on Google. Get free organic traffic and subscribers without ad spend.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Free organic traffic
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex gap-5">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">AI-Powered Copy</h3>
                <p className="text-gray-600">
                  Generate high-converting ad copy and SEO content in seconds. Our AI learns from millions of successful campaigns.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Cross-Promotion Network</h3>
                <p className="text-gray-600">
                  Connect with 500+ newsletter creators for subscriber swaps. Grow together without spending a dime.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Unified Analytics</h3>
                <p className="text-gray-600">
                  Track CPA, conversions, and ROI across all channels in one beautiful dashboard. Know exactly what works.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Simple, Transparent
              <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent"> Pricing</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Start free. Upgrade when you are ready to scale.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <Card className="border-2 border-gray-100 hover:border-gray-200 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">Free</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {["1 campaign", "Basic AI copy", "1 landing page", "Basic analytics"].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/login">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Starter - Popular */}
            <Card className="border-2 border-orange-400 relative shadow-xl shadow-orange-500/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-medium rounded-full">
                Most Popular
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Starter</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">$29</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {["5 campaigns", "Full AI access (100/mo)", "5 landing pages", "Cross-promo network", "Priority support"].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center">
                        <Check className="h-3 w-3 text-orange-600" />
                      </div>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600" asChild>
                  <Link href="/login">Start Free Trial</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Growth */}
            <Card className="border-2 border-gray-100 hover:border-gray-200 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">Growth</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">$79</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {["Unlimited campaigns", "Priority AI (500/mo)", "25 landing pages", "Advanced analytics", "API access"].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/login">Start Free Trial</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-rose-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTItNC0yLTQgMi0yIDQtMiA0IDIgMiA0IDIgNCAyIDQtMiAyLTQgMi00cy0yLTItNC0yLTQtMi00IDItMiA0LTIgNCAyIDIgNCAyIDQgMiA0LTIgMi00IDItNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Grow Your Newsletter?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join 500+ creators who have diversified their subscriber acquisition. Start your free trial today.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6 rounded-xl shadow-lg">
            <Link href="/login">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <div className="mt-8 flex items-center justify-center gap-6 text-white/70 text-sm">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Cancel anytime
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="font-semibold">CCS</span>
            </div>
            <nav className="flex gap-8 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
            </nav>
            <div className="text-sm text-gray-400">
              © 2024 CCS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
