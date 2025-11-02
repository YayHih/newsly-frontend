"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CornerDecoration } from "../components/corner-decoration"
import { api, tokenStorage } from "@/lib/api"

export default function SignUpPage() {
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean>(true) // Bypass password gate
  const [accessPassword, setAccessPassword] = useState<string>("")
  const [accessError, setAccessError] = useState<string>("")
  const [isCheckingAccess, setIsCheckingAccess] = useState<boolean>(false)

  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    // Bypass password gate - always grant access
    setHasAccess(true)
  }, [])

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain an uppercase letter")
      return
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must contain a lowercase letter")
      return
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain a number")
      return
    }

    setIsLoading(true)

    try {
      // Register user via API
      const response = await api.register(email, name, password)

      // Store the auth token
      tokenStorage.set(response.access_token)

      // Store user data
      const userData = {
        id: response.user_id,
        name: response.name,
        email: response.email,
        signupMethod: 'email'
      }
      localStorage.setItem("noozers-user", JSON.stringify(userData))

      // Redirect to onboarding
      window.location.href = "/onboarding"
        } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    // Redirect to Google OAuth
    window.location.href = api.getGoogleLoginUrl()
  }

  const handleAccessPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAccessError("")
    setIsCheckingAccess(true)

    try {
      const response = await api.verifyPassword(accessPassword)
      if (response.valid) {
        sessionStorage.setItem("newsly-signup-access", "granted")
        setHasAccess(true)
      }
    } catch (err: any) {
      setAccessError("Incorrect password. Please try again.")
    } finally {
      setIsCheckingAccess(false)
    }
  }

  // Password gate
  if (!hasAccess) {
    return (
      <div className="victorian-bg page-flourish min-h-screen flex flex-col font-serif">
        <CornerDecoration />
        <header className="vintage-paper sticky top-0 z-10 border-b-4 border-double border-[#3d2a1a] dark:border-[#8b6f47] backdrop-blur-sm shadow-md">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-center">
              <img
                src="/8370d9ef-9307-4d5e-a48e-27287fc5b683.png"
                alt="Newsly"
                className="h-30 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200"
                style={{ filter: 'brightness(0.7) contrast(1.2) saturate(1.1)' }}
                onClick={() => window.location.href = '/'}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="vintage-card border-2 border-[#3d2a1a] dark:border-[#8b6f47] max-w-md w-full">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="font-serif text-2xl font-bold text-[#3d2a1a] dark:text-[#e0d0b0] mb-2">
                  Welcome to Newsly
                </h2>
                <p className="font-serif text-sm text-[#4a3020] dark:text-[#c9a876]">
                  Please enter the access password to create an account
                </p>
              </div>

              {accessError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-center">
                  <p className="font-serif text-sm text-red-600">{accessError}</p>
                </div>
              )}

              <form onSubmit={handleAccessPasswordSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accessPassword" className="font-serif text-sm text-[#3d2a1a] dark:text-[#e0d0b0]">
                      Access Password
                    </Label>
                    <Input
                      id="accessPassword"
                      type="password"
                      placeholder="Enter access password"
                      value={accessPassword}
                      onChange={(e) => setAccessPassword(e.target.value)}
                      required
                      className="border-2 border-[#3d2a1a] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#241610] font-serif text-[#3d2a1a] dark:text-[#e0d0b0] placeholder:text-[#8b6f47]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isCheckingAccess}
                    className="w-full bg-[#3d2a1a] dark:bg-[#8b6f47] font-serif text-sm font-medium text-[#f5f1e8] dark:text-[#1a0f08] hover:bg-[#2d1f16] dark:hover:bg-[#a08560] disabled:opacity-50"
                  >
                    {isCheckingAccess ? "Verifying..." : "Continue"}
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <Button
                  onClick={() => window.location.href = "/"}
                  variant="ghost"
                  className="font-serif text-sm text-[#4a3020] dark:text-[#c9a876] hover:text-[#3d2a1a] dark:hover:text-[#e0d0b0]"
                >
                  Back to home
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
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
                alt="Newsly"
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
              Save your preferences and get personalized news
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-center">
              <p className="font-serif text-sm text-red-600">{error}</p>
            </div>
          )}

          <Card className="vintage-card border-2 border-[#3d2a1a] dark:border-[#8b6f47]">
            <CardContent className="p-6 space-y-4">
              {/* Google Sign Up */}
              <Button
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                variant="outline"
                className="w-full border-2 border-[#3d2a1a] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#241610] font-serif text-sm text-[#3d2a1a] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418] disabled:opacity-50"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>

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
                  <Label htmlFor="name" className="font-serif text-sm text-[#3d2a1a] dark:text-[#e0d0b0]">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-2 border-[#3d2a1a] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#241610] font-serif text-[#3d2a1a] dark:text-[#e0d0b0] placeholder:text-[#8b6f47]"
                  />
                </div>

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
                  <p className="font-serif text-xs text-[#4a3020] dark:text-[#c9a876]">
                    8+ characters, uppercase, lowercase, number
                  </p>
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

              <div className="text-center">
                <p className="font-serif text-xs text-[#4a3020] dark:text-[#c9a876]">
                  Already have an account?{" "}
                  <button
                    onClick={() => window.location.href = "/signin"}
                    className="text-[#3d2a1a] dark:text-[#8b6f47] hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
