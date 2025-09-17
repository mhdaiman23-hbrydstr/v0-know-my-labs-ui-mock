import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { LabTestProvider } from "@/lib/lab-test-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "KnowMyLabs - Understand Your Lab Results",
  description: "Get plain-English explanations of your medical lab results with KnowMyLabs",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <LabTestProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </LabTestProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
