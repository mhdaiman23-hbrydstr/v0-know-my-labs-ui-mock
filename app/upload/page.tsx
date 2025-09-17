"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { FileUp, FileText, AlertCircle, FileType2 } from "lucide-react"

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

  // Process the uploaded file
  const processFile = async () => {
    if (!file) {
      setFileError("Please select a file to upload.")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      console.log("Sending file to API:", file.name, file.type, file.size)

      // Extract text from the file
      const extractResponse = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      })

      // Handle error responses
      if (!extractResponse.ok) {
        const errorText = await extractResponse.text()
        console.error("API error response:", errorText)
        throw new Error(`API returned ${extractResponse.status}: ${errorText}`)
      }

      // Try to parse response as JSON
      let extractData
      try {
        const responseText = await extractResponse.text()
        console.log("API response text:", responseText.substring(0, 100) + "...")
        extractData = JSON.parse(responseText)
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        throw new Error("Failed to parse API response as JSON")
      }

      console.log("API response parsed successfully:", extractData)

      // Check if labs were returned
      if (!extractData.labs || !Array.isArray(extractData.labs)) {
        console.error("Invalid data format:", extractData)
        throw new Error("API did not return valid lab data")
      }

      console.log("Found", extractData.labs.length, "lab markers")

      // Set the extracted labs in context
      setExtractedLabs(extractData.labs)

      // Navigate to the review page
      console.log("Navigating to /review")
      router.push("/review")
    } catch (error) {
      console.error("Error processing file:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process the file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="w-64 h-20 relative mb-4">
          <div className="w-full h-full flex items-center justify-center">
            <div className="font-bold text-3xl">
              <span className="text-blue-600">Know</span>
              <span className="text-blue-800">MyLabs</span>
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Upload your lab report</h1>
        <p className="text-muted-foreground max-w-lg">
          We read your file in memory, redact identifiers, and only keep structured values. Your privacy is our
          priority.
        </p>
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
          <p className="font-medium">Accepted: PDF or CSV. Images (OCR) coming soon.</p>
          <p className="mt-1">For best results, use a PDF from your healthcare provider.</p>
        </div>
      </Card>

      {/* Privacy Callout */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-100 mb-8 shadow-sm">
        <h3 className="font-semibold text-lg mb-2 text-blue-700">🔒 Privacy First</h3>
        <p className="text-foreground mb-2">
          Your privacy is our priority. We process your lab report entirely in memory—no data is stored.
        </p>
        <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
          <li>Files are processed in your browser memory only</li>
          <li>All identifiers are redacted before analysis</li>
          <li>We only store structured lab values, not your original document</li>
          <li>You control what information is saved</li>
        </ul>
      </div>

      {/* How It Works Section */}
      <div className="bg-card rounded-lg p-6 border shadow-sm">
        <h3 className="font-semibold text-lg mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center text-center p-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <FileUp size={24} className="text-blue-600" />
            </div>
            <h4 className="font-medium mb-1">Upload</h4>
            <p className="text-sm text-muted-foreground">Securely upload your lab report PDF</p>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <FileType2 size={24} className="text-blue-600" />
            </div>
            <h4 className="font-medium mb-1">Extract</h4>
            <p className="text-sm text-muted-foreground">We extract and normalize your lab values</p>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600"
              >
                <path d="M2 9h18v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9Z"></path>
                <path d="M2 3h18a2 2 0 0 1 2 2v4H2V5a2 2 0 0 1 2-2Z"></path>
                <path d="M10 16h4"></path>
              </svg>
            </div>
            <h4 className="font-medium mb-1">Analyze</h4>
            <p className="text-sm text-muted-foreground">Get insights about your health</p>
          </div>
        </div>
      </div>
    </div>
  )
}
