import React from "react"
import Link from "next/link"

export const metadata = {
  title: "Upload Lab Report | KnowMyLabs",
  description: "Upload your lab report for analysis and interpretation",
}

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <span className="font-bold text-2xl">
              <span className="text-blue-600">Know</span>
              <span className="text-blue-800">MyLabs</span>
            </span>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/upload" className="text-blue-600 font-medium">
              Upload
            </Link>
            <Link href="/account" className="text-gray-600 hover:text-blue-600 transition-colors">
              Account
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} KnowMyLabs. All rights reserved.</p>
            <p className="mt-2">
              Your privacy is our priority. We process your lab report entirely in memory with no data stored.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
