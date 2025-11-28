import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check } from "lucide-react"

interface PageProps {
  params: { slug: string }
}

export default async function PublicLandingPage({ params }: PageProps) {
  // TODO: Fetch landing page from database
  const page = {
    title: "The #1 Newsletter for AI Founders",
    subheadline: "Join 12,000+ founders getting weekly insights on artificial intelligence, startups, and technology.",
    subscriberCount: 12000,
    logoUrl: null,
    primaryColor: "#6366f1",
    benefits: [
      { title: "Curated", description: "Only the best stories" },
      { title: "Actionable", description: "Insights you can apply" },
      { title: "No Fluff", description: "5-min read every week" },
    ],
    testimonials: [
      { quote: "The best newsletter I subscribe to. Period.", author: "@founder123" },
      { quote: "I've discovered tools that 10x'd my productivity", author: "Sarah, CEO at StartupCo" },
    ],
    faqs: [
      { question: "How often do you send emails?", answer: "We send one email per week, every Tuesday morning." },
      { question: "Can I unsubscribe anytime?", answer: "Yes! Every email has an unsubscribe link at the bottom." },
      { question: "Is it really free?", answer: "Yes, 100% free. No credit card required." },
    ],
  }

  if (!page) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {page.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {page.subheadline}
          </p>

          {/* Subscribe Form */}
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="your@email.com"
              className="flex-1"
              required
            />
            <Button type="submit" size="lg">
              Subscribe Free
            </Button>
          </form>

          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              Free
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              Weekly
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              Unsubscribe anytime
            </span>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 border-y">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">
            Why {page.subscriberCount.toLocaleString()}+ Founders Trust Us
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {page.benefits.map((benefit, i) => (
              <div key={i} className="text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">
            What Readers Are Saying
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {page.testimonials.map((testimonial, i) => (
              <blockquote key={i} className="p-6 border rounded-lg">
                <p className="text-lg mb-4">"{testimonial.quote}"</p>
                <footer className="text-sm text-muted-foreground">
                  — {testimonial.author}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {page.faqs.map((faq, i) => (
              <details key={i} className="group border rounded-lg">
                <summary className="p-4 cursor-pointer font-medium flex items-center justify-between">
                  {faq.question}
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-4 pb-4 text-muted-foreground">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Join?</h2>
          <p className="mb-8 opacity-90">
            Get weekly insights delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-white/10 border-white/20 placeholder:text-white/60"
              required
            />
            <Button type="submit" variant="secondary" size="lg">
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>Powered by CCS</p>
        </div>
      </footer>
    </div>
  )
}
