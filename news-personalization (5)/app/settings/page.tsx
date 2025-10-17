"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Eye, EyeOff, LogOut, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load actual user from localStorage
    const savedUser = localStorage.getItem("noozers-user")

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setEmail(userData.email || "")
        setUsername(userData.name || userData.username || "")
      } catch (error) {
        console.error("Failed to parse user data", error)
        // Redirect to signin if no valid user
        window.location.href = "/signin"
      }
    } else {
      // No user found, redirect to signin
      window.location.href = "/signin"
    }
  }, [])

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const updatedUser = { ...user, email, username }
      localStorage.setItem("noozers-user", JSON.stringify(updatedUser))
      setUser(updatedUser)
      setIsLoading(false)
      alert("Account updated successfully!")
    }, 1000)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("New passwords don't match")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setIsLoading(false)
      alert("Password updated successfully!")
    }, 1000)
  }

  const handleSignOut = () => {
    // Remove all auth-related data
    localStorage.removeItem("noozers-user")
    localStorage.removeItem("noozers-mock-token")
    localStorage.removeItem("noozers-auth-token")
    // Keep profile and onboarding data in case they want to sign back in
    window.location.href = "/"
  }

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      localStorage.clear()
      window.location.href = "/signin"
    }
  }

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center font-cursive"
        style={{
          background: "linear-gradient(135deg, #d4c5a0 0%, #e0d0b0 25%, #d8c8a5 50%, #dccdb0 75%, #d4c5a0 100%)",
        }}
      >
        <Card className="border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-[#4a3020] dark:text-[#c9a876]">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="victorian-bg min-h-screen flex flex-col font-serif">
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
        <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-bold text-[#1a0f08] dark:text-[#8b6f47]">Account Settings</h2>
          <p className="text-sm text-[#4a3020] dark:text-[#c9a876]">Manage your account information and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <Card
            className="standardized-text-box shadow-xl"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1a0f08] dark:text-[#8b6f47]">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription className="text-[#4a3020] dark:text-[#c9a876]">
                Update your username, email address and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleUpdateAccount} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm text-[#1a0f08] dark:text-[#8b6f47]">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] text-[#1a0f08] dark:text-[#e0d0b0]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-[#1a0f08] dark:text-[#8b6f47]">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] text-[#1a0f08] dark:text-[#e0d0b0]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-[#1a0f08] dark:text-[#8b6f47]">Sign-up Method</Label>
                  <div className="rounded-md border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] p-3">
                    <span className="text-sm text-[#4a3020] dark:text-[#c9a876] capitalize">
                      {user.signupMethod || "Email"}
                    </span>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#1a0f08] dark:bg-[#8b6f47] text-sm text-[#f4e6d7] dark:text-[#1a0f08] hover:bg-[#0f0804] dark:hover:bg-[#a08560] disabled:opacity-50 dark-mode-button"
                >
                  {isLoading ? "Updating..." : "Update Account"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Settings - Only show for email signups */}
          {user.signupMethod === "email" && (
            <Card 
              className="standardized-text-box shadow-xl"
            >
              <CardHeader>
                <CardTitle className="text-[#1a0f08] dark:text-[#8b6f47]">Change Password</CardTitle>
                <CardDescription className="text-[#4a3020] dark:text-[#c9a876]">
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm text-[#1a0f08] dark:text-[#8b6f47]">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] text-[#1a0f08] dark:text-[#e0d0b0] pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-[#8b7355]" />
                        ) : (
                          <Eye className="h-4 w-4 text-[#8b7355]" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm text-[#1a0f08] dark:text-[#8b6f47]">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] text-[#1a0f08] dark:text-[#e0d0b0]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm text-[#1a0f08] dark:text-[#8b6f47]">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] text-[#1a0f08] dark:text-[#e0d0b0]"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#1a0f08] dark:bg-[#8b6f47] text-sm text-[#f4e6d7] dark:text-[#1a0f08] hover:bg-[#0f0804] dark:hover:bg-[#a08560] disabled:opacity-50 dark-mode-button"
                  >
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Profile Management */}
          <Card
            className="standardized-text-box shadow-xl"
          >
            <CardHeader>
              <CardTitle className="text-[#1a0f08] dark:text-[#8b6f47]">Profile Management</CardTitle>
              <CardDescription className="text-[#4a3020] dark:text-[#c9a876]">
                Manage your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => (window.location.href = "/onboarding")}
                variant="outline"
                className="w-full border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] text-sm text-[#1a0f08] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418]"
              >
                Add More Information
              </Button>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card
            className="standardized-text-box shadow-xl"
          >
            <CardHeader>
              <CardTitle className="text-[#1a0f08] dark:text-[#8b6f47]">Account Actions</CardTitle>
              <CardDescription className="text-[#4a3020] dark:text-[#c9a876]">
                Sign out or delete your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full border-2 border-[#1a0f08] dark:border-[#8b6f47] bg-[#f4e6d7] dark:bg-[#241610] text-sm text-[#1a0f08] dark:text-[#e0d0b0] hover:bg-[#d0be9a] dark:hover:bg-[#3a2418]"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>

              <Separator className="bg-[#8b7355]" />

              <Button onClick={handleDeleteAccount} variant="destructive" className="w-full text-sm">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>
      </main>
    </div>
  )
}
