import React from "react"

export const metadata = {
  title: "Analyzing Results | KnowMyLabs",
  description: "Processing your lab results",
}

export default function ProcessingLayout({
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
