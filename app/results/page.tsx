"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useLabTest } from "@/lib/lab-test-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

// This is a simplified mockup of what an interpretation might look like
const mockInterpretation = {
  summary: "Your lab results show generally healthy values across most markers. Your complete blood count (CBC) and liver function tests are within normal ranges. Your calcium level is slightly elevated but not at a concerning level.",
  flags: [
    {
      severity: "low",
      lab_code: "CA",
      lab_name: "Calcium",
      finding: "Slightly elevated calcium level",
      description: "Your calcium level is marginally above the reference range. This can be normal for some individuals or may be due to dietary factors."
    }
  ],
  lifestyle: [
    {
      type: "diet",
      recommendation: "Maintain a balanced diet with adequate hydration",
      evidence: "Based on your calcium levels being slightly elevated"
    },
    {
      type: "exercise",
      recommendation: "Regular physical activity is recommended for overall health",
      evidence: "Based on your healthy blood count values"
    }
  ],
  doctor_questions: [
    "Ask your doctor if follow-up testing is needed for your calcium levels",
    "Discuss whether any changes to your diet might be beneficial",
    "Consider reviewing any supplements you may be taking that contain calcium"
  ]
};

export default function ResultsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { extractedLabs, reviewedLabs, demographics, setInterpretation } = useLabTest()
  const [loading, setLoading] = useState(false)
  const [interpretation, setLocalInterpretation] = useState<any>(null)

  // If no labs data, redirect to upload
  useEffect(() => {
    console.log("Results page - Labs data check:", { 
      extractedLabs: extractedLabs?.length, 
      reviewedLabs: reviewedLabs?.length 
    })
    
    if ((!extractedLabs || extractedLabs.length === 0) && 
        (!reviewedLabs || reviewedLabs.length === 0)) {
      console.log("No lab data found, redirecting to upload")
      router.push("/upload")
    } else {
      // Use mock interpretation for now
      // In a real implementation, this would call your /api/interpret endpoint
      setLocalInterpretation(mockInterpretation)
      setInterpretation(mockInterpretation)
    }
  }, [extractedLabs, reviewedLabs, router, setInterpretation])

  // Function to save results
  const saveResults = async () => {
    setLoading(true)
    
    try {
      // This would call your /api/save endpoint in a real implementation
      // For now, just show a success message
      toast({
        title: "Results saved",
        description: "Your lab results have been saved successfully.",
      })
      
      // Navigate to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving results:", error)
      toast({
        title: "Error",
        description: "Failed to save your results. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600 bg-red-50 border-red-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-blue-600 bg-blue-50 border-blue-200";
      case "normal": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // If we're loading interpretation
  if (!interpretation) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Analyzing your results...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Lab Results Interpretation</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/review")}>
            Back to Review
          </Button>
          <Button onClick={saveResults} disabled={loading}>
            {loading ? "Saving..." : "Save Results"}
          </Button>
        </div>
      </div>

      {/* Summary */}
      <Card className="mb-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <p className="text-gray-700">{interpretation.summary}</p>
      </Card>

      {/* Flags */}
      {interpretation.flags && interpretation.flags.length > 0 && (
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Flagged Results</h2>
          <div className="space-y-4">
            {interpretation.flags.map((flag: any, index: number) => (
              <div 
                key={index} 
                className={`p-4 rounded-md border ${getSeverityColor(flag.severity)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold">{flag.lab_name} ({flag.lab_code})</div>
                  <div className="capitalize font-medium">
                    {flag.severity}
                  </div>
                </div>
                <div className="mb-2 font-medium">{flag.finding}</div>
                <div className="text-sm">{flag.description}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Lifestyle Recommendations */}
      {interpretation.lifestyle && interpretation.lifestyle.length > 0 && (
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Lifestyle Recommendations</h2>
          <div className="space-y-4">
            {interpretation.lifestyle.map((item: any, index: number) => (
              <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center mb-2">
                  <span className="capitalize font-medium mr-2">{item.type}:</span>
                  <span className="font-semibold">{item.recommendation}</span>
                </div>
                <div className="text-sm text-gray-600">{item.evidence}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Questions for Doctor */}
      {interpretation.doctor_questions && interpretation.doctor_questions.length > 0 && (
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Questions to Ask Your Doctor</h2>
          <ul className="list-disc pl-6 space-y-2">
            {interpretation.doctor_questions.map((question: string, index: number) => (
              <li key={index} className="text-gray-700">{question}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* All Lab Results */}
      <Card className="mb-8 p-6">
        <h2 className="text-xl font-semibold mb-4">All Lab Results</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SI Value
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference Range
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(reviewedLabs || extractedLabs || []).map((lab, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{lab.name}</div>
                    <div className="text-sm text-gray-500">{lab.code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lab.value} {lab.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lab.value_si} {lab.unit_si}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
      </Card>

      {/* Disclaimer */}
      <div className="text-sm text-gray-500 mt-8">
        <p className="mb-2">
          <strong>Disclaimer:</strong> This interpretation is for informational purposes only and does not constitute medical advice.
        </p>
        <p>
          Always consult with a healthcare professional regarding your lab results and before making any changes to your healthcare regimen.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => router.push("/review")}>
          Back to Review
        </Button>
        <Button onClick={saveResults} disabled={loading}>
          {loading ? "Saving..." : "Save Results"}
        </Button>
      </div>
    </div>
  )
}
