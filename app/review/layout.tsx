import React from "react"

export const metadata = {
  title: "Review Lab Results | KnowMyLabs",
  description: "Review and edit your extracted lab results",
}

export default function ReviewLayout({
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
