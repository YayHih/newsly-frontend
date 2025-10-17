"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

type UserProfile = {
  name?: string
  email?: string
  ageRange?: string
  primaryInterests?: string[]
  educationLevel?: string
  fieldOfStudy?: string
  secondaryField?: string
  yearInProgram?: number
  careerStage?: string
  targetIndustries?: string[]
  secondaryInterests?: string[]
  academicSubjects?: string[]
  hobbies?: string[]
  topicsToAvoid?: string[]
  preferredComplexity?: string
  preferredArticleLength?: string
  newsFrequency?: string
  preferredContentTypes?: string[]
  politicalOrientation?: string
  internationalFocus?: boolean
  localFocus?: boolean
  breakingNewsPriority?: boolean
  readingTimePreference?: string
  devicePreference?: string
}

interface ValuePreviewProps {
  profile: UserProfile
  currentStep: string
}

export function ValuePreview({ profile, currentStep }: ValuePreviewProps) {
  const getPreviewContent = () => {
    switch (currentStep) {
      case "name":
        return {
          title: `Welcome${profile.name ? ', ' + profile.name : ''}!`,
          description: "We'll personalize your news experience just for you",
        }

      case "email":
        return {
          title: "Stay connected with your news",
          description: "We'll send you daily digests of stories you care about",
        }

      case "age":
        if (profile.ageRange === "18-24") {
          return {
            title: "Gen Z reshapes social media landscape",
            description: "How young adults are changing digital communication",
          }
        } else if (profile.ageRange === "25-34") {
          return {
            title: "Young professionals navigate hybrid work",
            description: "Career strategies for the modern workplace",
          }
        } else if (profile.ageRange === "35-44") {
          return {
            title: "Mid-career professionals embrace new opportunities",
            description: "Industry insights for experienced workers",
          }
        }
        return {
          title: "News tailored to your generation",
          description: "Stories that matter to people like you",
        }

      case "interests":
        const interests = profile.primaryInterests
        if (interests && interests.length > 0) {
          const firstInterest = interests[0]
          if (firstInterest === "Technology") {
            return {
              title: "AI breakthroughs reshape tech industry",
              description: "Latest innovations in artificial intelligence and software",
            }
          } else if (firstInterest === "Business") {
            return {
              title: "Stock markets reach new heights",
              description: "Economic trends and business opportunities",
            }
          } else if (firstInterest === "Science") {
            return {
              title: "New discovery advances medical research",
              description: "Scientific breakthroughs changing our world",
            }
          } else if (firstInterest === "Politics") {
            return {
              title: "Policy debates shape national agenda",
              description: "Political developments and their impact",
            }
          } else if (firstInterest === "Sports") {
            return {
              title: "Championship season heats up",
              description: "Latest scores and athlete stories",
            }
          }
          return {
            title: `${firstInterest} news highlights`,
            description: `Stay informed about ${firstInterest.toLowerCase()} developments`,
          }
        }
        return {
          title: "Discover stories you'll love",
          description: "News based on your interests",
        }

      case "education":
        if (profile.educationLevel === "High School") {
          return {
            title: "College admission trends shift dramatically",
            description: "What high school students need to know",
          }
        } else if (profile.educationLevel === "Bachelor's Degree") {
          return {
            title: "Entry-level job market expands for graduates",
            description: "Career opportunities for recent college grads",
          }
        } else if (profile.educationLevel === "Master's Degree" || profile.educationLevel === "Doctorate") {
          return {
            title: "Advanced degree holders see salary growth",
            description: "Graduate education pays dividends in job market",
          }
        }
        return {
          title: "Education news tailored to your level",
          description: "Stories relevant to your academic background",
        }

      case "field":
        if (profile.fieldOfStudy) {
          return {
            title: `${profile.fieldOfStudy} industry shows strong growth`,
            description: "Career opportunities and sector developments",
          }
        }
        return {
          title: "Industry insights for your field",
          description: "Professional news tailored to your expertise",
        }

      case "secondaryField":
        if (profile.secondaryField) {
          return {
            title: `Cross-sector opportunities in ${profile.secondaryField}`,
            description: "Expanding your career horizons",
          }
        }
        return {
          title: "Broaden your professional perspective",
          description: "News from adjacent fields you care about",
        }

      case "yearInProgram":
        return {
          title: "Academic milestones and opportunities",
          description: "News relevant to your current stage of study",
        }

      case "career":
        if (profile.careerStage === "Student") {
          return {
            title: "Student employment opportunities surge",
            description: "Part-time jobs and internships expand",
          }
        } else if (profile.careerStage === "Entry-level") {
          return {
            title: "Companies ramp up entry-level hiring",
            description: "Career advice for new professionals",
          }
        } else if (profile.careerStage === "Mid-career") {
          return {
            title: "Mid-career professionals in high demand",
            description: "Advancement opportunities and industry shifts",
          }
        }
        return {
          title: "Career news for your stage",
          description: "Professional development insights",
        }

      case "targetIndustries":
        const industries = profile.targetIndustries
        if (industries && industries.length > 0) {
          return {
            title: `${industries[0]} sector sees major developments`,
            description: "Industry trends and career opportunities",
          }
        }
        return {
          title: "Industry news you're interested in",
          description: "Stay ahead of sector trends",
        }

      case "secondaryInterests":
        return {
          title: "Exploring your diverse interests",
          description: "News that broadens your horizons",
        }

      case "academicSubjects":
        const subjects = profile.academicSubjects
        if (subjects && subjects.length > 0) {
          return {
            title: `New research breakthroughs in ${subjects[0]}`,
            description: "Academic developments in your field of study",
          }
        }
        return {
          title: "Academic news for your subjects",
          description: "Research and educational insights",
        }

      case "hobbies":
        const hobbies = profile.hobbies
        if (hobbies && hobbies.length > 0) {
          return {
            title: `${hobbies[0]} enthusiasts gather for events`,
            description: "Community news and hobby trends",
          }
        }
        return {
          title: "News about your hobbies and passions",
          description: "Stories beyond work and study",
        }

      case "topicsToAvoid":
        return {
          title: "Curating your perfect news feed",
          description: "We'll filter out topics you prefer to skip",
        }

      case "preferredComplexity":
        if (profile.preferredComplexity === "Simple") {
          return {
            title: "Clear explanations of today's events",
            description: "News simplified for easy understanding",
          }
        } else if (profile.preferredComplexity === "Detailed") {
          return {
            title: "In-depth analysis of global developments",
            description: "Comprehensive coverage with expert insights",
          }
        }
        return {
          title: "News at your preferred depth",
          description: "Content that matches your reading style",
        }

      case "articleLength":
        if (profile.preferredArticleLength === "Short") {
          return {
            title: "Quick reads: Key stories in brief",
            description: "Get informed in just a few minutes",
          }
        } else if (profile.preferredArticleLength === "Long") {
          return {
            title: "Long-form journalism: Deep dives",
            description: "Comprehensive stories worth your time",
          }
        }
        return {
          title: "Articles sized just right for you",
          description: "Content that fits your schedule",
        }

      case "newsFrequency":
        return {
          title: "Your personalized news schedule",
          description: "Updates delivered at your preferred pace",
        }

      case "contentTypes":
        return {
          title: "Content in your favorite formats",
          description: "Articles, videos, and more based on your preferences",
        }

      case "politicalOrientation":
        return {
          title: "Balanced perspectives on current events",
          description: "News that respects your viewpoint",
        }

      case "newsFocus":
        if (profile.internationalFocus) {
          return {
            title: "Global developments shape tomorrow",
            description: "International news from around the world",
          }
        } else if (profile.localFocus) {
          return {
            title: "Local community news and events",
            description: "Stories from your neighborhood",
          }
        }
        return {
          title: "News from the areas you care about",
          description: "Local and global coverage balanced for you",
        }

      case "breakingNews":
        if (profile.breakingNewsPriority) {
          return {
            title: "BREAKING: Major story developing now",
            description: "Real-time updates on critical events",
          }
        }
        return {
          title: "Stay informed at your own pace",
          description: "News when you want it, not when it's urgent",
        }

      case "readingTime":
        return {
          title: "News that fits your schedule",
          description: "Reading recommendations for your available time",
        }

      case "devicePreference":
        return {
          title: "Optimized for your devices",
          description: "Great reading experience wherever you are",
        }

      default:
        return {
          title: "Building your personalized news feed",
          description: "We're learning what matters to you",
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
