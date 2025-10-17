"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

import { OnboardingStep } from "./components/onboarding-step"
import { ValuePreview } from "./components/value-preview"
import { CornerDecoration } from "../components/corner-decoration"

type UserProfile = {
  // Required fields
  name?: string
  email?: string
  ageRange?: string
  primaryInterests?: string[]
  educationLevel?: string
  
  // Optional fields
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

const STEPS = [
  // Required questions (1-5)
  { id: "name", title: "Name", required: true },
  { id: "email", title: "Email", required: true },
  { id: "age", title: "Age Range", required: true },
  { id: "interests", title: "Primary Interests", required: true },
  { id: "education", title: "Education Level", required: true },
  
  // Optional questions (6-24) - grouped logically
  { id: "field", title: "Field of Study", required: false },
  { id: "secondaryField", title: "Secondary Field", required: false },
  { id: "yearInProgram", title: "Year in Program", required: false },
  { id: "career", title: "Career Stage", required: false },
  { id: "targetIndustries", title: "Target Industries", required: false },
  { id: "secondaryInterests", title: "Secondary Interests", required: false },
  { id: "academicSubjects", title: "Academic Subjects", required: false },
  { id: "hobbies", title: "Hobbies", required: false },
  { id: "topicsToAvoid", title: "Topics to Avoid", required: false },
  { id: "preferredComplexity", title: "Preferred Complexity", required: false },
  { id: "articleLength", title: "Preferred Article Length", required: false },
  { id: "newsFrequency", title: "News Reading Frequency", required: false },
  { id: "contentTypes", title: "Preferred Content Types", required: false },
  { id: "politicalOrientation", title: "Political Orientation", required: false },
  { id: "newsFocus", title: "News Focus", required: false },
  { id: "breakingNews", title: "Breaking News Priority", required: false },
  { id: "readingTime", title: "Reading Time Preference", required: false },
  { id: "devicePreference", title: "Device Preference", required: false },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [profile, setProfile] = useState<UserProfile>({})
  const [showPreview, setShowPreview] = useState(false)
  const [isReturning, setIsReturning] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Check if user has partial profile saved
    const savedProfile = localStorage.getItem("noozers-profile")
    const onboardingComplete = localStorage.getItem("noozers-onboarding-complete")

    if (savedProfile) {
      const parsed = JSON.parse(savedProfile)
      setProfile(parsed)

      if (onboardingComplete) {
        setIsEditing(true)
        setIsReturning(true)
      } else {
        setIsReturning(true)
        // Find the first incomplete step
        const incompleteStep = STEPS.findIndex((step) => {
          if (step.conditional && step.id === "region") {
            return false // Skip conditional steps in initial scan
          }
          switch (step.id) {
            case "education":
              return !parsed.educationLevel
            case "field":
              return !parsed.fieldsOfStudy || parsed.fieldsOfStudy.length === 0
            case "location":
              return !parsed.location
            case "age":
              return !parsed.ageRange
            case "year":
              return !parsed.yearInProgram
            case "status":
              return !parsed.immigrationStatus
            case "goals":
              return !parsed.careerGoals
            case "work":
              return !parsed.workStatus
            default:
              return true
          }
        })
        if (incompleteStep !== -1) {
          setCurrentStep(incompleteStep)
        }
      }
    }
  }, [])

  const updateProfile = (key: keyof UserProfile, value: any) => {
    const newProfile = { ...profile, [key]: value }
    setProfile(newProfile)
    localStorage.setItem("noozers-profile", JSON.stringify(newProfile))
    // Only show preview after a short delay to ensure user has made a selection
    setTimeout(() => {
      setShowPreview(true)
      setTimeout(() => setShowPreview(false), 3000)
    }, 500)
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
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipQuestion = () => {
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const skipQuestionnaire = () => {
    // Save current profile and complete onboarding
    localStorage.setItem('noozers-profile', JSON.stringify(profile))
    localStorage.setItem('noozers-onboarding-complete', 'true')
    window.location.href = '/'
  }

  const skipStep = () => {
    nextStep()
  }

  const finishOnboarding = () => {
    if (isEditing) {
      // If editing, just go back to main page
      window.location.href = "/"
    } else {
      // If first time, go to signup
      window.location.href = "/signup"
    }
  }

  const getProgress = () => {
    const requiredSteps = getVisibleSteps().filter((step) => step.required)
    const completedRequired = requiredSteps.filter((step) => {
      switch (step.id) {
        case "name":
          return !!profile.name && profile.name.trim().length > 0
        case "email":
          return !!profile.email && profile.email.includes('@')
        case "age":
          return !!profile.ageRange
        case "interests":
          return profile.primaryInterests && profile.primaryInterests.length >= 3
        case "education":
          return !!profile.educationLevel
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
      case "name":
        return !!profile.name && profile.name.trim().length > 0
      case "email":
        return !!profile.email && profile.email.includes('@')
      case "age":
        return !!profile.ageRange
      case "interests":
        return profile.primaryInterests && profile.primaryInterests.length >= 3 && profile.primaryInterests.length <= 5
      case "education":
        return !!profile.educationLevel
      default:
        return true
    }
  }

  const visibleSteps = getVisibleSteps()
  const currentStepData = visibleSteps[currentStep]

  return (
    <div className="victorian-bg page-flourish min-h-screen flex flex-col ornate-serif parchment-overlay paper-grain text-[#2d2416]">
      <CornerDecoration />
      <header className="vintage-paper sticky top-0 z-10 border-b-4 border-double border-[#8b7355] backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/8370d9ef-9307-4d5e-a48e-27287fc5b683.png" 
                alt="Noozers" 
                className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200 drop-shadow-lg"
                style={{ filter: 'brightness(0.7) contrast(1.2) saturate(1.1)' }}
                onClick={() => window.location.href = '/'}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={skipQuestionnaire}
                variant="outline"
                className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-xs font-bold uppercase tracking-wide text-[#2d2416] hover:bg-[#f5f0e8]"
              >
                Skip Questionnaire
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-xs font-bold uppercase tracking-wide text-[#2d2416] hover:bg-[#f5f0e8]"
              >
                {isEditing ? "Save & Return" : "Skip for now"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left column - Progress and navigation */}
          <div className="lg:col-span-1 space-y-6">
            {isReturning && (
              <Card className="standardized-text-box">
                <CardContent className="p-3">
                  <p className="font-serif text-sm text-[#3d3426]">
                    <span className="font-medium text-[#2d2416]">
                      {isEditing ? "Update your preferences" : "Welcome back!"}
                    </span>{" "}
                    {isEditing
                      ? "to get better recommendations."
                      : "Continue building your profile for better recommendations."}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="standardized-text-box">
              <CardContent className="p-4">
                <div className="mb-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-serif text-sm font-medium text-[#2d2416]">Progress</h3>
                    <span className="font-serif text-xs text-[#6b5744]">
                      Step {currentStep + 1} of {visibleSteps.length}
                    </span>
                  </div>
                  <Progress value={getProgress()} className="h-2 bg-[#f5f0e8]" />
                </div>
                
                <div className="space-y-2">
                  {visibleSteps.map((step, index) => (
                    <div
                      key={step.id}
                      onClick={() => setCurrentStep(index)}
                      className={`flex items-center gap-2 text-xs cursor-pointer hover:bg-[#f5f0e8] p-1 rounded transition-colors ${
                        index === currentStep
                          ? "text-[#2d2416] font-medium"
                          : index < currentStep
                          ? "text-[#6b5744] line-through"
                          : "text-[#8b7355]"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          index === currentStep
                            ? "bg-[#2d2416]"
                            : index < currentStep
                            ? "bg-[#6b5744]"
                            : "bg-[#8b7355]"
                        }`}
                      />
                      <span className="font-serif">{step.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button
                onClick={prevStep}
                disabled={currentStep === 0}
                variant="outline"
                className="w-full border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-sm text-[#3d3426] hover:bg-[#f5f0e8] hover:text-[#2d2416] disabled:opacity-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {!currentStepData?.required && (
                <Button
                  onClick={skipQuestion}
                  variant="outline"
                  className="w-full border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-sm text-[#3d3426] hover:bg-[#f5f0e8] hover:text-[#2d2416]"
                >
                  Skip Question
                </Button>
              )}

              {currentStep === visibleSteps.length - 1 ? (
                <Button
                  onClick={finishOnboarding}
                  className="w-full bg-[#2d1810] font-serif text-sm font-medium text-[#faf8f3] hover:bg-[#1a0f08] dark-mode-button"
                >
                  <Check className="mr-2 h-4 w-4" />
                  {isEditing ? "Save Changes" : "Continue to Sign Up"}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="w-full bg-[#2d1810] font-serif text-sm font-medium text-[#faf8f3] hover:bg-[#1a0f08] disabled:opacity-50 dark-mode-button"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Right column - Main content */}
          <div className="lg:col-span-3">
            <Card className="standardized-text-box shadow-xl">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h2 className="font-serif text-2xl font-bold text-[#2d2416] mb-2">{currentStepData?.title}</h2>
                  <p className="font-serif text-sm text-[#6b5744]">
                    {currentStepData?.required ? "Required information" : "Optional information"}
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <OnboardingStep step={currentStepData} profile={profile} onUpdate={updateProfile} />

                  {showPreview && <ValuePreview profile={profile} currentStep={currentStepData?.id} />}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
