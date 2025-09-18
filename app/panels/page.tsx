"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Heart,
  ArrowLeft,
  ArrowRight,
  FlaskConical,
  ChevronDown,
  Crown,
  Sparkles,
  Info,
  Eye,
  EyeOff,
} from "lucide-react"
import { useState } from "react"

export default function PanelsPage() {
  const [openGroups, setOpenGroups] = useState<string[]>(["free"]) // Free group open by default
  const [expandedPanels, setExpandedPanels] = useState<string[]>([])

  const panelGroups = [
    {
      id: "free",
      title: "Free Panels (Basics)",
      subtitle: "Always included",
      icon: null,
      description: "Essential health markers available to all users",
      panels: [
        {
          name: "CBC (Complete Blood Count)",
          markers: [
            "WBC",
            "Neutrophils",
            "Lymphocytes",
            "Monocytes",
            "Eosinophils",
            "Basophils",
            "RBC",
            "Hemoglobin",
            "Hematocrit",
            "MCV",
            "MCH",
            "MCHC",
            "RDW",
            "Platelets",
            "MPV",
          ],
        },
        {
          name: "Basic Metabolic Panel (BMP)",
          markers: [
            "Sodium",
            "Potassium",
            "Chloride",
            "CO₂ (Bicarbonate)",
            "Glucose",
            "BUN",
            "Creatinine",
            "Calcium",
            "Uric Acid",
            "eGFR (calculated)",
          ],
        },
        {
          name: "Lipid Panel (Basic)",
          markers: ["Total Cholesterol", "LDL", "HDL", "Triglycerides"],
        },
        {
          name: "HbA1c",
          markers: ["HbA1c"],
        },
        {
          name: "TSH",
          markers: ["TSH"],
        },
        {
          name: "Vitamin D (25-OH)",
          markers: ["Vitamin D (25-OH)"],
        },
      ],
      cardClass: "border-green-200 bg-green-50/50",
      headerClass: "text-green-700",
    },
    {
      id: "premium",
      title: "Premium Panels",
      subtitle: "Standard Paid",
      icon: <Crown className="h-5 w-5 text-yellow-600" />,
      description: "Comprehensive analysis for deeper health insights",
      panels: [
        {
          name: "Comprehensive Metabolic Panel (CMP)",
          markers: [
            "All BMP markers",
            "Albumin",
            "Total Protein",
            "Globulin",
            "A/G ratio",
            "ALP",
            "ALT",
            "AST",
            "Total Bilirubin",
          ],
        },
        {
          name: "Full Thyroid Panel",
          markers: ["TSH", "Free T4", "Free T3", "Anti-TPO", "Anti-Tg", "Reverse T3 (optional)"],
        },
        {
          name: "Iron Studies",
          markers: ["Serum Iron", "Ferritin", "TIBC", "Transferrin Saturation"],
        },
        {
          name: "Vitamin B12 & Folate",
          markers: ["Vitamin B12", "Folate"],
        },
        {
          name: "Reproductive Hormones",
          markers: ["LH", "FSH", "Total Testosterone", "Free Testosterone", "Estradiol", "Progesterone", "SHBG"],
        },
        {
          name: "Inflammation Markers",
          markers: ["hs-CRP", "ESR"],
        },
      ],
      cardClass: "border-yellow-200 bg-yellow-50/50",
      headerClass: "text-yellow-700",
    },
    {
      id: "advanced",
      title: "Advanced Panels",
      subtitle: "Higher Tier Paid",
      icon: (
        <div className="flex items-center gap-1">
          <Crown className="h-5 w-5 text-purple-600" />
          <Sparkles className="h-4 w-4 text-purple-600" />
        </div>
      ),
      description: "Specialized testing for comprehensive health optimization",
      panels: [
        {
          name: "Advanced Lipids",
          markers: ["ApoA-I", "ApoB", "ApoB/ApoA1 ratio", "Lp(a)", "LDL particle size", "Non-HDL Cholesterol", "VLDL"],
        },
        {
          name: "Advanced Renal Function",
          markers: ["Cystatin C"],
        },
        {
          name: "Cardiac Markers",
          markers: ["NT-proBNP", "Troponin", "MPO", "Oxidized LDL", "CK"],
        },
        {
          name: "Oncology / Tumor Markers",
          markers: [
            "CEA",
            "AFP",
            "CA 19-9",
            "CA-125",
            "CA 15-3",
            "PSA (Total & Free)",
            "HE4",
            "NSE",
            "Calcitonin",
            "Chromogranin A",
            "Thyroglobulin",
          ],
        },
        {
          name: "Specialty Hormones",
          markers: ["DHEA-S", "Cortisol (AM/PM)", "ACTH", "Androstenedione", "Prolactin"],
        },
      ],
      cardClass: "border-purple-200 bg-purple-50/50",
      headerClass: "text-purple-700",
    },
  ]

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]))
  }

  const togglePanelDetails = (panelKey: string) => {
    setExpandedPanels((prev) =>
      prev.includes(panelKey) ? prev.filter((key) => key !== panelKey) : [...prev, panelKey],
    )
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
            <p className="text-center text-sm text-muted-foreground">Step 2 of 4: Blood Panel Analysis Tiers</p>
          </div>

          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-balance">Blood Panel Analysis Tiers</h1>
            <p className="text-muted-foreground text-pretty">
              Understand what's included in each analysis tier. Upload your reports to see which markers you have.
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
                  <h3 className="font-semibold mb-2">Ready to analyze your lab results?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your lab report and we'll automatically identify which markers you have and provide analysis
                    based on your tier.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                  >
                    <Link href="/upload">
                      Upload Lab Report
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {panelGroups.map((group) => (
              <Card key={group.id} className={`${group.cardClass} transition-all duration-200`}>
                <Collapsible open={openGroups.includes(group.id)} onOpenChange={() => toggleGroup(group.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-black/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {group.icon}
                          <div>
                            <CardTitle className={`${group.headerClass} text-lg`}>{group.title}</CardTitle>
                            <CardDescription className="text-sm">
                              {group.subtitle} • {group.panels.length} panel groups
                            </CardDescription>
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                            openGroups.includes(group.id) ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground text-left">{group.description}</p>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {group.panels.map((panel, index) => {
                          const panelKey = `${group.id}-${index}`
                          const isExpanded = expandedPanels.includes(panelKey)

                          return (
                            <div key={index} className={`p-4 rounded-lg border bg-white/50`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{panel.name}</span>
                                <div className="flex items-center gap-2">
                                  {group.id !== "free" && (
                                    <Badge variant="secondary" className="text-xs">
                                      Premium
                                    </Badge>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      togglePanelDetails(panelKey)
                                    }}
                                    className="h-6 px-2 text-xs"
                                  >
                                    {isExpanded ? (
                                      <>
                                        <EyeOff className="h-3 w-3 mr-1" />
                                        Hide
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="h-3 w-3 mr-1" />
                                        See more
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs text-muted-foreground mb-2 font-medium">Included markers:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {panel.markers.map((marker, markerIndex) => (
                                      <Badge
                                        key={markerIndex}
                                        variant="outline"
                                        className="text-xs px-2 py-0.5 bg-white/80"
                                      >
                                        {marker}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>

          <Card className="mt-8 border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>👉 Important:</strong> If your uploaded reports contain markers beyond the Free Basics,
                    we'll still analyze them — but those fall under premium panels. Unlock full insights with a paid
                    plan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex items-center justify-between">
            <Button asChild variant="outline">
              <Link href="/onboarding">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button asChild>
              <Link href="/upload">
                Continue to Upload
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
            Upload your lab results to see which analysis tier applies to your markers.
          </p>
        </div>
      </footer>
    </div>
  )
}
