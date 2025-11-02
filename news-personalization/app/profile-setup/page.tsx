"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

import { OnboardingStep } from "../onboarding/components/onboarding-step"
import { ValuePreview } from "../onboarding/components/value-preview"
import { CornerDecoration } from "../components/corner-decoration"

interface UserProfile {
  // Required fields
  name?: string
  email?: string
  ageRange?: string
  primaryInterests?: string[]
  educationLevel?: string
  
  // Optional fields
  fieldOfStudy?: string
  fieldsOfStudy?: string[]
  location?: { country: string; region?: string }
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

const STEPS = [
  { id: "education", title: "Education", required: true },
  { id: "field", title: "Fields of Study", required: true },
  { id: "location", title: "Location", required: true },
  { id: "region", title: "Region", required: false, conditional: true },
  { id: "age", title: "Age Range", required: true },
  { id: "year", title: "Academic Year", required: false },
  { id: "status", title: "Status", required: false },
  { id: "goals", title: "Career Goals", required: false },
  { id: "work", title: "Work Status", required: false },
]

export default function ProfileSetupPage() {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [profile, setProfile] = useState<UserProfile>({})
  const [showPreview, setShowPreview] = useState<boolean>(false)

  const updateProfile = (key: keyof UserProfile, value: UserProfile[keyof UserProfile]) => {
    const newProfile = { ...profile, [key]: value }
    setProfile(newProfile)
    localStorage.setItem("noozers-profile", JSON.stringify(newProfile))
    // Only show preview if there's actually a value
    if (value !== undefined && value !== null && value !== "") {
      setShowPreview(true)
      setTimeout(() => setShowPreview(false), 3000)
    }
  }

  const shouldShowRegionStep = () => {
    return (
      profile.location?.country &&
      ["United States", "Canada", "Australia", "Germany", "United Kingdom"].includes(profile.location.country)
    )
  }

  const getVisibleSteps = () => {
    return STEPS.filter((step) => {
      if (step.id === "region") {
        return shouldShowRegionStep()
      }
      return true
    })
  }

  const nextStep = () => {
    const visibleSteps = getVisibleSteps()
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      setShowPreview(false) // Hide preview when moving to next step
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipStep = () => {
    nextStep()
  }

  const skipQuestionnaire = () => {
    // Go to credentials-only page
    window.location.href = "/credentials"
  }

  const finishProfileSetup = () => {
    // Go to signup after completing profile
    window.location.href = "/signup"
  }

  const getProgress = () => {
    const requiredSteps = getVisibleSteps().filter((step) => step.required)
    const completedRequired = requiredSteps.filter((step) => {
      switch (step.id) {
        case "education":
          return profile.educationLevel
        case "field":
          return profile.fieldsOfStudy && profile.fieldsOfStudy.length > 0
        case "location":
          return profile.location
        case "age":
          return profile.ageRange
        default:
          return false
      }
    }).length
    return (completedRequired / requiredSteps.length) * 100
  }

  const canProceed = () => {
    const visibleSteps = getVisibleSteps()
    const step = visibleSteps[currentStep]
    if (!step.required) return true

    switch (step.id) {
      case "education":
        return !!profile.educationLevel
      case "field":
        return profile.fieldsOfStudy && profile.fieldsOfStudy.length > 0
      case "location":
        return !!profile.location
      case "age":
        return !!profile.ageRange
      default:
        return true
    }
  }

  const visibleSteps = getVisibleSteps()
  const currentStepData = visibleSteps[currentStep]

  return (
    <div className="victorian-bg page-flourish min-h-screen flex flex-col font-serif">
      <CornerDecoration />
      <header className="vintage-paper sticky top-0 z-10 border-b-4 border-double border-[#1a0f08] dark:border-[#8b6f47] backdrop-blur-sm shadow-md">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/8370d9ef-9307-4d5e-a48e-27287fc5b683.png" 
                alt="Noozers" 
                className="h-30 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200 drop-shadow-lg"
                style={{ filter: 'brightness(0.7) contrast(1.2) saturate(1.1)' }}
                onClick={() => window.location.href = '/'}
              />
            </div>
            <Button
              onClick={skipQuestionnaire}
              variant="outline"
              className="border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] font-serif text-xs font-medium text-[#1a0f08] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418]"
            >
              Skip Questionnaire
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <Card className="vintage-card mb-6 border-2 border-[#1a0f08] dark:border-[#8b6f47]">
            <CardContent className="p-4">
              <p className="font-serif text-sm text-[#4a3020] dark:text-[#c9a876]">
                Help us understand your interests to provide tailored news recommendations.
              </p>
            </CardContent>
          </Card>

          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium text-[#1a0f08] dark:text-[#e0d0b0]">{currentStepData?.title}</h2>
              <span className="font-serif text-sm text-[#4a3020] dark:text-[#c9a876]">
                Step {currentStep + 1} of {visibleSteps.length}
              </span>
            </div>
            <Progress value={getProgress()} className="h-2 bg-[#f4e6d7] dark:bg-[#3a2418]" />
          </div>

        <div className="space-y-6">
          <OnboardingStep step={currentStepData} profile={profile} onUpdate={updateProfile} />

          {showPreview && <ValuePreview profile={profile} currentStep={currentStepData?.id} />}

          <div className="flex items-center justify-between">
            <Button
              onClick={prevStep}
              disabled={currentStep === 0}
              variant="outline"
              className="border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] font-serif text-sm text-[#1a0f08] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418] disabled:opacity-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="flex gap-2">
              {!currentStepData?.required && (
                <Button
                  onClick={skipStep}
                  variant="outline"
                  className="border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] font-serif text-sm text-[#1a0f08] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418]"
                >
                  Skip Question
                </Button>
              )}

              <Button
                onClick={skipQuestionnaire}
                variant="outline"
                className="border-2 border-[#3d2a1a] dark:border-[#8b6f47] bg-[#f5f0e8] dark:bg-[#241610] font-serif text-sm text-[#3d2a1a] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418]"
              >
                Skip Questionnaire
              </Button>

              {currentStep === visibleSteps.length - 1 ? (
                <Button
                  onClick={finishProfileSetup}
                  className="bg-[#1a0f08] dark:bg-[#8b6f47] font-serif text-sm font-medium text-[#f4e6d7] dark:text-[#1a0f08] hover:bg-[#0f0804] dark:hover:bg-[#a08560]"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Create Account
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="bg-[#3d2a1a] dark:bg-[#8b6f47] font-serif text-sm font-medium text-[#f5f1e8] dark:text-[#1a0f08] hover:bg-[#2d1f16] dark:hover:bg-[#a08560] disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  )
}
