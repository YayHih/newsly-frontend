"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

type UserProfile = {
  educationLevel?: string
  fieldsOfStudy?: string[]
  location?: { country: string; region?: string }
  ageRange?: number
  yearInProgram?: string
  immigrationStatus?: string
  careerGoals?: string[]
  workStatus?: string
}

interface ValuePreviewProps {
  profile: UserProfile
  currentStep: string
}

export function ValuePreview({ profile, currentStep }: ValuePreviewProps) {
  const getPreviewContent = () => {
    switch (currentStep) {
      case "education":
        if (profile.educationLevel === "undergraduate") {
          return {
            title: "College tuition rates increase 3.2% nationwide",
            description: "How rising costs affect undergraduate financial planning",
          }
        }
        return {
          title: "Graduate school funding opportunities expand",
          description: "New fellowship programs target advanced degree students",
        }

      case "field":
        if (profile.fieldsOfStudy?.includes("Finance")) {
          return {
            title: "Federal Reserve signals interest rate changes",
            description: "What finance students need to know about monetary policy",
          }
        }
        if (profile.fieldsOfStudy?.includes("Computer Science")) {
          return {
            title: "Tech sector hiring surges for new graduates",
            description: "Major companies expand entry-level programming positions",
          }
        }
        const firstField = profile.fieldsOfStudy?.[0]
        return {
          title: `${firstField} industry outlook improves`,
          description: "Career prospects brighten for recent graduates",
        }

      case "location":
        if (profile.location?.country === "Argentina") {
          return {
            title: "Argentina's peso stabilizes against dollar",
            description: "Currency changes affect international student finances",
          }
        }
        return {
          title: `Local news from ${profile.location?.country}`,
          description: "Stay connected with developments back home",
        }

      case "region":
        return {
          title: `${profile.location?.region} sees economic growth`,
          description: "Regional developments that could affect your opportunities",
        }

      case "age":
        if (profile.ageRange && profile.ageRange < 22) {
          return {
            title: "Gen Z financial habits reshape banking",
            description: "How young adults are changing money management",
          }
        }
        return {
          title: "Young professional investment trends",
          description: "Financial strategies for your age group",
        }

      case "status":
        if (profile.immigrationStatus === "international-student") {
          return {
            title: "New visa regulations affect international students",
            description: "Policy changes impact work authorization timelines",
          }
        }
        return {
          title: "Student financial aid programs expand",
          description: "New opportunities for education funding",
        }

      case "goals":
        if (profile.careerGoals?.includes("Investment Banking")) {
          return {
            title: "Wall Street recruitment season begins early",
            description: "Investment banks accelerate hiring timelines",
          }
        }
        return {
          title: "Career networking events increase nationwide",
          description: "Professional development opportunities expand",
        }

      case "work":
        if (profile.workStatus === "internship") {
          return {
            title: "Internship programs offer higher compensation",
            description: "Companies compete for student talent with better packages",
          }
        }
        return {
          title: "Student employment rights strengthened",
          description: "New protections for working students",
        }

      default:
        return {
          title: "Personalized news coming your way",
          description: "We're building your custom news feed",
        }
    }
  }

  const content = getPreviewContent()

  return (
    <Card className="vintage-card animate-in slide-in-from-bottom-4 border-2 border-[#8b7355] bg-gradient-to-r from-[#faf8f3] to-[#fdfbf0]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#6b5744]" />
          <CardTitle className="font-serif text-sm font-medium text-[#6b5744]">Sample news for you</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="mb-1 font-serif text-base font-bold text-[#2d2416]">{content.title}</h3>
        <CardDescription className="font-serif text-sm text-[#3d3426]">{content.description}</CardDescription>
      </CardContent>
    </Card>
  )
}
