"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useLabTest } from "@/lib/lab-test-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function ReviewPage() {
  const router = useRouter()
  const { extractedLabs, reviewedLabs, setReviewedLabs } = useLabTest()
  const [loading, setLoading] = useState(false)

  // Debug output
  useEffect(() => {
    console.log("Review page loaded. Extracted labs:", extractedLabs)
  }, [extractedLabs])

  // Check if we have lab data
  useEffect(() => {
    if (!extractedLabs || extractedLabs.length === 0) {
      console.log("No lab data found, redirecting to upload")
      router.push("/upload")
    } else if (!reviewedLabs || reviewedLabs.length === 0) {
      // If we have extracted labs but no reviewed labs, initialize reviewed labs
      setReviewedLabs(extractedLabs)
    }
  }, [extractedLabs, reviewedLabs, router, setReviewedLabs])

  // Go to processing page
  const proceedToProcessing = () => {
    setLoading(true)
    router.push("/processing")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Review Lab Results</h1>
        
        {!reviewedLabs || reviewedLabs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No lab data available. Please upload a lab report.</p>
          </div>
        ) : (
          <div>
            <p className="mb-4">Found {reviewedLabs.length} lab markers.</p>
            
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Test</th>
                    <th className="px-4 py-2 text-left">Value</th>
                    <th className="px-4 py-2 text-left">SI Value</th>
                    <th className="px-4 py-2 text-left">Reference Range</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewedLabs.map((lab, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="px-4 py-2">
                        <div className="font-medium">{lab.name}</div>
                        <div className="text-sm text-gray-500">{lab.code}</div>
                      </td>
                      <td className="px-4 py-2">
                        {lab.value} {lab.unit}
                      </td>
                      <td className="px-4 py-2">
                        {lab.value_si} {lab.unit_si}
                      </td>
                      <td className="px-4 py-2">
                        {lab.ref_range_low && lab.ref_range_high ? (
                          <span>{lab.ref_range_low} - {lab.ref_range_high}</span>
                        ) : lab.ref_range_low ? (
                          <span>&gt; {lab.ref_range_low}</span>
                        ) : lab.ref_range_high ? (
                          <span>&lt; {lab.ref_range_high}</span>
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={proceedToProcessing}
                disabled={loading}
              >
                {loading ? "Processing..." : "Continue to Results"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
