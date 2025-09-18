"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { FileUp, FileText, AlertCircle, FileType2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useLabTest } from "@/lib/lab-test-context"

export default function LabReportUpload() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [fileError, setFileError] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [consentToResearch, setConsentToResearch] = useState(true)

  const { setExtractedLabs } = useLabTest()

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("")

    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      validateAndSetFile(selectedFile)
    }
  }

  // Validate file type and set file
  const validateAndSetFile = (selectedFile: File) => {
    if (
      selectedFile.type === "application/pdf" ||
      selectedFile.type === "text/csv" ||
      selectedFile.type.startsWith("image/")
    ) {
      setFile(selectedFile)
    } else {
      setFileError("Please upload a PDF, CSV, or image file.")
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setFileError("")

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  // Trigger file input click
  const handleSelectFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // FIXED: Process the uploaded file with actual PDF extraction
  const processFile = async () => {
    if (!file) {
      setFileError("Please select a file to upload.")
      return
    }

    setLoading(true)
    console.log(`Processing file: ${file.name} (${file.type})`)

    try {
      // IMPORTANT: Send the file directly to extract-text endpoint
      const formData = new FormData()
      formData.append("file", file) // Send the actual file
      formData.append("consentToResearch", consentToResearch.toString())

      console.log("Sending file to server for extraction...")

      // CRITICAL CHANGE: Use extract-text endpoint, not llm-extract
      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = "Failed to process file"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (jsonError) {
          // If response is not JSON, try to get text content
          try {
            const errorText = await response.text()
            errorMessage = errorText || `Server error: ${response.status}`
          } catch (textError) {
            errorMessage = `Server error: ${response.status} ${response.statusText}`
          }
        }
        throw new Error(errorMessage)
      }

      let result
      try {
        result = await response.json()
      } catch (jsonError) {
        console.error("Error parsing response JSON:", jsonError)
        throw new Error("Server returned invalid response format")
      }

      console.log(`Server response:`, result)
      console.log(`Successfully extracted ${result.markers?.length || 0} lab markers`)

      // Use markers from extract-text response
      if (result.markers && result.markers.length > 0) {
        setExtractedLabs(result.markers)

        toast({
          title: "Success!",
          description: `Extracted ${result.markers.length} lab results from your report.`,
        })

        router.push("/results")
      } else {
        toast({
          title: "No Lab Results Found",
          description: "We couldn't find any lab results in this file. Please try a different file.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error processing file:", error)

      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto pt-12 pb-20 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Upload Your Lab Report</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Securely upload your medical lab results for instant analysis and insights
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">🔒 Your Data is Safe & Private</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  All personal information is automatically removed before processing. Your privacy is our priority.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="p-8 mb-8 border-t-4 border-t-blue-500 shadow-lg">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors
              ${dragActive ? "border-blue-500 bg-blue-50" : "border-border"}
              ${fileError ? "border-red-500 bg-red-50" : ""}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.csv,.jpg,.jpeg,.png"
              className="hidden"
            />

            {file ? (
              // File selected state
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <FileText size={32} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{file.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{(file.size / 1024).toFixed(2)} KB</p>
                <div className="flex space-x-3">
                  <Button size="sm" variant="outline" onClick={() => setFile(null)}>
                    Change File
                  </Button>
                  <Button size="sm" onClick={processFile} disabled={loading}>
                    {loading ? "Processing..." : "Analyze Report"}
                  </Button>
                </div>
              </div>
            ) : (
              // No file selected state
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <FileType2 size={40} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-xl mb-2">
                  {fileError ? "Invalid File" : "Drop your lab report here"}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  {fileError ? (
                    <span className="flex items-center text-red-600">
                      <AlertCircle size={16} className="mr-1" />
                      {fileError}
                    </span>
                  ) : (
                    "Upload your PDF lab report to extract and analyze your results securely"
                  )}
                </p>
                <Button onClick={handleSelectFileClick} variant={fileError ? "default" : "outline"}>
                  <FileUp size={18} className="mr-2" />
                  Select File
                </Button>
              </div>
            )}
          </div>

          {/* Supported File Types */}
          <div className="text-center text-muted-foreground text-sm bg-muted p-3 rounded-md">
            <p className="font-medium">Accepted: PDF or CSV files</p>
            <p>Maximum file size: 10MB</p>
          </div>

          {/* Research Consent */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="research-consent"
                checked={consentToResearch}
                onCheckedChange={(checked) => setConsentToResearch(checked === true)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <label htmlFor="research-consent" className="text-sm font-medium leading-none cursor-pointer">
                  Help improve healthcare analytics (Optional)
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Allow us to use your anonymized lab data to improve our analysis algorithms. All personal information
                  is removed before any research use.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* How It Works */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileUp size={24} className="text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">1. Upload</h3>
            <p className="text-sm text-muted-foreground">Upload your PDF lab report securely</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">2. Analyze</h3>
            <p className="text-sm text-muted-foreground">AI extracts and interprets your results</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">3. Understand</h3>
            <p className="text-sm text-muted-foreground">Get insights and track your health trends</p>
          </div>
        </div>
      </div>
    </div>
  )
}
