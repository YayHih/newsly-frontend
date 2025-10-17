"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

type Step = {
  id: string
  title: string
  required: boolean
  conditional?: boolean
}

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

interface OnboardingStepProps {
  step: Step
  profile: UserProfile
  onUpdate: (key: keyof UserProfile, value: any) => void
}

// Constants for dropdowns and selections
const PRIMARY_INTERESTS = [
  "Technology",
  "Politics", 
  "Health",
  "Business",
  "Sports",
  "Entertainment",
  "Science",
  "Education",
  "Arts & Culture",
  "Environment",
  "Finance"
]

const EDUCATION_LEVELS = [
  "High School",
  "Undergraduate", 
  "Graduate",
  "Postdoc",
  "Professional"
]

const AGE_RANGES = [
  "16-18",
  "19-22", 
  "23-25",
  "26-30",
  "31-35",
  "36+"
]

const CAREER_STAGES = [
  "Student",
  "Recent Graduate",
  "Early Career",
  "Mid Career", 
  "Senior",
  "Academic"
]

const TARGET_INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Government",
  "Non-profit",
  "Consulting",
  "Media",
  "Entertainment",
  "Sports",
  "Real Estate",
  "Manufacturing",
  "Retail",
  "Energy",
  "Transportation"
]

const ACADEMIC_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Engineering",
  "Medicine",
  "Law",
  "Business",
  "Economics",
  "Psychology",
  "Sociology",
  "History",
  "Literature",
  "Philosophy",
  "Political Science",
  "International Relations",
  "Art",
  "Music",
  "Theater"
]

const HOBBIES = [
  "Reading",
  "Writing",
  "Photography",
  "Painting",
  "Music",
  "Sports",
  "Cooking",
  "Gardening",
  "Travel",
  "Gaming",
  "Crafting",
  "Dancing",
  "Hiking",
  "Swimming",
  "Cycling",
  "Yoga",
  "Meditation",
  "Volunteering",
  "Collecting",
  "DIY Projects"
]

const NEWS_FREQUENCIES = [
  "Multiple Times Daily",
  "Daily",
  "Few Times a Week", 
  "Weekly",
  "Occasional"
]

const POLITICAL_ORIENTATIONS = [
  "Very Progressive",
  "Progressive",
  "Liberal",
  "Center-Left",
  "Moderate",
  "Center-Right",
  "Conservative", 
  "Libertarian",
  "Prefer Not to Say"
]

const ARTICLE_LENGTHS = [
  "short",
  "medium",
  "long", 
  "mixed"
]

const COMPLEXITY_LEVELS = [
  "beginner",
  "intermediate",
  "advanced"
]

const CONTENT_TYPES = [
  "news",
  "analysis", 
  "opinion"
]

const TOPICS_TO_AVOID = [
  "Celebrity News",
  "Sports",
  "Crime",
  "Politics",
  "Violence",
  "Business",
  "Technology"
]

const READING_TIMES = [
  "morning",
  "afternoon",
  "evening",
  "night",
  "flexible"
]

const DEVICE_PREFERENCES = [
  "mobile",
  "desktop",
  "tablet",
  "mixed"
]

