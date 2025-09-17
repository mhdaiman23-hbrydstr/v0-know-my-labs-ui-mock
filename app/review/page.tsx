"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLabTest } from "@/lib/lab-test-context"

export default function ReviewPage() {
  const router = useRouter()
  const { extractedLabs } = useLabTest()

  // Debug output
  useEffect(() => {
    console.log("Review page loaded. Extracted labs:", extractedLabs)
  }, [extractedLabs])

  // Check if we have lab data
  useEffect(() => {
    if (!extractedLabs || extractedLabs.length === 0) {
      console.log("No lab data found, redirecting to upload")
      router.push("/upload")
    }
  }, [extractedLabs, router])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Review Lab Results</h1>
      
      {!extractedLabs || extractedLabs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">No lab data available. Please upload a lab report.</p>
        </div>
      ) : (
        <div>
          <p className="mb-4">Found {extractedLabs.length} lab markers.</p>
          
          <div className="overflow-x-auto">
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
                {extractedLabs.map((lab, index) => (
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
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => router.push("/results")}
            >
              Continue to Results
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
