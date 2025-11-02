import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "Newsly - Personalized News",
  description: "Your personalized news platform",
  generator: 'v0.app'
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&family=Crimson+Text:ital,wght@0,400;0,600;1,400;1,600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-cursive">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
