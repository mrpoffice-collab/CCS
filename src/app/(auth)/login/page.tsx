"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password")
      setIsLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold">CCS</span>
          </Link>

          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-500 mb-8">Sign in to your account to continue</p>

          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={isLoading}
                  className="h-12"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-orange-600 hover:text-orange-700 font-medium">
                Sign up
              </Link>
            </p>

            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
              <p className="text-sm text-orange-700 font-medium mb-1">Demo Account</p>
              <p className="text-sm text-orange-600">
                Email: <code className="bg-orange-100 px-1 rounded">person@ccs.app</code>
              </p>
              <p className="text-sm text-orange-600">
                Password: <code className="bg-orange-100 px-1 rounded">CcsXr7!mPq2024</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Gradient */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-orange-500 to-rose-500 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-8 w-8" />
            <span className="text-xl font-semibold">AI-Powered Growth</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Grow your newsletter 3x faster
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Join 500+ creators using CCS to acquire subscribers through Twitter, LinkedIn, SEO, and cross-promotion.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-lg">1</span>
              </div>
              <span>Connect your newsletter platform</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-lg">2</span>
              </div>
              <span>Generate AI-optimized ad copy</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-lg">3</span>
              </div>
              <span>Copy, paste, and launch campaigns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
