"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, LogOut, User, BookOpen, Settings as SettingsIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { api, tokenStorage } from "@/lib/api"

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const token = tokenStorage.get()
      if (!token) {
        window.location.href = "/signin"
        return
      }

      // Get user data from API
      const userData = await api.getCurrentUser(token)

      // Get full profile from database
      const query = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const fullProfile = await query.json()

      setProfile(fullProfile)
    } catch (error) {
      console.error('Failed to load profile:', error)
      window.location.href = "/signin"
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    tokenStorage.remove()
    localStorage.removeItem("noozers-user")
    localStorage.removeItem("newsly-token")
    window.location.href = "/"
  }

  if (isLoading) {
    return (
      <div className="victorian-bg min-h-screen flex items-center justify-center">
        <Card className="standardized-text-box">
          <CardContent className="p-6 text-center">
            <p className="text-[#4a3020] dark:text-[#c9a876]">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="victorian-bg min-h-screen flex flex-col font-serif paper-grain">
      <header className="vintage-paper sticky top-0 z-10 border-b-4 border-double border-[#1a0f08] dark:border-[#8b6f47] backdrop-blur-sm shadow-md">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/8370d9ef-9307-4d5e-a48e-27287fc5b683.png"
                alt="Noozers"
                className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200 drop-shadow-lg"
                style={{ filter: 'brightness(0.7) contrast(1.2) saturate(1.1)' }}
                onClick={() => window.location.href = '/'}
              />
            </div>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] text-xs font-medium text-[#1a0f08] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h2 className="mb-2 text-3xl font-bold text-[#1a0f08] dark:text-[#8b6f47]">Your Profile</h2>
            <p className="text-sm text-[#4a3020] dark:text-[#c9a876]">View and manage your personalized news preferences</p>
          </div>

          <div className="space-y-6">
            {/* Account Information */}
            <Card className="standardized-text-box shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1a0f08] dark:text-[#8b6f47]">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-[#6b5744] mb-1">Name</p>
                    <p className="text-sm text-[#1a0f08] dark:text-[#e0d0b0]">{profile.name || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#6b5744] mb-1">Email</p>
                    <p className="text-sm text-[#1a0f08] dark:text-[#e0d0b0]">{profile.email || "Not set"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Details from Database */}
            <Card className="standardized-text-box shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1a0f08] dark:text-[#8b6f47]">
                  <BookOpen className="h-5 w-5" />
                  Your Preferences
                </CardTitle>
                <CardDescription className="text-[#4a3020] dark:text-[#c9a876]">
                  Information we use to personalize your news feed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.age_range && (
                    <div>
                      <p className="text-xs font-medium text-[#6b5744] mb-1">Age Range</p>
                      <p className="text-sm text-[#1a0f08] dark:text-[#e0d0b0]">{profile.age_range}</p>
                    </div>
                  )}
                  {profile.education_level && (
                    <div>
                      <p className="text-xs font-medium text-[#6b5744] mb-1">Education Level</p>
                      <p className="text-sm text-[#1a0f08] dark:text-[#e0d0b0]">{profile.education_level}</p>
                    </div>
                  )}
                  {profile.field_of_study && (
                    <div>
                      <p className="text-xs font-medium text-[#6b5744] mb-1">Field of Study</p>
                      <p className="text-sm text-[#1a0f08] dark:text-[#e0d0b0]">{profile.field_of_study}</p>
                    </div>
                  )}
                  {profile.political_orientation && (
                    <div>
                      <p className="text-xs font-medium text-[#6b5744] mb-1">Political Orientation</p>
                      <p className="text-sm text-[#1a0f08] dark:text-[#e0d0b0]">{profile.political_orientation}</p>
                    </div>
                  )}
                </div>

                <Separator className="bg-[#8b7355]" />

                {profile.primary_interests && profile.primary_interests.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[#6b5744] mb-2">Primary Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.primary_interests.map((interest: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-[#2d1810] dark:bg-[#8b6f47] text-[#f5f0e8] dark:text-[#1a0f08] text-xs rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.secondary_interests && profile.secondary_interests.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[#6b5744] mb-2">Secondary Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.secondary_interests.map((interest: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 border-2 border-[#8b7355] text-[#3d2a1a] dark:text-[#c9a876] text-xs rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.hobbies && profile.hobbies.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[#6b5744] mb-2">Hobbies</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.hobbies.map((hobby: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 border-2 border-[#8b7355] text-[#3d2a1a] dark:text-[#c9a876] text-xs rounded-full">
                          {hobby}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.topics_to_avoid && profile.topics_to_avoid.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[#6b5744] mb-2">Topics to Avoid</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.topics_to_avoid.map((topic: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded-full">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reading Preferences */}
            <Card className="standardized-text-box shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1a0f08] dark:text-[#8b6f47]">
                  <SettingsIcon className="h-5 w-5" />
                  Reading Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.preferred_complexity && (
                    <div>
                      <p className="text-xs font-medium text-[#6b5744] mb-1">Preferred Complexity</p>
                      <p className="text-sm text-[#1a0f08] dark:text-[#e0d0b0]">{profile.preferred_complexity}</p>
                    </div>
                  )}
                  {profile.preferred_article_length && (
                    <div>
                      <p className="text-xs font-medium text-[#6b5744] mb-1">Article Length</p>
                      <p className="text-sm text-[#1a0f08] dark:text-[#e0d0b0]">{profile.preferred_article_length}</p>
                    </div>
                  )}
                  {profile.news_frequency && (
                    <div>
                      <p className="text-xs font-medium text-[#6b5744] mb-1">Reading Frequency</p>
                      <p className="text-sm text-[#1a0f08] dark:text-[#e0d0b0]">{profile.news_frequency}</p>
                    </div>
                  )}
                </div>

                {profile.preferred_content_types && profile.preferred_content_types.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[#6b5744] mb-2">Content Types</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.preferred_content_types.map((type: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 border-2 border-[#8b7355] text-[#3d2a1a] dark:text-[#c9a876] text-xs rounded-full">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="standardized-text-box shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#1a0f08] dark:text-[#8b6f47]">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => (window.location.href = "/onboarding")}
                  variant="outline"
                  className="w-full border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] text-sm text-[#1a0f08] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418]"
                >
                  Edit Profile
                </Button>

                <Separator className="bg-[#8b7355]" />

                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] text-sm text-[#1a0f08] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418]"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
