"use client"

import type React from "react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ArrowLeft, Upload, FileText, Zap, CheckCircle } from "lucide-react"
import { useState, useRef } from "react"
import { useLabTest } from "@/lib/lab-test-context"

export default function UploadPage() {
  const router = useRouter()
  const { updateLabTestData } = useLabTest()
  const { toast } = useToast()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [usingSampleReport, setUsingSampleReport] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    console.log("[v0] File selected:", file.name, file.type, file.size)
    setUploadedFile(file)
    setUsingSampleReport(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleUseSampleReport = () => {
    console.log("[v0] Using sample report")
    setUsingSampleReport(true)
    setUploadedFile(null)
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setUsingSampleReport(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAnalyzeReport = async () => {
    console.log("[v0] handleAnalyzeReport called with:", { uploadedFile: uploadedFile?.name, usingSampleReport })

    if (!uploadedFile && !usingSampleReport) {
      console.log("[v0] No file selected, showing toast")
      toast({
        title: "No File Selected",
        description: "Please upload a file or use the sample report before continuing.",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Starting analysis process")
    setIsProcessing(true)

    try {
      let extractedLabs = []

      if (usingSampleReport) {
        console.log("[v0] Using sample report data")
        extractedLabs = [
          {
            id: "1",
            marker: "Total Cholesterol",
            value: 5.2,
            unit: "mmol/L",
            panel: "Lipid Panel",
            referenceRange: "< 5.2 mmol/L",
          },
          {
            id: "2",
            marker: "HDL Cholesterol",
            value: 1.6,
            unit: "mmol/L",
            panel: "Lipid Panel",
            referenceRange: "> 1.0 mmol/L",
          },
          {
            id: "3",
            marker: "LDL Cholesterol",
            value: 3.1,
            unit: "mmol/L",
            panel: "Lipid Panel",
            referenceRange: "< 3.0 mmol/L",
          },
          {
            id: "4",
            marker: "Triglycerides",
            value: 1.1,
            unit: "mmol/L",
            panel: "Lipid Panel",
            referenceRange: "< 1.7 mmol/L",
          },
          {
            id: "5",
            marker: "Glucose",
            value: 5.8,
            unit: "mmol/L",
            panel: "Basic Metabolic Panel",
            referenceRange: "3.9-6.1 mmol/L",
          },
          {
            id: "6",
            marker: "Hemoglobin A1c",
            value: 6.2,
            unit: "%",
            panel: "Diabetes Panel",
            referenceRange: "< 5.7%",
          },
        ]
      } else if (uploadedFile) {
        console.log("[v0] Calling /api/extract with file:", uploadedFile.name)
        // Call extract API for real file
        const formData = new FormData()
        formData.append("file", uploadedFile)

        const response = await fetch("/api/extract", {
          method: "POST",
          body: formData,
        })

        console.log("[v0] API response status:", response.status)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to extract lab data" }))
          console.log("[v0] API error:", errorData)
          throw new Error(errorData.error || `Server error: ${response.status}`)
        }

        const result = await response.json()
        console.log("[v0] API success result:", result)
        extractedLabs = result.labs || []

        if (!extractedLabs || extractedLabs.length === 0) {
          console.log("[v0] No labs extracted from file")
          throw new Error("No lab data could be extracted from this file. Please check the file format and try again.")
        }
      }

      console.log("[v0] Extracted labs:", extractedLabs)

      // Update context with extracted labs
      console.log("[v0] Updating context with extracted labs")
      updateLabTestData({
        extractedLabs,
        uploadedFileName: uploadedFile?.name || "Sample Report",
      })

      console.log("[v0] Navigating to review page")
      // Navigate to review page
      router.push("/review")
    } catch (error) {
      console.error("[v0] Error extracting lab data:", error)
      toast({
        title: "Extraction Failed",
        description: error instanceof Error ? error.message : "Failed to extract lab data. Please try again.",
        variant: "destructive",
      })
    } finally {
      console.log("[v0] Analysis process completed")
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Heart className="h-4 w-4" />
              </div>
              <span className="text-xl font-semibold">KnowMyLabs</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                ✓
              </div>
              <div className="h-1 w-16 bg-primary rounded"></div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                ✓
              </div>
              <div className="h-1 w-16 bg-primary rounded"></div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                3
              </div>
              <div className="h-1 w-16 bg-muted rounded"></div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold">
                4
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">Step 3 of 4: Upload your report</p>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-balance">Upload Your Lab Report</h1>
            <p className="text-muted-foreground text-pretty">
              Upload your lab results and we'll analyze them to provide clear, easy-to-understand explanations.
            </p>
          </div>

          {/* Upload Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Lab Results
              </CardTitle>
              <CardDescription>
                Drag and drop your lab report or click to browse. We support PDF and CSV file formats.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.csv"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Show uploaded file or sample report status */}
              {uploadedFile || usingSampleReport ? (
                <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center bg-green-50">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      {uploadedFile ? (
                        <>
                          <p className="text-lg font-medium text-green-800">File uploaded successfully!</p>
                          <p className="text-sm text-green-600">{uploadedFile.name}</p>
                          <p className="text-xs text-green-600">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-medium text-green-800">Sample report loaded!</p>
                          <p className="text-sm text-green-600">Demo lab results ready for analysis</p>
                        </>
                      )}
                    </div>
                    <Button onClick={handleRemoveFile} variant="outline" size="sm">
                      Remove & Upload Different File
                    </Button>
                  </div>
                </div>
              ) : (
                /* Made dropzone functional with drag and drop */
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 bg-muted/10 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={handleBrowseClick}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        {isDragging ? "Drop your file here" : "Drop your lab report here"}
                      </p>
                      <p className="text-sm text-muted-foreground">or click to browse files</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Browse Files
                    </Button>
                  </div>
                </div>
              )}

              {/* Supported Formats */}
              <div className="mt-6">
                <p className="text-sm font-medium mb-3">Supported file formats:</p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                    <FileText className="h-4 w-4 text-red-500" />
                    <span className="text-sm">PDF</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm">CSV</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Maximum file size: 10MB. For best results, ensure text is clear and readable.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security & Privacy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Your Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 text-xs font-semibold mt-0.5">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-medium">Secure Upload</p>
                  <p className="text-xs text-muted-foreground">
                    All files are encrypted during transfer and processing
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 text-xs font-semibold mt-0.5">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-medium">No Storage</p>
                  <p className="text-xs text-muted-foreground">
                    Your files are processed immediately and never stored on our servers
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 text-xs font-semibold mt-0.5">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-medium">HIPAA Compliant</p>
                  <p className="text-xs text-muted-foreground">Our processing meets healthcare privacy standards</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sample Report */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Need a Sample Report?</CardTitle>
              <CardDescription>Try our demo with a sample lab report to see how it works</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleUseSampleReport} variant="outline" size="sm">
                Use Sample Report
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This will load a demo report with sample lab values for testing purposes.
              </p>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button asChild variant="outline">
              <Link href="/panels">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Panels
              </Link>
            </Button>
            <Button
              onClick={handleAnalyzeReport}
              disabled={(!uploadedFile && !usingSampleReport) || isProcessing}
              className="bg-primary hover:bg-primary/90"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Extracting...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Analyze Report
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Upload your lab report or use our sample data to see personalized insights.
          </p>
        </div>
      </footer>
    </div>
  )
}
