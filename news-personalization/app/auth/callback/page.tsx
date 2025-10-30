"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { tokenStorage } from "@/lib/api"

export default function AuthCallbackPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")
    const error = searchParams.get("error")

    if (error) {
      setStatus("error")
      setMessage(error === "access_denied"
        ? "Authentication was cancelled"
        : "Authentication failed. Please try again.")

      // Redirect to signin after 3 seconds
      setTimeout(() => {
        window.location.href = "/signin"
      }, 3000)
    } else if (token) {
      // Store the token
      tokenStorage.set(token)
      setStatus("success")
      setMessage("Successfully signed in! Redirecting...")

      // Redirect to home after 1 second
      setTimeout(() => {
        window.location.href = "/"
      }, 1000)
    } else {
      setStatus("error")
      setMessage("Invalid callback response")

      // Redirect to signin after 3 seconds
      setTimeout(() => {
        window.location.href = "/signin"
      }, 3000)
    }
  }, [searchParams])

  return (
    <div className="victorian-bg min-h-screen flex items-center justify-center font-serif">
      <Card className="vintage-card border-2 border-[#3d2a1a] dark:border-[#8b6f47] max-w-md">
        <CardContent className="p-8 text-center">
          {status === "loading" && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3d2a1a] dark:border-[#8b6f47] mx-auto mb-4"></div>
              <h2 className="font-serif text-xl font-bold text-[#3d2a1a] dark:text-[#e0d0b0] mb-2">
                Authenticating...
              </h2>
              <p className="font-serif text-sm text-[#4a3020] dark:text-[#c9a876]">
                Please wait while we complete your sign-in
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <h2 className="font-serif text-xl font-bold text-[#3d2a1a] dark:text-[#e0d0b0] mb-2">
                Success!
              </h2>
              <p className="font-serif text-sm text-[#4a3020] dark:text-[#c9a876]">
                {message}
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="text-red-600 text-5xl mb-4">✗</div>
              <h2 className="font-serif text-xl font-bold text-[#3d2a1a] dark:text-[#e0d0b0] mb-2">
                Authentication Failed
              </h2>
              <p className="font-serif text-sm text-[#4a3020] dark:text-[#c9a876]">
                {message}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
