"use client"

import { useState, useEffect } from "react"
import { Search, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { CornerDecoration } from "./components/corner-decoration"
import { DatePicker } from "./components/date-picker"
import { NewsCard } from "./components/news-card"

export default function Home() {
  const [date, setDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const darkMode = localStorage.getItem("noozers-dark-mode") === "true"
    setIsDarkMode(darkMode)
    if (darkMode) {
      document.documentElement.classList.add("dark")
    }

    const userData = localStorage.getItem("noozers-user")
    if (userData) {
      setIsLoggedIn(true)
      const parsed = JSON.parse(userData)
      if (!parsed.username) {
        const updatedUser = {
          email: "user@example.com",
          username: "User",
          signupMethod: "email",
        }
        localStorage.setItem("noozers-user", JSON.stringify(updatedUser))
      }
    }

    const savedProfile = localStorage.getItem("noozers-profile")
    setHasProfile(!!savedProfile)
  }, [])

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
                {date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
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
          ) : (
            <div className="space-y-6">
              <NewsCard
                category="Policy"
                title="President Trump signs executive order affecting international student visas"
                impact="New restrictions could impact your ability to work in the US after graduation and may affect OPT extensions"
                action="Schedule a meeting with your university's international student office within two weeks"
                icon="landmark"
                date="Yesterday"
                explanation="The executive order, signed yesterday, introduces new verification requirements for F-1 visa holders and reduces the OPT extension period from 24 to 12 months for STEM fields, including finance and economics. The order also implements stricter scrutiny for students from certain countries and requires additional financial documentation for visa renewals. Universities are currently seeking clarification on implementation timelines."
              />
              <NewsCard
                category="Sports"
                title="Argentina's midfielder Fernandez sidelined with minor ankle injury"
                impact="The backup player will miss upcoming friendly matches but is expected to return for qualifiers"
                action="Argentine Student Association hosting casual viewing party for next match"
                icon="trophy"
                date="3 days ago"
                explanation="Enzo Fernandez suffered a grade 1 ankle sprain during training yesterday and will miss the upcoming friendly matches against Chile and Colombia. Team doctors expect him to return to training within three weeks, well before the next round of World Cup qualifiers. While not a starting player, Fernandez has been a valuable substitute in recent matches. The injury is unlikely to significantly impact the team's performance but does reduce their midfield depth temporarily."
              />
              <NewsCard
                category="Careers"
                title="Finance sector hiring surges 22% for international graduates"
                impact="Firms are specifically seeking candidates with cross-cultural financial expertise"
                action="Update your resume to highlight your international background and finance specialization"
                icon="briefcase"
                date="2 days ago"
                explanation="Major financial institutions including Goldman Sachs, JP Morgan, and Morgan Stanley have announced expanded hiring initiatives targeting international graduates with specialized knowledge of emerging markets. The surge comes as firms expand operations in Asia and Latin America. Starting salaries for these positions average $92,000, approximately 15% higher than standard entry-level positions. The university career center is offering specialized resume workshops for international finance students next Tuesday."
              />
              <NewsCard
                category="Music"
                title="Radiohead adds nearby Riverside Theater to upcoming tour schedule"
                impact="The band will perform just 90 minutes from campus as part of their limited regional tour"
                action="Tickets go on sale this Friday at 10am through Ticketmaster"
                icon="music"
                date="4 days ago"
                explanation="Radiohead has added a stop at the Riverside Theater in Milwaukee to their 'Digital Distortion' tour, just a 90-minute drive from campus. This is their only appearance in the state and one of just seven North American dates. While not directly on campus, the proximity makes it accessible for students. The venue is significantly smaller than their usual arenas, with a capacity of only 2,500, suggesting tickets will sell quickly. Several campus organizations are arranging carpools for interested students, with sign-up sheets available in the Student Union."
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
