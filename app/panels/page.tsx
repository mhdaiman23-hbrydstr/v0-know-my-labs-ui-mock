"use client"

import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, ArrowLeft, ArrowRight, FlaskConical, X } from "lucide-react"
import { useState } from "react"

export default function PanelsPage() {
  const [selectedPanels, setSelectedPanels] = useState<string[]>([])

  const availablePanels = [
    {
      name: "Complete Blood Count (CBC)",
      description: "Red blood cells, white blood cells, platelets, hemoglobin",
      category: "Basic",
    },
    {
      name: "Comprehensive Metabolic Panel (CMP)",
      description: "Glucose, electrolytes, kidney and liver function",
      category: "Basic",
    },
    {
      name: "Basic Metabolic Panel (BMP)",
      description: "Glucose, electrolytes, kidney function (subset of CMP)",
      category: "Basic",
    },
    {
      name: "Lipid Panel",
      description: "Total cholesterol, LDL, HDL, triglycerides",
      category: "Cardiovascular",
    },
    {
      name: "Cardiac Markers",
      description: "Troponin, CK-MB, BNP for heart health assessment",
      category: "Cardiovascular",
    },
    {
      name: "Thyroid Function (TSH, FT4, FT3)",
      description: "Thyroid stimulating hormone and thyroid hormones",
      category: "Hormonal",
    },
    {
      name: "Thyroid Antibodies",
      description: "TPO, thyroglobulin antibodies for autoimmune thyroid disease",
      category: "Hormonal",
    },
    {
      name: "Glucose & HbA1c",
      description: "Blood sugar and long-term glucose control",
      category: "Metabolic",
    },
    {
      name: "Insulin & C-Peptide",
      description: "Insulin levels and pancreatic function assessment",
      category: "Metabolic",
    },
    {
      name: "Iron Studies",
      description: "Ferritin, transferrin, TIBC, iron saturation",
      category: "Nutritional",
    },
    {
      name: "B12/Folate",
      description: "Vitamin B12 and folate levels",
      category: "Nutritional",
    },
    {
      name: "Vitamin D",
      description: "25-hydroxyvitamin D",
      category: "Nutritional",
    },
    {
      name: "Magnesium & Phosphorus",
      description: "Essential minerals for bone and muscle health",
      category: "Nutritional",
    },
    {
      name: "Inflammatory Markers",
      description: "C-reactive protein (CRP), ESR",
      category: "Inflammatory",
    },
    {
      name: "Autoimmune Panel",
      description: "ANA, RF, anti-CCP for autoimmune conditions",
      category: "Inflammatory",
    },
    {
      name: "Sex Hormones",
      description: "Total/Free testosterone, SHBG, estradiol",
      category: "Hormonal",
    },
    {
      name: "Cortisol & DHEA",
      description: "Stress hormones and adrenal function",
      category: "Hormonal",
    },
    {
      name: "Electrolytes",
      description: "Sodium, potassium, chloride, CO2",
      category: "Basic",
    },
    {
      name: "Kidney Function",
      description: "BUN, creatinine, eGFR",
      category: "Organ Function",
    },
    {
      name: "Liver Function",
      description: "ALT, AST, GGT, ALP, bilirubin",
      category: "Organ Function",
    },
    {
      name: "Prostate Health (PSA)",
      description: "Prostate-specific antigen for men's health",
      category: "Organ Function",
    },
    {
      name: "Coagulation Studies",
      description: "PT/INR, PTT for blood clotting assessment",
      category: "Hematology",
    },
    {
      name: "Tumor Markers",
      description: "CEA, CA 19-9, AFP for cancer screening",
      category: "Oncology",
    },
  ]

  const categories = [
    "Basic",
    "Cardiovascular",
    "Hormonal",
    "Metabolic",
    "Nutritional",
    "Inflammatory",
    "Organ Function",
    "Hematology",
    "Oncology",
  ]

  const handlePanelToggle = (panelName: string) => {
    setSelectedPanels((prev) => (prev.includes(panelName) ? prev.filter((p) => p !== panelName) : [...prev, panelName]))
  }

  const handleRemovePanel = (panelName: string) => {
    setSelectedPanels((prev) => prev.filter((p) => p !== panelName))
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
                ✓
              </div>
              <div className="h-1 w-16 bg-primary rounded"></div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
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
            <p className="text-center text-sm text-muted-foreground">Step 2 of 4: Choose lab panels</p>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-balance">Choose the Panels to Interpret</h1>
            <p className="text-muted-foreground text-pretty">
              Select which lab panels you'd like us to analyze and explain in plain English.
            </p>
          </div>

          <Card className="mb-8 border-dashed border-2 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <FlaskConical className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Not sure what panels you have?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your lab report and let us analyze it for you. We'll automatically identify all the panels
                    and markers.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                  >
                    <Link href="/upload">
                      Let Us Analyze For You
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Panels */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Selected Panels ({selectedPanels.length})
              </CardTitle>
              <CardDescription>These panels will be analyzed in your report</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedPanels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedPanels.map((panel, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1 px-3">
                      {panel}
                      <button onClick={() => handleRemovePanel(panel)}>
                        <X className="h-3 w-3 opacity-50 hover:opacity-100" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No panels selected yet</p>
              )}
            </CardContent>
          </Card>

          {/* Available Panels */}
          <Card>
            <CardHeader>
              <CardTitle>Available Lab Panels</CardTitle>
              <CardDescription>Select the panels that match your lab results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {categories.map((category) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-semibold text-sm text-primary">{category}</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {availablePanels
                      .filter((panel) => panel.category === category)
                      .map((panel, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border bg-card/50">
                          <Checkbox
                            id={`panel-${category}-${index}`}
                            checked={selectedPanels.includes(panel.name)}
                            onCheckedChange={() => handlePanelToggle(panel.name)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-1">
                            <Label
                              htmlFor={`panel-${category}-${index}`}
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {panel.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">{panel.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Helper Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't see your specific tests? You can upload any lab report and we'll identify the panels automatically.
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button asChild variant="outline">
              <Link href="/onboarding">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button asChild>
              <Link href="/upload">
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
            Select the panels that match your lab results for personalized analysis.
          </p>
        </div>
      </footer>
    </div>
  )
}
