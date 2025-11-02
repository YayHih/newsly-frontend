"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"

interface PasswordGateProps {
  onPasswordCorrect: () => void
}

export function PasswordGate({ onPasswordCorrect }: PasswordGateProps) {
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isChecking, setIsChecking] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsChecking(true)

    // Check password against API
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        // Password correct - store in session
        sessionStorage.setItem("newsly-onboarding-access", "granted")
        onPasswordCorrect()
      } else {
        setError("Incorrect password. Please try again.")
        setPassword("")
      }
    } catch (err) {
      console.error("Password verification error:", err)
      setError("Connection error. Please try again.")
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="victorian-bg page-flourish min-h-screen flex items-center justify-center ornate-serif parchment-overlay paper-grain">
      <Card className="standardized-text-box shadow-2xl w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h1 className="font-serif text-3xl font-bold text-[#2d2416] mb-2">Welcome to Newsly</h1>
            <p className="font-serif text-sm text-[#6b5744]">
              Please enter the access password to continue to the personalization questionnaire.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="font-serif text-sm font-medium text-[#2d2416] mb-2 block">
                Access Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full border-2 border-[#4a3020] bg-[#f5f0e8] font-serif text-[#3d2a1a] placeholder:text-[#8b6f47] focus:border-[#3d2a1a]"
                disabled={isChecking}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="font-serif text-xs text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!password || isChecking}
              className="w-full bg-[#2d1810] font-serif text-sm font-medium text-[#faf8f3] hover:bg-[#1a0f08] disabled:opacity-50"
            >
              {isChecking ? "Verifying..." : "Continue"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#8b7355]">
            <p className="font-serif text-xs text-center text-[#8b6f47]">
              Don't have access? Contact your administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
