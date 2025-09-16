"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, RotateCcw, Upload, ArrowRight, AlertTriangle } from "lucide-react"
import { useLabTest } from "@/lib/lab-test-context"
import { useToast } from "@/hooks/use-toast"
import { toSI, formatValue } from "@/lib/units"

interface LabMarker {
  id: string
  marker: string
  value: number | string
  unit: string
  panel: string
  referenceRange?: string
  value_si?: number | string
  unit_si?: string
  value_raw?: number | string
  unit_raw?: string
  confidence?: number
}

export default function ReviewPage() {
  const router = useRouter()
  const { labTestData, updateLabTestData } = useLabTest()
  const { toast } = useToast()
  const [labs, setLabs] = useState<LabMarker[]>([])
  const [originalLabs, setOriginalLabs] = useState<LabMarker[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [demographics, setDemographics] = useState({
    age: labTestData.age || "",
    sex: labTestData.sex || "",
    ethnicity: labTestData.ethnicity || "",
    fastingStatus: labTestData.fastingStatus || "",
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    // Get extracted labs from context or redirect if none
    if (labTestData.extractedLabs && labTestData.extractedLabs.length > 0) {
      setLabs(labTestData.extractedLabs)
      setOriginalLabs(labTestData.extractedLabs)
    } else {
      // Defer the redirect to avoid state update warnings
      const timer = setTimeout(() => {
        router.push("/upload")
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [labTestData.extractedLabs, router, isMounted])

  const handleValueChange = (id: string, field: keyof LabMarker, value: string | number) => {
    setLabs((prev) =>
      prev.map((lab) => {
        if (lab.id !== id) return lab

        const updatedLab = { ...lab, [field]: value }

        // If changing the raw value or unit, automatically convert to SI
        if (field === "value" || field === "unit") {
          const numValue = typeof value === "string" ? Number.parseFloat(value) : value
          const unit = field === "unit" ? String(value) : String(lab.unit)

          if (!isNaN(numValue) && unit && lab.marker) {
            const siConversion = toSI(lab.marker, numValue, unit)
            if (siConversion.value !== null) {
              updatedLab.value_si = siConversion.value
              updatedLab.unit_si = siConversion.unit
            }
          }
        }

        return updatedLab
      }),
    )
  }

  const handleDemographicChange = (field: string, value: string) => {
    setDemographics((prev) => ({ ...prev, [field]: value }))
    updateLabTestData({ [field]: value })
  }

  const validateData = () => {
    if (labs.length === 0) {
      toast({
        title: "No Lab Data",
        description: "Please add at least one lab marker before continuing.",
        variant: "destructive",
      })
      return false
    }

    if (!demographics.age || !demographics.sex) {
      toast({
        title: "Missing Demographics",
        description: "Please provide age and sex before continuing.",
        variant: "destructive",
      })
      return false
    }

    const emptyMarkers = labs.filter((lab) => !lab.marker || lab.marker.trim() === "")
    if (emptyMarkers.length > 0) {
      toast({
        title: "Missing Marker Names",
        description: "Please fill in all marker names before continuing.",
        variant: "destructive",
      })
      return false
    }

    const invalidValues = labs.filter((lab) => {
      const value = lab.value_si || lab.value
      return !value || isNaN(Number.parseFloat(String(value)))
    })
    if (invalidValues.length > 0) {
      toast({
        title: "Invalid Values",
        description: "Please ensure all lab values are valid numbers.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const groupedLabs = labs.reduce(
    (acc, lab) => {
      const panel = lab.panel || "General"
      if (!acc[panel]) acc[panel] = []
      acc[panel].push(lab)
      return acc
    },
    {} as Record<string, LabMarker[]>,
  )

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "secondary"
    if (confidence >= 0.9) return "default"
    if (confidence >= 0.7) return "secondary"
    return "destructive"
  }

  const addNewRow = () => {
    const newId = Date.now().toString()
    const newLab: LabMarker = {
      id: newId,
      marker: "",
      value: "",
      unit: "",
      panel: "",
      referenceRange: "",
      value_si: "",
      unit_si: "",
      value_raw: "",
      unit_raw: "",
    }
    setLabs((prev) => [...prev, newLab])
  }

  const deleteRow = (id: string) => {
    setLabs((prev) => prev.filter((lab) => lab.id !== id))
  }

  const resetToExtracted = () => {
    setLabs(originalLabs)
  }

  const handleBackToUpload = () => {
    router.push("/upload")
  }

  const handleContinueToAnalysis = async () => {
    if (!validateData()) return

    setIsLoading(true)

    try {
      console.log("[v0] Starting lab analysis with data:", { labTestData, labs, demographics })

      updateLabTestData({
        reviewedLabs: labs,
        ...demographics,
      })

      const payload = {
        demographics: {
          sex:
            demographics.sex?.toLowerCase() === "male"
              ? "male"
              : demographics.sex?.toLowerCase() === "female"
                ? "female"
                : "unspecified",
          ageYears: Number.parseInt(demographics.age) || 30,
          ethnicity: demographics.ethnicity || undefined,
          units: "SI" as const,
          fasting: demographics.fastingStatus === "fasting",
          testDate: new Date().toISOString().split("T")[0],
        },
        context: {
          conditions: labTestData.medicalConditions || [],
          medications: labTestData.medications || [],
          lifestyle: labTestData.lifestyle
            ? Object.entries(labTestData.lifestyle).map(([key, value]) => `${key}: ${value}`)
            : [],
        },
        labs: labs
          .map((lab, index) => ({
            panel: lab.panel || "General",
            code: lab.id || `LAB_${index}`,
            name: lab.marker,
            value_si: Number.parseFloat(String(lab.value_si || lab.value)) || 0,
            unit_si: String(lab.unit_si || lab.unit),
          }))
          .filter((lab) => lab.name && !isNaN(lab.value_si)),
      }

      console.log("[v0] Sending payload to API:", payload)

      const response = await fetch("/api/interpret", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error occurred" }))
        console.log("[v0] API error response:", errorData)
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] API success response:", result)

      updateLabTestData({ interpretationResults: result })

      // Navigate to results
      router.push("/results")
    } catch (error) {
      console.error("Error interpreting labs:", error)
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze lab results. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (labs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Lab Data Found</h3>
              <p className="text-muted-foreground mb-4">Please upload a lab report first.</p>
              <Button onClick={() => router.push("/upload")}>Go to Upload</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Review Your Lab Results</h1>
            <p className="text-muted-foreground">Please check your values and provide demographics before analysis.</p>
          </div>

          {/* Warning Banner */}
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-amber-800">
              <strong>Please review all values carefully.</strong> Values are automatically converted to SI units for
              analysis. Confidence scores indicate extraction accuracy.
            </AlertDescription>
          </Alert>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Age in years"
                    value={demographics.age}
                    onChange={(e) => handleDemographicChange("age", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sex">Sex *</Label>
                  <Select value={demographics.sex} onValueChange={(value) => handleDemographicChange("sex", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ethnicity">Ethnicity</Label>
                  <Input
                    id="ethnicity"
                    placeholder="Optional"
                    value={demographics.ethnicity}
                    onChange={(e) => handleDemographicChange("ethnicity", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fasting">Fasting Status</Label>
                  <Select
                    value={demographics.fastingStatus}
                    onValueChange={(value) => handleDemographicChange("fastingStatus", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fasting">Fasting</SelectItem>
                      <SelectItem value="non-fasting">Non-fasting</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Extracted Lab Markers</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToExtracted}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to Extracted
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addNewRow}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  Add Row
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={Object.keys(groupedLabs)[0]} className="w-full">
                <TabsList className="grid w-full grid-cols-auto">
                  {Object.keys(groupedLabs).map((panel) => (
                    <TabsTrigger key={panel} value={panel}>
                      {panel} ({groupedLabs[panel].length})
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(groupedLabs).map(([panel, panelLabs]) => (
                  <TabsContent key={panel} value={panel}>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Marker Name</TableHead>
                            <TableHead>Value (Raw)</TableHead>
                            <TableHead>Unit (Raw)</TableHead>
                            <TableHead>Value (SI)</TableHead>
                            <TableHead>Unit (SI)</TableHead>
                            <TableHead>Confidence</TableHead>
                            <TableHead>Reference Range</TableHead>
                            <TableHead className="w-[50px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {panelLabs.map((lab) => (
                            <TableRow key={lab.id}>
                              <TableCell>
                                <Input
                                  value={lab.marker}
                                  onChange={(e) => handleValueChange(lab.id, "marker", e.target.value)}
                                  placeholder="Marker name"
                                  className="min-w-[150px]"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={lab.value}
                                  onChange={(e) => handleValueChange(lab.id, "value", e.target.value)}
                                  placeholder="Value"
                                  className="min-w-[80px]"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={lab.unit}
                                  onChange={(e) => handleValueChange(lab.id, "unit", e.target.value)}
                                  placeholder="Unit"
                                  className="min-w-[80px]"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground">
                                  {lab.value_si ? formatValue(Number(lab.value_si), String(lab.unit_si)) : "—"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground">{lab.unit_si || "—"}</div>
                              </TableCell>
                              <TableCell>
                                {lab.confidence && (
                                  <Badge variant={getConfidenceColor(lab.confidence)}>
                                    {Math.round(lab.confidence * 100)}%
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={lab.referenceRange || ""}
                                  onChange={(e) => handleValueChange(lab.id, "referenceRange", e.target.value)}
                                  placeholder="Reference range"
                                  className="min-w-[120px]"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteRow(lab.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBackToUpload} className="flex items-center gap-2 bg-transparent">
              <Upload className="h-4 w-4" />
              Back to Upload
            </Button>

            <Button
              onClick={handleContinueToAnalysis}
              disabled={isLoading || labs.length === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  Continue to Analysis
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
