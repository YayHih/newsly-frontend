"use client"

import { useState, useEffect } from "react"
import { Search, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { CornerDecoration } from "./components/corner-decoration"
import { DatePicker } from "./components/date-picker"
import { NewsCard } from "./components/news-card"
import { api, tokenStorage, Recommendation } from "@/lib/api"

export default function Home() {
  const [date, setDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const darkMode = localStorage.getItem("noozers-dark-mode") === "true"
    setIsDarkMode(darkMode)
    if (darkMode) {
      document.documentElement.classList.add("dark")
    }

    const token = tokenStorage.get()
    if (token) {
      setIsLoggedIn(true)
      // Fetch recommendations
      loadRecommendations(token)
    } else {
      setIsLoading(false)
    }

    const savedProfile = localStorage.getItem("noozers-profile")
    setHasProfile(!!savedProfile)
  }, [])

  const loadRecommendations = async (token: string) => {
    try {
      const recs = await api.getRecommendations(token, 1, 20)
      setRecommendations(recs)
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem("noozers-dark-mode", String(newMode))
    if (newMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setIsLoading(true)
      setDate(newDate)
      setTimeout(() => {
        setIsLoading(false)
      }, 800)
    }
  }

  return (
    <div className="victorian-bg page-flourish flex min-h-screen flex-col ornate-serif parchment-overlay paper-grain">
      <CornerDecoration />

      <header className="vintage-paper sticky top-0 z-10 border-b-4 border-double border-[#2d1810] dark:border-[#8b6f47] backdrop-blur-sm shadow-md parchment-overlay">
        <div className="mx-auto max-w-7xl px-6 py-4">
          {/* Simple title - no decorations */}
          <div className="mb-0 flex justify-center">
            <img 
              src="/8370d9ef-9307-4d5e-a48e-27287fc5b683.png" 
              alt="Noozers" 
              className="h-48 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200 drop-shadow-lg"
              style={{ filter: 'brightness(0.7) contrast(1.2) saturate(1.1)' }}
              onClick={() => window.location.href = '/'}
            />
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a3020] dark:text-[#8b6f47]" />
              <Input
                type="search"
                placeholder="Search archives..."
                className="w-full border-2 border-[#4a3020] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#241610] pl-10 font-serif text-sm text-[#3d2a1a] dark:text-[#e0d0b0] placeholder:text-[#8b6f47] focus:border-[#3d2a1a] dark:focus:border-[#8b6f47] rounded-xl"
              />
            </div>

            <div className="flex justify-center">
              <DatePicker date={date} onDateChange={handleDateChange} />
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={toggleDarkMode}
                variant="outline"
                size="sm"
                className="h-9 border-2 border-[#4a3020] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#f5f0e8] px-4 font-serif text-xs font-bold uppercase tracking-wide text-[#3d2a1a] dark:text-[#3d2a1a] hover:bg-[#8b6f47] hover:text-[#f5f1e8] dark:hover:bg-[#3a2418] dark:hover:text-[#e0d0b0] transition-colors whitespace-nowrap rounded-xl"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              {isLoggedIn && (
                <Button
                  onClick={() => (window.location.href = "/onboarding")}
                  variant="outline"
                  size="sm"
                  className="h-9 border-2 border-[#4a3020] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#f5f0e8] px-4 font-serif text-xs font-bold uppercase tracking-wide text-[#3d2a1a] dark:text-[#3d2a1a] hover:bg-[#8b6f47] hover:text-[#f5f1e8] dark:hover:bg-[#3a2418] dark:hover:text-[#e0d0b0] transition-colors whitespace-nowrap rounded-xl"
                >
                  Add Info
                </Button>
              )}
              {isLoggedIn ? (
                <Button
                  onClick={() => (window.location.href = "/settings")}
                  variant="outline"
                  size="sm"
                  className="h-9 border-2 border-[#4a3020] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#f5f0e8] px-4 font-serif text-xs font-bold uppercase tracking-wide text-[#3d2a1a] dark:text-[#3d2a1a] hover:bg-[#8b6f47] hover:text-[#f5f1e8] dark:hover:bg-[#3a2418] dark:hover:text-[#e0d0b0] transition-colors whitespace-nowrap rounded-xl"
                >
                  Profile
                </Button>
              ) : (
                <Button
                  onClick={() => (window.location.href = "/signin")}
                  variant="outline"
                  size="sm"
                  className="h-9 border-2 border-[#4a3020] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#f5f0e8] px-4 font-serif text-xs font-bold uppercase tracking-wide text-[#3d2a1a] dark:text-[#3d2a1a] hover:bg-[#8b6f47] hover:text-[#f5f1e8] dark:hover:bg-[#3a2418] dark:hover:text-[#e0d0b0] transition-colors whitespace-nowrap rounded-xl"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 border-b-2 border-[#4a3020] dark:border-[#8b6f47] pb-2">
            <div className="text-center">
              <div className="fancy-heading text-sm text-[#4a3020] dark:text-[#c9a876]">
                {mounted ? date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }) : "Loading..."}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="vintage-card h-48 animate-pulse border-2 border-[#4a3020] dark:border-[#8b6f47]"
                />
              ))}
            </div>
          ) : !isLoggedIn && !hasProfile ? (
            <div className="text-center py-12">
              <Card className="vintage-card border-2 border-[#4a3020] dark:border-[#8b6f47] p-8">
                <h3 className="font-serif text-xl font-bold text-[#3d2a1a] dark:text-[#e0d0b0] mb-4">
                  Welcome to Newsly
                </h3>
                <p className="font-serif text-sm text-[#4a3020] dark:text-[#c9a876] mb-6">
                  Create a personalized profile to get news recommendations tailored to your interests
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => window.location.href = "/onboarding"}
                    className="bg-[#3d2a1a] dark:bg-[#8b6f47] font-serif text-sm font-medium text-[#f5f1e8] dark:text-[#1a0f08] hover:bg-[#2d1f16] dark:hover:bg-[#a08560]"
                  >
                    Create Profile
                  </Button>
                  <Button
                    onClick={() => window.location.href = "/signin"}
                    variant="outline"
                    className="border-2 border-[#4a3020] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#241610] font-serif text-sm text-[#3d2a1a] dark:text-[#e0d0b0]"
                  >
                    Sign In
                  </Button>
                </div>
              </Card>
            </div>
          ) : !isLoggedIn && hasProfile ? (
            <div className="text-center py-12">
              <Card className="vintage-card border-2 border-[#4a3020] dark:border-[#8b6f47] p-8">
                <h3 className="font-serif text-xl font-bold text-[#3d2a1a] dark:text-[#e0d0b0] mb-4">
                  Profile Saved!
                </h3>
                <p className="font-serif text-sm text-[#4a3020] dark:text-[#c9a876] mb-6">
                  Your preferences have been saved locally. Create an account to sync your profile across devices and get personalized news recommendations from our API.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => window.location.href = "/signup"}
                    className="bg-[#3d2a1a] dark:bg-[#8b6f47] font-serif text-sm font-medium text-[#f5f1e8] dark:text-[#1a0f08] hover:bg-[#2d1f16] dark:hover:bg-[#a08560]"
                  >
                    Create Account
                  </Button>
                  <Button
                    onClick={() => window.location.href = "/signin"}
                    variant="outline"
                    className="border-2 border-[#4a3020] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#241610] font-serif text-sm text-[#3d2a1a] dark:text-[#e0d0b0]"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => window.location.href = "/onboarding"}
                    variant="outline"
                    className="border-2 border-[#4a3020] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#241610] font-serif text-sm text-[#3d2a1a] dark:text-[#e0d0b0]"
                  >
                    Edit Profile
                  </Button>
                </div>
              </Card>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12">
              <Card className="vintage-card border-2 border-[#4a3020] dark:border-[#8b6f47] p-8">
                <h3 className="font-serif text-xl font-bold text-[#3d2a1a] dark:text-[#e0d0b0] mb-4">
                  No Recommendations Yet
                </h3>
                <p className="font-serif text-sm text-[#4a3020] dark:text-[#c9a876] mb-6">
                  Complete your profile to get personalized news recommendations
                </p>
                <Button
                  onClick={() => window.location.href = "/onboarding"}
                  className="bg-[#3d2a1a] dark:bg-[#8b6f47] font-serif text-sm font-medium text-[#f5f1e8] dark:text-[#1a0f08] hover:bg-[#2d1f16] dark:hover:bg-[#a08560]"
                >
                  Complete Your Profile
                </Button>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {recommendations.map((rec) => (
                <NewsCard
                  key={rec.id}
                  category={rec.article_source || "News"}
                  title={rec.article_title || "Untitled Article"}
                  impact={rec.recommendation_reason || ""}
                  action={rec.article_url ? `Read more at ${rec.article_source}` : ""}
                  icon="newspaper"
                  date={new Date(rec.created_at).toLocaleDateString()}
                  explanation={rec.article_description || ""}
                  url={rec.article_url || undefined}
                  relevanceScore={rec.relevance_score}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
