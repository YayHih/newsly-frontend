"use client"

import { useState, useEffect } from "react"
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  CreditCard,
  DollarSign,
  ExternalLink,
  Globe,
  Heart,
  Landmark,
  Music,
  Trophy,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type NewsCardProps = {
  category: string
  title: string
  impact: string
  action: string
  icon: "dollar-sign" | "credit-card" | "briefcase" | "globe" | "landmark" | "trophy" | "music" | "newspaper"
  explanation: string
  date: string
  url?: string
  relevanceScore?: number
}

export function NewsCard({ category, title, impact, action, icon, explanation, date, url, relevanceScore }: NewsCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [isInterested, setIsInterested] = useState(false)
  const [isNotInterested, setIsNotInterested] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const savedArticles = JSON.parse(localStorage.getItem("noozers-saved") || "{}")
    setIsSaved(!!savedArticles[title])
  }, [title])

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  const toggleSaved = () => {
    const newSaved = !isSaved
    setIsSaved(newSaved)
    const savedArticles = JSON.parse(localStorage.getItem("noozers-saved") || "{}")
    if (newSaved) {
      savedArticles[title] = true
    } else {
      delete savedArticles[title]
    }
    localStorage.setItem("noozers-saved", JSON.stringify(savedArticles))
  }

  const toggleInterested = () => {
    setIsInterested(!isInterested)
    if (isNotInterested) setIsNotInterested(false)
    const preferences = JSON.parse(localStorage.getItem("noozers-interests") || "{}")
    preferences[category] = isInterested ? null : "interested"
    localStorage.setItem("noozers-interests", JSON.stringify(preferences))
  }

  const toggleNotInterested = () => {
    setIsNotInterested(!isNotInterested)
    if (isInterested) setIsInterested(false)
    const preferences = JSON.parse(localStorage.getItem("noozers-interests") || "{}")
    preferences[category] = isNotInterested ? null : "not-interested"
    localStorage.setItem("noozers-interests", JSON.stringify(preferences))
  }

  const getIcon = () => {
    const iconClass = "h-6 w-6 text-[#4a3020] dark:text-[#c9a876]"
    switch (icon) {
      case "dollar-sign":
        return <DollarSign className={iconClass} />
      case "credit-card":
        return <CreditCard className={iconClass} />
      case "briefcase":
        return <Briefcase className={iconClass} />
      case "globe":
        return <Globe className={iconClass} />
      case "landmark":
        return <Landmark className={iconClass} />
      case "trophy":
        return <Trophy className={iconClass} />
      case "music":
        return <Music className={iconClass} />
      case "newspaper":
        return <Globe className={iconClass} />
      default:
        return <Globe className={iconClass} />
    }
  }

  const getCategoryColor = () => {
    return "border-2 border-[#4a3020] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#f5f0e8] font-serif text-xs font-bold uppercase tracking-wide text-[#1a0f08] dark:text-[#1a0f08] rounded-lg"
  }

  // Note: Sources and related topics removed - using real article data from Dell server
  // The category (source) is now displayed in the card header

  return (
    <Card className="standardized-text-box overflow-hidden rounded-2xl">
      <CardHeader className="border-b-2 border-[#4a3020] dark:border-[#8b6f47] pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center border-2 border-[#4a3020] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#f5f0e8] rounded-xl">
              {getIcon()}
            </div>
            <span className={`px-3 py-1 ${getCategoryColor()}`}>{category}</span>
          </div>
          <span className="font-serif text-xs italic text-[#4a3020] dark:text-[#c9a876]">{date}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-3 pt-4">
        <h3 className="mb-3 border-b border-[#4a3020] dark:border-[#8b6f47] pb-2 fancy-heading text-2xl leading-tight text-[#3d2a1a] dark:text-[#e0d0b0]">
          {title}
        </h3>
        <CardDescription className="mb-3 ornate-serif text-base text-[#3d2a1a] dark:text-[#d0be9a]">
          <span className="font-bold text-[#3d2a1a] dark:text-[#e0d0b0]">What it means for you:</span> {impact}
        </CardDescription>
        <div className="mb-2 border-t border-[#4a3020] dark:border-[#8b6f47] pt-3">
          <p className="ornate-serif text-base text-[#3d2a1a] dark:text-[#d0be9a]">
            <span className="font-bold text-[#3d2a1a] dark:text-[#e0d0b0]">What to do:</span> {action}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t-2 border-[#4a3020] dark:border-[#8b6f47] pt-3">
        <div className="flex gap-2">
          <Button
            onClick={toggleSaved}
            variant="outline"
            size="sm"
            className={`border-2 border-[#4a3020] dark:border-[#8b6f47] font-serif text-xs font-bold uppercase transition-colors rounded-lg ${
              isSaved
                ? "bg-[#3d2a1a] dark:bg-[#8b6f47] text-[#f5f1e8] dark:text-[#1a0f08] hover:bg-[#2d1f16] dark:hover:bg-[#a08560]"
                : "bg-[#f5f0e8] dark:bg-[#241610] text-[#3d2a1a] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418]"
            }`}
          >
            Save
          </Button>
          <Button
            onClick={toggleInterested}
            variant="outline"
            size="sm"
            className={`border-2 border-[#4a3020] dark:border-[#8b6f47] font-serif text-xs font-bold uppercase transition-colors rounded-lg ${
              isInterested
                ? "bg-[#3d2a1a] dark:bg-[#8b6f47] text-[#f5f1e8] dark:text-[#1a0f08] hover:bg-[#2d1f16] dark:hover:bg-[#a08560]"
                : "bg-[#f5f0e8] dark:bg-[#241610] text-[#3d2a1a] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418]"
            }`}
          >
            <Heart className={`mr-1 h-3 w-3 ${isInterested ? "fill-current" : ""}`} />
            Interested
          </Button>
          <Button
            onClick={toggleNotInterested}
            variant="outline"
            size="sm"
            className={`border-2 border-[#4a3020] dark:border-[#8b6f47] font-serif text-xs font-bold uppercase transition-colors rounded-lg ${
              isNotInterested
                ? "bg-[#3d2a1a] dark:bg-[#6a4830] text-[#f5f1e8] dark:text-[#1a0f08] hover:bg-[#2d1f16] dark:hover:bg-[#8b6f47]"
                : "bg-[#f5f0e8] dark:bg-[#241610] text-[#3d2a1a] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418]"
            }`}
          >
            <X className={`mr-1 h-3 w-3 ${isNotInterested ? "fill-current" : ""}`} />
            Not Interested
          </Button>
        </div>
        <Button
          onClick={toggleExpand}
          size="sm"
          variant="default"
          className="gap-1 border-2 border-[#3d2a1a] dark:border-[#8b6f47] bg-[#3d2a1a] dark:bg-[#8b6f47] font-serif text-sm font-bold uppercase text-[#f5f1e8] dark:text-[#1a0f08] hover:bg-[#2d1f16] dark:hover:bg-[#a08560] rounded-lg dark-mode-button"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              <span>Show Less</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              <span>More Information</span>
            </>
          )}
        </Button>
      </CardFooter>

      {expanded && (
        <>
          <Separator className="mx-6 w-auto border-t-2 border-dashed border-[#4a3020] dark:border-[#8b6f47]" />
          <div className="px-6 py-4">
            <h4 className="mb-2 border-b border-[#4a3020] dark:border-[#8b6f47] pb-1 fancy-heading text-[#1a0f08] dark:text-[#e0d0b0]">
              Article Summary
            </h4>
            <p className="mb-4 ornate-serif text-sm leading-relaxed text-[#2d1810] dark:text-[#d0be9a]">{explanation || "Click 'Read Full Article' to learn more."}</p>

            {url && (
              <Button
                size="sm"
                className="mt-2 gap-1 border-2 border-[#3d2a1a] dark:border-[#8b6f47] bg-[#3d2a1a] dark:bg-[#8b6f47] font-serif text-xs font-bold uppercase text-[#f5f1e8] dark:text-[#1a0f08] hover:bg-[#2d1f16] dark:hover:bg-[#a08560] rounded-lg"
                onClick={() => window.open(url, '_blank')}
              >
                Read Full Article
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </>
      )}
    </Card>
  )
}
