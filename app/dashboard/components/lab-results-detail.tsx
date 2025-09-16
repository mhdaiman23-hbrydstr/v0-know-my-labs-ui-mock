"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, FileTextIcon, UserIcon } from "lucide-react"

interface LabSet {
  id: string
  user_id: string
  source: string
  demographics: {
    age?: string
    sex?: string
    height?: string
    weight?: string
    fasting_status?: string
  }
  panel_selection: string[]
  collected_at: string
  created_at: string
}

interface LabResult {
  id: string
  set_id: string
  panel: string
  code: string
  name: string
  value_raw: number
  unit_raw: string
  value_si: number | null
  unit_si: string
}

interface Interpretation {
  id: string
  set_id: string
  summary: string
  flags: Array<{
    marker: string
    status: string
    message: string
  }>
  considerations: Array<{
    category: string
    items: string[]
  }>
  lifestyle: Array<{
    category: string
    recommendations: string[]
  }>
  questions: string[]
  safety_notice: string | null
  model: string
  created_at: string
}

interface LabResultsDetailProps {
  labSetId: string
}

export function LabResultsDetail({ labSetId }: LabResultsDetailProps) {
  const [labSet, setLabSet] = useState<LabSet | null>(null)
  const [labResults, setLabResults] = useState<LabResult[]>([])
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLabData() {
      try {
        const supabase = createClient()

        // Fetch lab set
        const { data: labSetData, error: labSetError } = await supabase
          .from("lab_sets")
          .select("*")
          .eq("id", labSetId)
          .single()

        if (labSetError) throw labSetError

        // Fetch lab results
        const { data: labResultsData, error: labResultsError } = await supabase
          .from("lab_results")
          .select("*")
          .eq("set_id", labSetId)
          .order("panel", { ascending: true })
          .order("name", { ascending: true })

        if (labResultsError) throw labResultsError

        // Fetch interpretation
        const { data: interpretationData, error: interpretationError } = await supabase
          .from("interpretations")
          .select("*")
          .eq("set_id", labSetId)
          .single()

        if (interpretationError && interpretationError.code !== "PGRST116") {
          throw interpretationError
        }

        setLabSet(labSetData)
        setLabResults(labResultsData || [])
        setInterpretation(interpretationData)
      } catch (err) {
        console.error("Error fetching lab data:", err)
        setError(err instanceof Error ? err.message : "Failed to load lab data")
      } finally {
        setLoading(false)
      }
    }

    fetchLabData()
  }, [labSetId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error loading lab results: {error}</AlertDescription>
      </Alert>
    )
  }

  if (!labSet) {
    return (
      <Alert>
        <AlertDescription>Lab set not found.</AlertDescription>
      </Alert>
    )
  }

  // Group results by panel
  const groupedResults = labResults.reduce(
    (acc, result) => {
      if (!acc[result.panel]) {
        acc[result.panel] = []
      }
      acc[result.panel].push(result)
      return acc
    },
    {} as Record<string, LabResult[]>,
  )

  const panels = Object.keys(groupedResults)

  // Helper function to determine if a value is abnormal
  const getValueStatus = (result: LabResult) => {
    // This is a simplified example - in a real app, you'd have reference ranges
    // For now, we'll use some basic heuristics
    const value = result.value_raw
    const name = result.name.toLowerCase()

    if (name.includes("cholesterol") && result.unit_raw === "mg/dL") {
      if (name.includes("total") && value > 200) return "high"
      if (name.includes("ldl") && value > 100) return "high"
      if (name.includes("hdl") && value < 40) return "low"
    }

    if (name.includes("glucose") && result.unit_raw === "mg/dL") {
      if (value > 100) return "high"
      if (value < 70) return "low"
    }

    return "normal"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high":
        return "text-red-600 bg-red-50"
      case "low":
        return "text-blue-600 bg-blue-50"
      default:
        return "text-green-600 bg-green-50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Patient Info Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium ml-2">Patient Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              {labSet.demographics.age && <div>Age: {labSet.demographics.age}</div>}
              {labSet.demographics.sex && <div>Sex: {labSet.demographics.sex}</div>}
              {labSet.demographics.height && <div>Height: {labSet.demographics.height}</div>}
              {labSet.demographics.weight && <div>Weight: {labSet.demographics.weight}</div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium ml-2">Collection Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(labSet.collected_at).toLocaleDateString()}</div>
            <div className="text-sm text-muted-foreground">
              {labSet.demographics.fasting_status && `${labSet.demographics.fasting_status} status`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium ml-2">Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{labSet.source}</div>
            <div className="text-sm text-muted-foreground">{labResults.length} test results</div>
          </CardContent>
        </Card>
      </div>

      {/* Lab Results Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Lab Results</CardTitle>
          <CardDescription>
            Results grouped by panel. Values are color-coded based on typical reference ranges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {panels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No lab results found.</div>
          ) : (
            <Tabs defaultValue={panels[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {panels.map((panel) => (
                  <TabsTrigger key={panel} value={panel} className="capitalize">
                    {panel} ({groupedResults[panel].length})
                  </TabsTrigger>
                ))}
              </TabsList>

              {panels.map((panel) => (
                <TabsContent key={panel} value={panel} className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>SI Value</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedResults[panel].map((result) => {
                        const status = getValueStatus(result)
                        return (
                          <TableRow key={result.id}>
                            <TableCell className="font-medium">{result.name}</TableCell>
                            <TableCell className="text-muted-foreground">{result.code}</TableCell>
                            <TableCell>
                              <span className={getStatusColor(status) + " px-2 py-1 rounded text-sm"}>
                                {result.value_raw} {result.unit_raw}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {result.value_si !== null && result.unit_si !== result.unit_raw && (
                                <span>
                                  {result.value_si.toFixed(2)} {result.unit_si}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={status === "normal" ? "secondary" : "destructive"} className="capitalize">
                                {status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* AI Interpretation */}
      {interpretation && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis Summary</CardTitle>
              <CardDescription>
                Generated by {interpretation.model} on {new Date(interpretation.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{interpretation.summary}</p>
            </CardContent>
          </Card>

          {interpretation.flags && interpretation.flags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Flagged Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {interpretation.flags.map((flag, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Badge variant="destructive">{flag.status}</Badge>
                      <div>
                        <div className="font-medium">{flag.marker}</div>
                        <div className="text-sm text-muted-foreground">{flag.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {interpretation.lifestyle && interpretation.lifestyle.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Lifestyle Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interpretation.lifestyle.map((category, index) => (
                    <div key={index}>
                      <h4 className="font-medium mb-2 capitalize">{category.category}</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {category.recommendations.map((rec, recIndex) => (
                          <li key={recIndex}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {interpretation.questions && interpretation.questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Questions for Your Doctor</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  {interpretation.questions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {interpretation.safety_notice && (
            <Alert>
              <AlertDescription>
                <strong>Important:</strong> {interpretation.safety_notice}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}
