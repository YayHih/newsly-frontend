"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CornerDecoration } from "../components/corner-decoration"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert("Passwords don't match")
      return
    }

    setIsLoading(true)
    // Simulate signup process
    setTimeout(() => {
      localStorage.setItem("noozers-onboarding-complete", "true")
      localStorage.setItem("noozers-user", JSON.stringify({ email, signupMethod: "email" }))
      window.location.href = "/"
    }, 1500)
  }

  const handleGoogleSignUp = () => {
    setIsLoading(true)
    // Simulate Google signup
    setTimeout(() => {
      localStorage.setItem("noozers-onboarding-complete", "true")
      localStorage.setItem("noozers-user", JSON.stringify({ email: "user@gmail.com", signupMethod: "google" }))
      window.location.href = "/"
    }, 1500)
  }

  const handleAppleSignUp = () => {
    setIsLoading(true)
    // Simulate Apple signup
    setTimeout(() => {
      localStorage.setItem("noozers-onboarding-complete", "true")
      localStorage.setItem("noozers-user", JSON.stringify({ email: "user@icloud.com", signupMethod: "apple" }))
      window.location.href = "/"
    }, 1500)
  }

  return (
    <div className="victorian-bg page-flourish min-h-screen flex flex-col font-serif">
      <CornerDecoration />
      <header className="vintage-paper sticky top-0 z-10 border-b-4 border-double border-[#3d2a1a] dark:border-[#8b6f47] backdrop-blur-sm shadow-md">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/8370d9ef-9307-4d5e-a48e-27287fc5b683.png" 
                alt="Noozers" 
                className="h-30 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200"
                style={{ filter: 'brightness(0.7) contrast(1.2) saturate(1.1)' }}
                onClick={() => window.location.href = '/'}
              />
            </div>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="border-2 border-[#3d2a1a] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#241610] font-serif text-xs font-medium text-[#3d2a1a] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418]"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-md">
          <div className="mb-6 text-center">
            <h2 className="mb-2 font-serif text-2xl font-bold text-[#3d2a1a] dark:text-[#e0d0b0]">Create your account</h2>
            <p className="font-serif text-sm text-[#4a3020] dark:text-[#c9a876]">
              Save your preferences and get personalized news across all your devices
            </p>
          </div>

          <Card className="vintage-card border-2 border-[#3d2a1a] dark:border-[#8b6f47]">
          <CardContent className="p-6 space-y-4">
            {/* Social Sign Up Options */}
            <div className="space-y-3">
              <Button
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                variant="outline"
                className="w-full border-2 border-[#3d2a1a] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#241610] font-serif text-sm text-[#3d2a1a] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418] disabled:opacity-50"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <Button
                onClick={handleAppleSignUp}
                disabled={isLoading}
                variant="outline"
                className="w-full border-2 border-[#3d2a1a] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#241610] font-serif text-sm text-[#3d2a1a] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418] disabled:opacity-50"
              >
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Continue with Apple
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-[#3d2a1a]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#f5f0e8] dark:bg-[#241610] px-2 font-serif text-[#4a3020] dark:text-[#c9a876]">Or continue with email</span>
              </div>
            </div>

            {/* Email Sign Up Form */}
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-serif text-sm text-[#3d2a1a] dark:text-[#e0d0b0]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-2 border-[#3d2a1a] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#241610] font-serif text-[#3d2a1a] dark:text-[#e0d0b0] placeholder:text-[#8b6f47]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-serif text-sm text-[#3d2a1a] dark:text-[#e0d0b0]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-2 border-[#3d2a1a] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#241610] font-serif text-[#3d2a1a] dark:text-[#e0d0b0] placeholder:text-[#8b6f47]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-serif text-sm text-[#3d2a1a] dark:text-[#e0d0b0]">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="border-2 border-[#3d2a1a] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#241610] font-serif text-[#3d2a1a] dark:text-[#e0d0b0] placeholder:text-[#8b6f47]"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#3d2a1a] dark:bg-[#8b6f47] font-serif text-sm font-medium text-[#f5f1e8] dark:text-[#1a0f08] hover:bg-[#2d1f16] dark:hover:bg-[#a08560] disabled:opacity-50"
              >
                {isLoading ? (
                  "Creating account..."
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <p className="text-center font-serif text-xs text-[#4a3020] dark:text-[#c9a876]">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Button
            onClick={() => (window.location.href = "/onboarding")}
            variant="ghost"
            className="font-serif text-sm text-[#4a3020] dark:text-[#c9a876] hover:text-[#3d2a1a] dark:hover:text-[#e0d0b0]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to profile setup
          </Button>
        </div>
        </div>
      </main>
    </div>
  )
}
