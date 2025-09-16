"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Heart, ArrowLeft, Save, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

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

export default function EditProfilePage() {
  const { user, isAuthenticated, updateProfile } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [medications, setMedications] = useState<string[]>([])
  const [medicalConditions, setMedicalConditions] = useState<string[]>([])
  const [newMedication, setNewMedication] = useState("")
  const [newCondition, setNewCondition] = useState("")
  const [measurementSystem, setMeasurementSystem] = useState("imperial")

  const [formData, setFormData] = useState({
    age: "",
    sex: "",
    ethnicity: "",
    height: "",
    weight: "",
    lifestyle: {
      exercise: "",
      diet: "",
      smoking: "",
      alcohol: "",
      sleep: "",
      stress: "",
    },
    fastingStatus: "",
    units: "",
    referenceSet: "",
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/signin")
      return
    }

    if (user?.profile) {
      const profile = user.profile
      setFormData({
        age: profile.age || "",
        sex: profile.sex || "",
        ethnicity: profile.ethnicity || "",
        height: profile.height || "",
        weight: profile.weight || "",
        lifestyle: {
          exercise: profile.lifestyle?.exercise || "",
          diet: profile.lifestyle?.diet || "",
          smoking: profile.lifestyle?.smoking || "",
          alcohol: profile.lifestyle?.alcohol || "",
          sleep: profile.lifestyle?.sleep || "",
          stress: profile.lifestyle?.stress || "",
        },
        fastingStatus: profile.fasting_status || "",
        units: profile.units || "",
        referenceSet: profile.reference_set || "",
      })
      setMedications(profile.medications || [])
      setMedicalConditions(profile.medical_conditions || [])
      setMeasurementSystem(profile.units === "Metric" ? "metric" : "imperial")
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user) {
    return null
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("lifestyle.")) {
      const lifestyleField = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        lifestyle: {
          ...prev.lifestyle,
          [lifestyleField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleMeasurementSystemChange = (system: string) => {
    setMeasurementSystem(system)
    handleInputChange("units", system === "metric" ? "Metric" : "US Standard")
  }

  const addMedication = () => {
    if (newMedication.trim() && !medications.includes(newMedication.trim())) {
      setMedications([...medications, newMedication.trim()])
      setNewMedication("")
    }
  }

  const removeMedication = (medication: string) => {
    setMedications(medications.filter((m) => m !== medication))
  }

  const addCondition = () => {
    if (newCondition.trim() && !medicalConditions.includes(newCondition.trim())) {
      setMedicalConditions([...medicalConditions, newCondition.trim()])
      setNewCondition("")
    }
  }

  const removeCondition = (condition: string) => {
    setMedicalConditions(medicalConditions.filter((c) => c !== condition))
  }

  const handleConditionSelect = (condition: string) => {
    if (condition && !medicalConditions.includes(condition)) {
      setMedicalConditions([...medicalConditions, condition])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("[v0] Submitting profile update...")

      const success = await updateProfile({
        age: formData.age,
        sex: formData.sex,
        ethnicity: formData.ethnicity,
        height: formData.height,
        weight: formData.weight,
        lifestyle: formData.lifestyle,
        fasting_status: formData.fastingStatus,
        units: formData.units,
        reference_set: formData.referenceSet,
        medications,
        medical_conditions: medicalConditions,
      })

      if (success) {
        console.log("[v0] Profile updated successfully, redirecting to dashboard...")
        setTimeout(() => {
          router.push("/dashboard")
        }, 100)
      } else {
        console.error("Failed to update profile")
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Heart className="h-4 w-4" />
                </div>
                <span className="text-xl font-semibold text-balance">KnowMyLabs</span>
              </Link>
            </div>
            <Badge variant="secondary" className="text-xs">
              UI Mock Only
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-balance">Edit Profile</h1>
          <p className="text-muted-foreground">Update your personal information and health details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your personal details for accurate lab analysis</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
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

              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  placeholder={measurementSystem === "metric" ? "e.g., 170 cm" : "e.g., 5'6\""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder={measurementSystem === "metric" ? "e.g., 70 kg" : "e.g., 140 lbs"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>Health conditions and medications that may affect lab results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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

              {/* Medications */}
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
            </CardContent>
          </Card>

          {/* Lifestyle Information */}
          <Card>
            <CardHeader>
              <CardTitle>Lifestyle Information</CardTitle>
              <CardDescription>Lifestyle factors that can influence lab results</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
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
            </CardContent>
          </Card>

          {/* Test Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Test Preferences</CardTitle>
              <CardDescription>Default settings for lab analysis</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
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

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
