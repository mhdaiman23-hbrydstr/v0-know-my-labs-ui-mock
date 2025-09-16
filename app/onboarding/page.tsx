"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, ArrowLeft, ArrowRight, User, LogOut, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useLabTest } from "@/lib/lab-test-context"
import { useRouter } from "next/navigation"
import { useState } from "react"

const ethnicityOptions = [
  "White/Caucasian",
  "Black/African American",
  "Hispanic/Latino",
  "Asian",
  "Native American/Alaska Native",
  "Native Hawaiian/Pacific Islander",
  "Middle Eastern/North African",
  "Mixed/Multiracial",
  "Other",
  "Prefer not to say",
]

const commonMedicalConditions = [
  "Diabetes Type 1",
  "Diabetes Type 2",
  "Hypertension",
  "High Cholesterol",
  "Heart Disease",
  "Asthma",
  "COPD",
  "Arthritis",
  "Osteoporosis",
  "Thyroid Disorder",
  "Depression",
  "Anxiety",
  "Kidney Disease",
  "Liver Disease",
  "Cancer",
  "Autoimmune Disorder",
  "Sleep Apnea",
  "Allergies",
  "Migraine",
  "Other",
]

export default function OnboardingPage() {
  const { isAuthenticated, logout } = useAuth()
  const { labTestData, updateLabTestData } = useLabTest()
  const router = useRouter()

  const [medicalConditions, setMedicalConditions] = useState<string[]>(labTestData.medicalConditions || [])
  const [medications, setMedications] = useState<string[]>(labTestData.medications || [])
  const [newMedication, setNewMedication] = useState("")
  const [newCondition, setNewCondition] = useState("")
  const [measurementSystem, setMeasurementSystem] = useState(labTestData.units === "Metric" ? "metric" : "imperial")

  const [formData, setFormData] = useState({
    age: labTestData.age || "",
    sex: labTestData.sex || "",
    ethnicity: labTestData.ethnicity || "",
    height: labTestData.height || "",
    weight: labTestData.weight || "",
    lifestyle: {
      exercise: labTestData.lifestyle.exercise || "",
      diet: labTestData.lifestyle.diet || "",
      smoking: labTestData.lifestyle.smoking || "",
      alcohol: labTestData.lifestyle.alcohol || "",
      sleep: labTestData.lifestyle.sleep || "",
      stress: labTestData.lifestyle.stress || "",
    },
    fastingStatus: labTestData.fastingStatus || "",
    testDate: labTestData.testDate || new Date().toISOString().split("T")[0],
    units: labTestData.units || "",
    referenceSet: labTestData.referenceSet || "",
  })

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleInputChange = (field: string, value: string) => {
    let updatedFormData
    if (field.startsWith("lifestyle.")) {
      const lifestyleField = field.split(".")[1]
      updatedFormData = {
        ...formData,
        lifestyle: {
          ...formData.lifestyle,
          [lifestyleField]: value,
        },
      }
    } else {
      updatedFormData = {
        ...formData,
        [field]: value,
      }
    }

    setFormData(updatedFormData)
    updateLabTestData({
      ...updatedFormData,
      medicalConditions,
      medications,
    })
  }

  const handleMeasurementSystemChange = (system: string) => {
    setMeasurementSystem(system)
    handleInputChange("units", system === "metric" ? "Metric" : "US Standard")
  }

  const addMedication = () => {
    if (newMedication.trim() && !medications.includes(newMedication.trim())) {
      const updatedMedications = [...medications, newMedication.trim()]
      setMedications(updatedMedications)
      setNewMedication("")
      updateLabTestData({
        ...formData,
        medicalConditions,
        medications: updatedMedications,
      })
    }
  }

  const removeMedication = (medication: string) => {
    const updatedMedications = medications.filter((m) => m !== medication)
    setMedications(updatedMedications)
    updateLabTestData({
      ...formData,
      medicalConditions,
      medications: updatedMedications,
    })
  }

  const addCondition = () => {
    if (newCondition.trim() && !medicalConditions.includes(newCondition.trim())) {
      const updatedConditions = [...medicalConditions, newCondition.trim()]
      setMedicalConditions(updatedConditions)
      setNewCondition("")
      updateLabTestData({
        ...formData,
        medicalConditions: updatedConditions,
        medications,
      })
    }
  }

  const removeCondition = (condition: string) => {
    const updatedConditions = medicalConditions.filter((c) => c !== condition)
    setMedicalConditions(updatedConditions)
    updateLabTestData({
      ...formData,
      medicalConditions: updatedConditions,
      medications,
    })
  }

  const handleConditionSelect = (condition: string) => {
    if (condition && !medicalConditions.includes(condition)) {
      const updatedConditions = [...medicalConditions, condition]
      setMedicalConditions(updatedConditions)
      updateLabTestData({
        ...formData,
        medicalConditions: updatedConditions,
        medications,
      })
    }
  }

  const getHeightPlaceholder = () => {
    return measurementSystem === "metric" ? "e.g., 170 cm" : "e.g., 5'6\""
  }

  const getWeightPlaceholder = () => {
    return measurementSystem === "metric" ? "e.g., 70 kg" : "e.g., 140 lbs"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Heart className="h-4 w-4" />
                </div>
                <span className="text-xl font-semibold">KnowMyLabs</span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/glossary" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Marker Glossary
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/signin" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Sign In
                  </Link>
                  <Button asChild size="sm" className="ml-2">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                1
              </div>
              <div className="h-1 w-16 bg-primary rounded"></div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold">
                2
              </div>
              <div className="h-1 w-16 bg-muted rounded"></div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold">
                3
              </div>
              <div className="h-1 w-16 bg-muted rounded"></div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold">
                4
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">Step 1 of 4: Tell us about you</p>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-balance">Tell Us About You</h1>
            <p className="text-muted-foreground text-pretty">
              This information helps us provide more personalized insights for your lab results.
            </p>
          </div>

          {!isAuthenticated && (
            <Alert className="mb-8">
              <User className="h-4 w-4" />
              <AlertDescription>
                <strong>Guest Mode:</strong> You're using KnowMyLabs as a guest. Your information won't be saved.
                <Link href="/signup" className="text-primary hover:underline ml-1">
                  Create an account
                </Link>{" "}
                to save your profile and get personalized results across sessions.
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Help us personalize your results (all fields optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="measurementSystem">Measurement System</Label>
                <Select value={measurementSystem} onValueChange={handleMeasurementSystemChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select measurement system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imperial">Imperial (ft/in, lbs)</SelectItem>
                    <SelectItem value="metric">Metric (cm, kg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Basic Demographics */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    placeholder="Enter your age"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex">Sex</Label>
                  <Select value={formData.sex} onValueChange={(value) => handleInputChange("sex", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ethnicity">Ethnicity</Label>
                <Select value={formData.ethnicity} onValueChange={(value) => handleInputChange("ethnicity", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ethnicity" />
                  </SelectTrigger>
                  <SelectContent>
                    {ethnicityOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Physical Measurements */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    value={formData.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                    placeholder={getHeightPlaceholder()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    placeholder={getWeightPlaceholder()}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Medical Conditions</Label>
                  <div className="space-y-2">
                    <Select value="" onValueChange={handleConditionSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a common condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonMedicalConditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Input
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        placeholder="Or add a custom condition"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCondition())}
                      />
                      <Button type="button" onClick={addCondition} variant="outline">
                        Add
                      </Button>
                    </div>
                  </div>
                  {medicalConditions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {medicalConditions.map((condition, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {condition}
                          <button
                            type="button"
                            onClick={() => removeCondition(condition)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Current Medications</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      placeholder="Add a medication"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMedication())}
                    />
                    <Button type="button" onClick={addMedication} variant="outline">
                      Add
                    </Button>
                  </div>
                  {medications.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {medications.map((medication, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {medication}
                          <button
                            type="button"
                            onClick={() => removeMedication(medication)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Lifestyle Information</Label>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="exercise">Exercise Level</Label>
                    <Select
                      value={formData.lifestyle.exercise}
                      onValueChange={(value) => handleInputChange("lifestyle.exercise", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select exercise level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="very active">Very Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diet">Diet Type</Label>
                    <Select
                      value={formData.lifestyle.diet}
                      onValueChange={(value) => handleInputChange("lifestyle.diet", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select diet type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                        <SelectItem value="keto">Keto</SelectItem>
                        <SelectItem value="paleo">Paleo</SelectItem>
                        <SelectItem value="mediterranean">Mediterranean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smoking">Smoking Status</Label>
                    <Select
                      value={formData.lifestyle.smoking}
                      onValueChange={(value) => handleInputChange("lifestyle.smoking", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select smoking status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="former">Former</SelectItem>
                        <SelectItem value="current">Current</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alcohol">Alcohol Consumption</Label>
                    <Select
                      value={formData.lifestyle.alcohol}
                      onValueChange={(value) => handleInputChange("lifestyle.alcohol", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select alcohol consumption" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="occasional">Occasional</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="heavy">Heavy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sleep">Sleep Hours</Label>
                    <Input
                      id="sleep"
                      value={formData.lifestyle.sleep}
                      onChange={(e) => handleInputChange("lifestyle.sleep", e.target.value)}
                      placeholder="e.g., 7-8 hours"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stress">Stress Level</Label>
                    <Select
                      value={formData.lifestyle.stress}
                      onValueChange={(value) => handleInputChange("lifestyle.stress", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select stress level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fastingStatus">Fasting Status</Label>
                  <Select
                    value={formData.fastingStatus}
                    onValueChange={(value) => handleInputChange("fastingStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fasting status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Non-fasting">Non-fasting</SelectItem>
                      <SelectItem value="8+ hours">8+ hours</SelectItem>
                      <SelectItem value="12+ hours">12+ hours</SelectItem>
                      <SelectItem value="16+ hours">16+ hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-date">Test date</Label>
                  <Input
                    id="test-date"
                    type="date"
                    value={formData.testDate}
                    onChange={(e) => handleInputChange("testDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceSet">Reference Set</Label>
                <Select
                  value={formData.referenceSet}
                  onValueChange={(value) => handleInputChange("referenceSet", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reference set" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Adult">Adult</SelectItem>
                    <SelectItem value="Pediatric">Pediatric</SelectItem>
                    <SelectItem value="Geriatric">Geriatric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button asChild variant="outline">
              <Link href={isAuthenticated ? "/dashboard" : "/"}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {isAuthenticated ? "Back to Dashboard" : "Back to Home"}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/panels">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Your information helps us provide personalized lab result insights.
          </p>
        </div>
      </footer>
    </div>
  )
}