export function OnboardingStep({ step, profile, onUpdate }: OnboardingStepProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile.primaryInterests || [])
  const [selectedSecondaryInterests, setSelectedSecondaryInterests] = useState<string[]>(profile.secondaryInterests || [])
  const [selectedTargetIndustries, setSelectedTargetIndustries] = useState<string[]>(profile.targetIndustries || [])
  const [selectedAcademicSubjects, setSelectedAcademicSubjects] = useState<string[]>(profile.academicSubjects || [])
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(profile.hobbies || [])
  const [selectedTopicsToAvoid, setSelectedTopicsToAvoid] = useState<string[]>(profile.topicsToAvoid || [])
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(profile.preferredContentTypes || [])

  const toggleInterest = (interest: string) => {
    const updated = selectedInterests.includes(interest)
      ? selectedInterests.filter((i) => i !== interest)
      : [...selectedInterests, interest]
    setSelectedInterests(updated)
    onUpdate("primaryInterests", updated)
  }

  const toggleSecondaryInterest = (interest: string) => {
    const updated = selectedSecondaryInterests.includes(interest)
      ? selectedSecondaryInterests.filter((i) => i !== interest)
      : [...selectedSecondaryInterests, interest]
    setSelectedSecondaryInterests(updated)
    onUpdate("secondaryInterests", updated)
  }

  const toggleTargetIndustry = (industry: string) => {
    const updated = selectedTargetIndustries.includes(industry)
      ? selectedTargetIndustries.filter((i) => i !== industry)
      : [...selectedTargetIndustries, industry]
    setSelectedTargetIndustries(updated)
    onUpdate("targetIndustries", updated)
  }

  const toggleAcademicSubject = (subject: string) => {
    const updated = selectedAcademicSubjects.includes(subject)
      ? selectedAcademicSubjects.filter((s) => s !== subject)
      : [...selectedAcademicSubjects, subject]
    setSelectedAcademicSubjects(updated)
    onUpdate("academicSubjects", updated)
  }

  const toggleHobby = (hobby: string) => {
    const updated = selectedHobbies.includes(hobby)
      ? selectedHobbies.filter((h) => h !== hobby)
      : [...selectedHobbies, hobby]
    setSelectedHobbies(updated)
    onUpdate("hobbies", updated)
  }

  const toggleTopicToAvoid = (topic: string) => {
    const updated = selectedTopicsToAvoid.includes(topic)
      ? selectedTopicsToAvoid.filter((t) => t !== topic)
      : [...selectedTopicsToAvoid, topic]
    setSelectedTopicsToAvoid(updated)
    onUpdate("topicsToAvoid", updated)
  }

  const toggleContentType = (type: string) => {
    const updated = selectedContentTypes.includes(type)
      ? selectedContentTypes.filter((t) => t !== type)
      : [...selectedContentTypes, type]
    setSelectedContentTypes(updated)
    onUpdate("preferredContentTypes", updated)
  }

  switch (step.id) {
    case "name":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">What's your name?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              This helps us personalize your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={profile.name || ""}
              onChange={(e) => onUpdate("name", e.target.value)}
              placeholder="Enter your full name"
              className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416] placeholder:text-[#8b7355]"
            />
          </CardContent>
        </Card>
      )

    case "email":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">What's your email address?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              We'll use this to send you personalized news updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="email"
              value={profile.email || ""}
              onChange={(e) => onUpdate("email", e.target.value)}
              placeholder="Enter your email address"
              className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416] placeholder:text-[#8b7355]"
            />
          </CardContent>
        </Card>
      )

    case "age":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">What's your age range?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              This helps us tailor content to your life stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={profile.ageRange} onValueChange={(value) => onUpdate("ageRange", value)}>
              <SelectTrigger className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416]">
                <SelectValue placeholder="Select your age range" />
              </SelectTrigger>
              <SelectContent className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416]">
                {AGE_RANGES.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )

    case "interests":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">What are your primary interests?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Select 3-5 topics that interest you most. This helps us personalize your news feed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedInterests.length > 0 && (
              <div className="mb-4">
                <Label className="font-serif text-sm text-[#2d2416]">Selected ({selectedInterests.length}):</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedInterests.map((interest) => (
                    <Button
                      key={interest}
                      variant="default"
                      size="sm"
                      onClick={() => toggleInterest(interest)}
                      className="bg-[#2d1810] font-serif text-xs text-[#faf8f3] hover:bg-[#1a0f08]"
                    >
                      {interest} ×
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {PRIMARY_INTERESTS.map((interest) => (
                <Button
                  key={interest}
                  variant={selectedInterests.includes(interest) ? "default" : "outline"}
                  onClick={() => toggleInterest(interest)}
                  disabled={!selectedInterests.includes(interest) && selectedInterests.length >= 5}
                  className={`justify-start font-serif text-sm ${
                    selectedInterests.includes(interest)
                      ? "bg-[#2d1810] hover:bg-[#1a0f08]"
                      : "border-2 border-[#8b7355] bg-[#f5f0e8] text-[#3d3426] hover:bg-[#e8dcc8] hover:text-[#2d2416] disabled:opacity-50"
                  }`}
                >
                  {interest}
                </Button>
              ))}
            </div>
            {selectedInterests.length < 3 && (
              <p className="text-sm text-[#8b7355] font-serif">
                Please select at least 3 interests to continue.
              </p>
            )}
          </CardContent>
        </Card>
      )

    case "education":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">What's your education level?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              This helps us understand your academic context
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={profile.educationLevel} onValueChange={(value) => onUpdate("educationLevel", value)}>
              <SelectTrigger className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416]">
                <SelectValue placeholder="Select your education level" />
              </SelectTrigger>
              <SelectContent className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416]">
                {EDUCATION_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )

    case "field":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">What do you study or do for work?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Optional: Tell us about your field of study or profession
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={profile.fieldOfStudy || ""}
              onChange={(e) => onUpdate("fieldOfStudy", e.target.value)}
              placeholder="e.g., Computer Science, Marketing, Medicine, etc."
              className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416] placeholder:text-[#8b7355]"
            />
          </CardContent>
        </Card>
      )

    case "secondaryField":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">Any secondary field of study or work?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Optional: Do you have a minor, second major, or additional professional focus?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={profile.secondaryField || ""}
              onChange={(e) => onUpdate("secondaryField", e.target.value)}
              placeholder="e.g., Psychology minor, Business certificate, etc."
              className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416] placeholder:text-[#8b7355]"
            />
          </CardContent>
        </Card>
      )

    case "yearInProgram":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">What year are you in?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Optional: Helps us understand your academic timeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              value={profile.yearInProgram || ""}
              onChange={(e) => onUpdate("yearInProgram", parseInt(e.target.value) || 0)}
              placeholder="e.g., 1, 2, 3, 4"
              min="1"
              max="10"
              className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416] placeholder:text-[#8b7355]"
            />
          </CardContent>
        </Card>
      )

    case "career":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">What's your career stage?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Optional: Helps us include relevant career news
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={profile.careerStage} onValueChange={(value) => onUpdate("careerStage", value)}>
              <SelectTrigger className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416]">
                <SelectValue placeholder="Select your career stage" />
              </SelectTrigger>
              <SelectContent className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416]">
                {CAREER_STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )

    case "targetIndustries":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">What industries interest you?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Optional: Select industries you're interested in working in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTargetIndustries.length > 0 && (
              <div className="mb-4">
                <Label className="font-serif text-sm text-[#2d2416]">Selected ({selectedTargetIndustries.length}):</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedTargetIndustries.map((industry) => (
                    <Button
                      key={industry}
                      variant="default"
                      size="sm"
                      onClick={() => toggleTargetIndustry(industry)}
                      className="bg-[#2d1810] font-serif text-xs text-[#faf8f3] hover:bg-[#1a0f08]"
                    >
                      {industry} ×
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {TARGET_INDUSTRIES.map((industry) => (
                <Button
                  key={industry}
                  variant={selectedTargetIndustries.includes(industry) ? "default" : "outline"}
                  onClick={() => toggleTargetIndustry(industry)}
                  className={`justify-start font-serif text-sm ${
                    selectedTargetIndustries.includes(industry)
                      ? "bg-[#2d1810] hover:bg-[#1a0f08]"
                      : "border-2 border-[#8b7355] bg-[#f5f0e8] text-[#3d3426] hover:bg-[#e8dcc8] hover:text-[#2d2416]"
                  }`}
                >
                  {industry}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )

    case "secondaryInterests":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">Any secondary interests?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Optional: Select additional topics you're interested in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedSecondaryInterests.length > 0 && (
              <div className="mb-4">
                <Label className="font-serif text-sm text-[#2d2416]">Selected ({selectedSecondaryInterests.length}):</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedSecondaryInterests.map((interest) => (
                    <Button
                      key={interest}
                      variant="default"
                      size="sm"
                      onClick={() => toggleSecondaryInterest(interest)}
                      className="bg-[#2d1810] font-serif text-xs text-[#faf8f3] hover:bg-[#1a0f08]"
                    >
                      {interest} ×
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {PRIMARY_INTERESTS.map((interest) => (
                <Button
                  key={interest}
                  variant={selectedSecondaryInterests.includes(interest) ? "default" : "outline"}
                  onClick={() => toggleSecondaryInterest(interest)}
                  className={`justify-start font-serif text-sm ${
                    selectedSecondaryInterests.includes(interest)
                      ? "bg-[#2d1810] hover:bg-[#1a0f08]"
                      : "border-2 border-[#8b7355] bg-[#f5f0e8] text-[#3d3426] hover:bg-[#e8dcc8] hover:text-[#2d2416]"
                  }`}
                >
                  {interest}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )

    case "academicSubjects":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">What academic subjects interest you?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Optional: Select subjects you're interested in learning about
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedAcademicSubjects.length > 0 && (
              <div className="mb-4">
                <Label className="font-serif text-sm text-[#2d2416]">Selected ({selectedAcademicSubjects.length}):</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedAcademicSubjects.map((subject) => (
                    <Button
                      key={subject}
                      variant="default"
                      size="sm"
                      onClick={() => toggleAcademicSubject(subject)}
                      className="bg-[#2d1810] font-serif text-xs text-[#faf8f3] hover:bg-[#1a0f08]"
                    >
                      {subject} ×
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {ACADEMIC_SUBJECTS.map((subject) => (
                <Button
                  key={subject}
                  variant={selectedAcademicSubjects.includes(subject) ? "default" : "outline"}
                  onClick={() => toggleAcademicSubject(subject)}
                  className={`justify-start font-serif text-sm ${
                    selectedAcademicSubjects.includes(subject)
                      ? "bg-[#2d1810] hover:bg-[#1a0f08]"
                      : "border-2 border-[#8b7355] bg-[#f5f0e8] text-[#3d3426] hover:bg-[#e8dcc8] hover:text-[#2d2416]"
                  }`}
                >
                  {subject}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )

    case "hobbies":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">What are your hobbies?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Optional: Select activities you enjoy in your free time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedHobbies.length > 0 && (
              <div className="mb-4">
                <Label className="font-serif text-sm text-[#2d2416]">Selected ({selectedHobbies.length}):</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedHobbies.map((hobby) => (
                    <Button
                      key={hobby}
                      variant="default"
                      size="sm"
                      onClick={() => toggleHobby(hobby)}
                      className="bg-[#2d1810] font-serif text-xs text-[#faf8f3] hover:bg-[#1a0f08]"
                    >
                      {hobby} ×
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {HOBBIES.map((hobby) => (
                <Button
                  key={hobby}
                  variant={selectedHobbies.includes(hobby) ? "default" : "outline"}
                  onClick={() => toggleHobby(hobby)}
                  className={`justify-start font-serif text-sm ${
                    selectedHobbies.includes(hobby)
                      ? "bg-[#2d1810] hover:bg-[#1a0f08]"
                      : "border-2 border-[#8b7355] bg-[#f5f0e8] text-[#3d3426] hover:bg-[#e8dcc8] hover:text-[#2d2416]"
                  }`}
                >
                  {hobby}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )

    case "topicsToAvoid":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">What topics would you like to avoid?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Optional: Select topics you don't want to see in your news feed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTopicsToAvoid.length > 0 && (
              <div className="mb-4">
                <Label className="font-serif text-sm text-[#2d2416]">Selected ({selectedTopicsToAvoid.length}):</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedTopicsToAvoid.map((topic) => (
                    <Button
                      key={topic}
                      variant="default"
                      size="sm"
                      onClick={() => toggleTopicToAvoid(topic)}
                      className="bg-[#2d1810] font-serif text-xs text-[#faf8f3] hover:bg-[#1a0f08]"
                    >
                      {topic} ×
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {TOPICS_TO_AVOID.map((topic) => (
                <Button
                  key={topic}
                  variant={selectedTopicsToAvoid.includes(topic) ? "default" : "outline"}
                  onClick={() => toggleTopicToAvoid(topic)}
                  className={`justify-start font-serif text-sm ${
                    selectedTopicsToAvoid.includes(topic)
                      ? "bg-[#2d1810] hover:bg-[#1a0f08]"
                      : "border-2 border-[#8b7355] bg-[#f5f0e8] text-[#3d3426] hover:bg-[#e8dcc8] hover:text-[#2d2416]"
                  }`}
                >
                  {topic}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )

    case "preferredComplexity":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">What complexity level do you prefer?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Optional: Helps us adjust the depth of content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={profile.preferredComplexity} onValueChange={(value) => onUpdate("preferredComplexity", value)}>
              <SelectTrigger className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416]">
                <SelectValue placeholder="Select complexity level" />
              </SelectTrigger>
              <SelectContent className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416]">
                {COMPLEXITY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )

    case "articleLength":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">What length articles do you prefer?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Optional: Helps us prioritize article length in your feed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={profile.preferredArticleLength} onValueChange={(value) => onUpdate("preferredArticleLength", value)}>
              {ARTICLE_LENGTHS.map((length) => (
                <div key={length} className="flex items-center space-x-2">
                  <RadioGroupItem value={length} id={length} />
                  <Label htmlFor={length} className="font-serif text-[#2d2416]">
                    {length.charAt(0).toUpperCase() + length.slice(1)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )

    case "newsFrequency":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">How often do you read news?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Optional: Helps us adjust the frequency of updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={profile.newsFrequency} onValueChange={(value) => onUpdate("newsFrequency", value)}>
              <SelectTrigger className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416]">
                <SelectValue placeholder="Select your reading frequency" />
              </SelectTrigger>
              <SelectContent className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416]">
                {NEWS_FREQUENCIES.map((frequency) => (
                  <SelectItem key={frequency} value={frequency}>
                    {frequency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )

    case "contentTypes":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">What types of content do you prefer?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Optional: Select the types of news content you want to see
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedContentTypes.length > 0 && (
              <div className="mb-4">
                <Label className="font-serif text-sm text-[#2d2416]">Selected ({selectedContentTypes.length}):</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedContentTypes.map((type) => (
                    <Button
                      key={type}
                      variant="default"
                      size="sm"
                      onClick={() => toggleContentType(type)}
                      className="bg-[#2d1810] font-serif text-xs text-[#faf8f3] hover:bg-[#1a0f08]"
                    >
                      {type} ×
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-2">
              {CONTENT_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={selectedContentTypes.includes(type) ? "default" : "outline"}
                  onClick={() => toggleContentType(type)}
                  className={`justify-start font-serif text-sm ${
                    selectedContentTypes.includes(type)
                      ? "bg-[#2d1810] hover:bg-[#1a0f08]"
                      : "border-2 border-[#8b7355] bg-[#f5f0e8] text-[#3d3426] hover:bg-[#e8dcc8] hover:text-[#2d2416]"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )

    case "politicalOrientation":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">What's your political orientation?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Optional: Helps us balance your political news coverage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={profile.politicalOrientation} onValueChange={(value) => onUpdate("politicalOrientation", value)}>
              <SelectTrigger className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416]">
                <SelectValue placeholder="Select your political orientation" />
              </SelectTrigger>
              <SelectContent className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416]">
                {POLITICAL_ORIENTATIONS.map((orientation) => (
                  <SelectItem key={orientation} value={orientation}>
                    {orientation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )

    case "newsFocus":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">What's your news focus?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Optional: Select your preferred news scope
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="international"
                checked={profile.internationalFocus || false}
                onCheckedChange={(checked) => onUpdate("internationalFocus", checked)}
              />
              <Label htmlFor="international" className="font-serif text-[#2d2416]">
                I want international news
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="local"
                checked={profile.localFocus || false}
                onCheckedChange={(checked) => onUpdate("localFocus", checked)}
              />
              <Label htmlFor="local" className="font-serif text-[#2d2416]">
                I want local news
              </Label>
            </div>
          </CardContent>
        </Card>
      )

    case "breakingNews":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">Breaking news priority</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Optional: Should we show you breaking news first?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="breaking-news"
                checked={profile.breakingNewsPriority || false}
                onCheckedChange={(checked) => onUpdate("breakingNewsPriority", checked)}
                className="data-[state=checked]:bg-[#2d1810] data-[state=unchecked]:bg-[#8b7355]"
              />
              <Label htmlFor="breaking-news" className="font-serif text-[#2d2416]">
                Show me breaking news first
              </Label>
            </div>
          </CardContent>
        </Card>
      )

    case "readingTime":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">When do you prefer to read news?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Optional: Helps us time your news delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={profile.readingTimePreference} onValueChange={(value) => onUpdate("readingTimePreference", value)}>
              <SelectTrigger className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416]">
                <SelectValue placeholder="Select your preferred reading time" />
              </SelectTrigger>
              <SelectContent className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416]">
                {READING_TIMES.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time.charAt(0).toUpperCase() + time.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )

    case "devicePreference":
      return (
        <Card className="vintage-card border-2 border-[#8b7355]">
          <CardHeader>
            <CardTitle className="font-serif text-[#2d2416]">What device do you prefer for reading news?</CardTitle>
            <CardDescription className="font-serif text-[#3d3426]">
              Optional: Helps us optimize content for your preferred device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={profile.devicePreference} onValueChange={(value) => onUpdate("devicePreference", value)}>
              <SelectTrigger className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416]">
                <SelectValue placeholder="Select your device preference" />
              </SelectTrigger>
              <SelectContent className="border-2 border-[#8b7355] bg-[#f5f0e8] font-serif text-[#2d2416]">
                {DEVICE_PREFERENCES.map((device) => (
                  <SelectItem key={device} value={device}>
                    {device.charAt(0).toUpperCase() + device.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )

    default:
      return null
  }
}