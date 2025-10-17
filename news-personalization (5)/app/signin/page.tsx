"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Check, UserPlus, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CornerDecoration } from "../components/corner-decoration"
import { api, tokenStorage } from "@/lib/api"

export default function SignInPage() {
  const [showCredentials, setShowCredentials] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await api.login(email, password)

      // Store token
      tokenStorage.set(response.access_token)

      // Redirect to home
      window.location.href = "/"
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    // Redirect to Google OAuth
    window.location.href = api.getGoogleLoginUrl()
  }

  const handleShowCredentials = () => {
    setShowCredentials(true)
  }

  const handleMakeProfile = () => {
    window.location.href = "/profile-setup"
  }

  if (showCredentials) {
    return (
      <div className="victorian-bg min-h-screen flex flex-col font-serif">
        <CornerDecoration />
        <header className="vintage-paper sticky top-0 z-10 border-b-4 border-double border-[#1a0f08] dark:border-[#8b6f47] backdrop-blur-sm shadow-md">
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
                className="border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] font-serif text-xs font-medium text-[#1a0f08] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418]"
              >
                Continue as Guest
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-md">
            <div className="mb-6 text-center">
              <h2 className="mb-2 font-serif text-2xl font-bold text-[#1a0f08] dark:text-[#e0d0b0]">Sign in to your account</h2>
              <p className="font-serif text-sm text-[#4a3020] dark:text-[#c9a876]">Choose your preferred method to continue</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-center">
                <p className="font-serif text-sm text-red-600">{error}</p>
              </div>
            )}

            <Card className="vintage-card border-2 border-[#1a0f08] dark:border-[#8b6f47]">
              <CardContent className="p-6 space-y-4">
              {/* Google Sign In */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                variant="outline"
                className="w-full border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] font-serif text-sm text-[#1a0f08] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418] disabled:opacity-50"
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-[#2a2a2a]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#f4e6d7] dark:bg-[#241610] px-2 font-serif text-[#4a3020] dark:text-[#c9a876]">Or continue with email</span>
                </div>
              </div>

              {/* Email Sign In Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-serif text-sm text-[#1a0f08] dark:text-[#e0d0b0]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] font-serif text-[#1a0f08] dark:text-[#e0d0b0] placeholder:text-[#8b6f47]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-serif text-sm text-[#1a0f08] dark:text-[#e0d0b0]">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] font-serif text-[#1a0f08] dark:text-[#e0d0b0] placeholder:text-[#8b6f47]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1a0f08] dark:bg-[#8b6f47] font-serif text-sm font-medium text-[#f4e6d7] dark:text-[#1a0f08] hover:bg-[#0f0804] dark:hover:bg-[#a08560] disabled:opacity-50"
                >
                  {isLoading ? (
                    "Signing in..."
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <p className="font-serif text-xs text-[#4a3020] dark:text-[#c9a876]">
                  Don't have an account?{" "}
                  <button
                    onClick={() => window.location.href = "/signup"}
                    className="text-[#1a0f08] dark:text-[#8b6f47] hover:underline"
                  >
                    Create one
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 text-center">
            <Button
              onClick={() => setShowCredentials(false)}
              variant="ghost"
              className="font-serif text-sm text-[#4a3020] dark:text-[#c9a876] hover:text-[#1a0f08] dark:hover:text-[#e0d0b0]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to options
            </Button>
          </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="victorian-bg min-h-screen flex flex-col font-serif">
      <CornerDecoration />
      <header className="vintage-paper sticky top-0 z-10 border-b-4 border-double border-[#1a0f08] dark:border-[#8b6f47] backdrop-blur-sm shadow-md">
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
              className="border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] font-serif text-xs font-medium text-[#1a0f08] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418]"
            >
              Continue as Guest
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-md">
          <div className="mb-6 text-center">
            <h2 className="mb-2 font-serif text-2xl font-bold text-[#1a0f08] dark:text-[#e0d0b0]">Welcome to Noozers</h2>
            <p className="font-serif text-sm text-[#4a3020] dark:text-[#c9a876]">Choose how you'd like to get started</p>
          </div>

          <div className="space-y-4">
            {/* Sign In with Credentials Card */}
            <Card className="vintage-card border-2 border-[#1a0f08] dark:border-[#8b6f47]">
              <CardContent className="p-6 text-center space-y-4">
                <div>
                  <LogIn className="mx-auto h-8 w-8 text-[#1a0f08] dark:text-[#8b6f47] mb-3" />
                  <h3 className="font-serif text-lg font-medium text-[#1a0f08] dark:text-[#e0d0b0] mb-2">Sign In / Create Account</h3>
                  <p className="font-serif text-sm text-[#4a3020] dark:text-[#c9a876]">
                    Use your existing account or create a new one with your credentials
                  </p>
                </div>
                <Button
                  onClick={handleShowCredentials}
                  className="w-full bg-[#1a0f08] dark:bg-[#8b6f47] font-serif text-sm font-medium text-[#f4e6d7] dark:text-[#1a0f08] hover:bg-[#0f0804] dark:hover:bg-[#a08560]"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Continue with Credentials
                </Button>
              </CardContent>
            </Card>

            {/* Make a Profile Card */}
            <Card className="vintage-card border-2 border-[#1a0f08] dark:border-[#8b6f47]">
              <CardContent className="p-6 text-center space-y-4">
                <div>
                  <UserPlus className="mx-auto h-8 w-8 text-[#1a0f08] dark:text-[#8b6f47] mb-3" />
                  <h3 className="font-serif text-lg font-medium text-[#1a0f08] dark:text-[#e0d0b0] mb-2">Create Personalized Profile</h3>
                  <p className="font-serif text-sm text-[#4a3020] dark:text-[#c9a876]">
                    Answer a few questions to get news tailored specifically to your interests and background
                  </p>
                </div>
                <Button
                  onClick={handleMakeProfile}
                  variant="outline"
                  className="w-full border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] font-serif text-sm font-medium text-[#1a0f08] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418]"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Make a Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button
            onClick={() => (window.location.href = "/")}
            variant="ghost"
            className="font-serif text-sm text-[#4a3020] dark:text-[#c9a876] hover:text-[#1a0f08] dark:hover:text-[#e0d0b0]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to news
          </Button>
        </div>
      </main>
    </div>
  )
}
