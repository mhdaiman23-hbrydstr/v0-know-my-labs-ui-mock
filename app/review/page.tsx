"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLabTest } from "@/lib/lab-test-context"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function ReviewPage() {
  const router = useRouter()
  const { extractedLabs, setReviewedLabs } = useLabTest()
  
  useEffect(() => {
    if (!extractedLabs || extractedLabs.length === 0) {
      // No lab data, redirect to upload
      router.push("/upload")
    }
  }, [extractedLabs, router])
  
  const handleContinue = () => {
    // Save the reviewed labs to context
    setReviewedLabs(extractedLabs)
    // Navigate to results page
    router.push("/results")
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Review Lab Results</h1>
      
      {extractedLabs && extractedLabs.length > 0 ? (
        <>
          <p className="mb-4">Found {extractedLabs.length} lab markers.</p>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Extracted Lab Markers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>SI Value</TableHead>
                    <TableHead>Reference Range</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extractedLabs.map((marker, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium">{marker.name}</div>
                        <div className="text-sm text-muted-foreground">{marker.code}</div>
                      </TableCell>
                      <TableCell>{marker.value} {marker.unit}</TableCell>
                      <TableCell>{marker.value_si} {marker.unit_si}</TableCell>
                      <TableCell>
                        {marker.ref_range_low && marker.ref_range_high 
                          ? `${marker.ref_range_low} - ${marker.ref_range_high}`
                          : marker.ref_range_low 
                            ? `> ${marker.ref_range_low}`
                            : marker.ref_range_high 
                              ? `< ${marker.ref_range_high}`
                              : 'Not available'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="flex justify-between mt-6">
            <Button variant="outline" asChild>
              <Link href="/upload">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Upload
              </Link>
            </Button>
            <Button onClick={handleContinue}>
              Continue to Results
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No lab results to review.</p>
          <Button asChild>
            <Link href="/upload">Go to Upload</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
