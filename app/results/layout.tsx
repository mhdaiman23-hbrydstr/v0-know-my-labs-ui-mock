import React from "react"

export const metadata = {
  title: "Lab Results Interpretation | KnowMyLabs",
  description: "View your personalized lab results interpretation",
}

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
  )
}
