"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Heart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
  FileText,
  Lightbulb,
  MessageCircleQuestion,
  Activity,
  Droplets,
  Zap,
  Shield,
  Brain,
  Home,
  User,
  Calendar,
  FileUp,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useLabTest } from "@/lib/lab-test-context"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  const { reviewedLabs, interpretation } = useLabTest()
  const [isLoaded, setIsLoaded] = useState(false)

  // Check if we have lab data
  useEffect(() => {
    // Short delay to ensure animation is visible
    const timer = setTimeout(() => {
      setIsLoaded(true)
      if (!reviewedLabs || reviewedLabs.length === 0) {
        console.log("No lab data found, redirecting to upload")
        router.push("/upload")
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [reviewedLabs, router])

  // Mock data based on lab results
  const generateKeyFlags = () => {
    // Default flags based on calcium being slightly elevated
    const defaultFlags = [
      {
        marker: "Calcium",
        value: "10.34 mg/dL",
        referenceRange: "8.6 - 10.3 mg/dL",
        status: "Borderline High",
        color: "bg-orange-100 text-orange-800",
        icon: TrendingUp,
      },
    ]

    // Add other flags based on actual lab values
    const flags = [...defaultFlags]

    if (reviewedLabs) {
      reviewedLabs.forEach((lab) => {
        // Check for out-of-range values
        if (lab.ref_range_low !== undefined && lab.ref_range_high !== undefined) {
          if (lab.value < lab.ref_range_low) {
            flags.push({
              marker: lab.name,
              value: `${lab.value} ${lab.unit}`,
              referenceRange: `${lab.ref_range_low} - ${lab.ref_range_high} ${lab.unit}`,
              status: "Low",
              color: "bg-yellow-100 text-yellow-800",
              icon: TrendingDown,
            })
          } else if (lab.value > lab.ref_range_high) {
            flags.push({
              marker: lab.name,
              value: `${lab.value} ${lab.unit}`,
              referenceRange: `${lab.ref_range_low} - ${lab.ref_range_high} ${lab.unit}`,
              status: "High",
              color: "bg-red-100 text-red-800",
              icon: TrendingUp,
            })
          }
        }
      })
    }

    // If we have too many flags, limit to the most important ones
    return flags.slice(0, 4)
  }

  const keyFlags = generateKeyFlags()

  // For demonstration, using static data similar to your example
  // In a real app, these would be generated based on actual lab results
  const allMarkers = [
    {
      name: "Hemoglobin",
      value: "14.30 g/dL",
      referenceRange: "13.5 - 18 g/dL",
      icon: Activity,
      description: "Protein in red blood cells that carries oxygen",
      tooltip:
        "Hemoglobin is the protein in your red blood cells that carries oxygen to your tissues. It's an important part of your complete blood count.",
      range: "Within typical range",
      rangeColor: "bg-green-100 text-green-800",
      category: "CBC",
    },
    {
      name: "RBC",
      value: "5.17 10^6/μL",
      referenceRange: "4.5 - 5.5 10^6/μL",
      icon: Droplets,
      description: "Red blood cell count",
      tooltip:
        "Red blood cells are responsible for carrying oxygen throughout your body. Their count is important for assessing overall blood health.",
      range: "Within typical range",
      rangeColor: "bg-green-100 text-green-800",
      category: "CBC",
    },
    {
      name: "WBC",
      value: "6.61 10^3/μL",
      referenceRange: "4 - 11 10^3/μL",
      icon: Shield,
      description: "White blood cell count",
      tooltip:
        "White blood cells are part of your immune system and help your body fight infection. Their count can indicate infection or inflammation.",
      range: "Within typical range",
      rangeColor: "bg-green-100 text-green-800",
      category: "CBC",
    },
    {
      name: "Glucose",
      value: "89.20 mg/dL",
      referenceRange: "70 - 100 mg/dL",
      icon: Activity,
      description: "Blood sugar level",
      tooltip:
        "Glucose is your blood sugar, which provides energy to your cells. High levels may indicate diabetes risk.",
      range: "Within typical range",
      rangeColor: "bg-green-100 text-green-800",
      category: "Chemistry",
    },
    {
      name: "Calcium",
      value: "10.34 mg/dL",
      referenceRange: "8.6 - 10.3 mg/dL",
      icon: Zap,
      description: "Mineral essential for bone health and cellular function",
      tooltip:
        "Calcium is crucial for bone health, muscle function, and nerve signaling. Slightly elevated levels are often not concerning but worth monitoring.",
      range: "Slightly above typical range",
      rangeColor: "bg-orange-100 text-orange-800",
      category: "Chemistry",
    },
    {
      name: "Creatinine",
      value: "1.17 mg/dL",
      referenceRange: "0.59 - 1.3 mg/dL",
      icon: Droplets,
      description: "Waste product that indicates kidney function",
      tooltip:
        "Creatinine is a waste product filtered by your kidneys. Its level in blood helps assess kidney function.",
      range: "Within typical range",
      rangeColor: "bg-green-100 text-green-800",
      category: "Chemistry",
    },
    {
      name: "AST (SGOT)",
      value: "21.10 U/L",
      referenceRange: "&lt; 35 U/L",
      icon: Activity,
      description: "Enzyme found in liver, heart, and muscle tissue",
      tooltip: "AST is an enzyme found in various tissues. Elevated levels may indicate liver damage or muscle injury.",
      range: "Within typical range",
      rangeColor: "bg-green-100 text-green-800",
      category: "Liver Function",
    },
    {
      name: "ALT (SGPT)",
      value: "18.80 U/L",
      referenceRange: "&lt; 45 U/L",
      icon: Activity,
      description: "Enzyme primarily found in liver cells",
      tooltip: "ALT is an enzyme mainly found in the liver. It's used to detect liver damage or disease.",
      range: "Within typical range",
      rangeColor: "bg-green-100 text-green-800",
      category: "Liver Function",
    },
    {
      name: "Uric Acid",
      value: "6.80 mg/dL",
      referenceRange: "3.5 - 7.2 mg/dL",
      icon: Brain,
      description: "Waste product from breakdown of purines",
      tooltip:
        "Uric acid is a waste product from the breakdown of purines in foods. High levels can lead to gout or kidney stones.",
      range: "Within typical range",
      rangeColor: "bg-green-100 text-green-800",
      category: "Chemistry",
    },
  ]

  const supplements = [
    {
      category: "Calcium Management",
      items: [
        {
          name: "Vitamin K2",
          dosage: "100-200mcg daily",
          description: "Helps direct calcium to bones rather than soft tissues",
          caution: "Consult doctor if taking blood thinners",
        },
        {
          name: "Magnesium",
          dosage: "200-400mg daily",
          description: "Works with calcium for proper mineral balance",
          caution: "Take separate from calcium supplements for best absorption",
        },
      ],
    },
    {
      category: "General Health Support",
      items: [
        {
          name: "Vitamin D3",
          dosage: "1000-2000 IU daily",
          description: "Supports calcium absorption and bone health",
          caution: "Take with food containing some fat for better absorption",
        },
        {
          name: "Omega-3 Fish Oil",
          dosage: "1-2g daily",
          description: "Supports overall cardiovascular health",
          caution: "Choose high-quality, tested products",
        },
      ],
    },
  ]

  const categories = ["CBC", "Chemistry", "Liver Function"]

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
              {!isAuthenticated ? (
                <>
                  <Link href="/signin" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Sign In
                  </Link>
                  <Button asChild size="sm" className="ml-2">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile/edit"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Profile
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-balance">Your Lab Results Analysis</h1>
                <p className="text-muted-foreground text-pretty">
                  Personalized insights based on your profile. Remember, this is for educational purposes only.
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <User className="h-4 w-4" />
                  <span>{isAuthenticated && user?.email ? user.email : "Guest User"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Test Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Important Disclaimer */}
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important Medical Disclaimer:</strong> This analysis is for educational purposes only and is not
                medical advice. Always consult with qualified healthcare professionals for medical decisions and
                interpretation of your lab results.
              </AlertDescription>
            </Alert>
          </div>

          {/* Main Content Layout */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Highlights */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Key Flags
                  </CardTitle>
                  <CardDescription>Markers that may need attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {keyFlags.map((flag, index) => {
                    const IconComponent = flag.icon
                    return (
                      <div key={index} className="p-3 rounded-lg border bg-card/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{flag.marker}</span>
                          </div>
                          <Badge className={flag.color}>{flag.status}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>
                            <strong>Your value:</strong> {flag.value}
                          </div>
                          <div>
                            <strong>Reference:</strong> {flag.referenceRange}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personalized Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Based on your profile (26-year-old male), your results show mostly normal values across CBC and
                    chemistry panels. Your calcium level is slightly elevated at 10.34 mg/dL (reference range 8.6-10.3
                    mg/dL), which is often not clinically significant but worth monitoring. Your kidney function appears
                    normal with creatinine at 1.17 mg/dL within the reference range. All liver enzymes are at healthy
                    levels.
                  </p>
                </CardContent>
              </Card>

              {!isAuthenticated && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      Save Your Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Create an account to save your results, track changes over time, and get more personalized
                      insights.
                    </p>
                    <div className="flex gap-2">
                      <Button asChild size="sm" className="flex-1">
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Link href="/signin">Sign In</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Detailed Tabs */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="summary" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="summary" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Summary
                  </TabsTrigger>
                  <TabsTrigger value="considerations" className="flex items-center gap-1">
                    <Info className="h-4 w-4" />
                    Considerations
                  </TabsTrigger>
                  <TabsTrigger value="lifestyle" className="flex items-center gap-1">
                    <Lightbulb className="h-4 w-4" />
                    Lifestyle
                  </TabsTrigger>
                  <TabsTrigger value="supplements" className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    Supplements
                  </TabsTrigger>
                  <TabsTrigger value="questions" className="flex items-center gap-1">
                    <MessageCircleQuestion className="h-4 w-4" />
                    Questions
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Summary</CardTitle>
                      <CardDescription>Human-friendly explanations personalized for you</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Complete Blood Count</h4>
                        <p className="text-sm text-muted-foreground">
                          <strong>Your CBC values all look healthy.</strong> Your hemoglobin (14.3 g/dL) is solidly in
                          the normal range, indicating good oxygen-carrying capacity. Red and white blood cell counts
                          are normal, suggesting no signs of infection, inflammation, or anemia. Your platelet count
                          (297.2 x 10³/µL) is also normal, indicating good blood clotting function.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Chemistry Panel</h4>
                        <p className="text-sm text-muted-foreground">
                          <strong>Your calcium is slightly elevated at 10.34 mg/dL</strong> (reference range 8.6-10.3
                          mg/dL). This is just barely above the reference range and often not a concern, but it's
                          something to mention to your doctor at your next visit. Your kidney function appears normal
                          with creatinine at 1.17 mg/dL, and blood glucose is optimal at 89.2 mg/dL.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Liver Function</h4>
                        <p className="text-sm text-muted-foreground">
                          <strong>Your liver enzymes are normal</strong> with AST at 21.1 U/L and ALT at 18.8 U/L, both
                          well within reference ranges. This suggests healthy liver function with no signs of
                          inflammation or damage.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="considerations" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personalized Considerations</CardTitle>
                      <CardDescription>Areas that might benefit from attention based on your profile</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <strong>Calcium level:</strong> Your calcium is very slightly elevated. While a single
                            borderline result is often not concerning, it's worth mentioning to your doctor. Factors
                            like dehydration, certain medications, or lab variation can cause minor elevations.
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <strong>eGFR value:</strong> Your estimated glomerular filtration rate (eGFR) is 75
                            ml/min/1.73m² (reference range: &gt;85). While this is a mild reduction, it's common to see
                            variations in this calculation. Staying well-hydrated and maintaining a healthy diet can
                            support kidney function.
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <strong>Preventive health:</strong> As a 26-year-old male with generally healthy results,
                            focus on maintaining good habits like regular exercise, balanced nutrition, adequate sleep,
                            and stress management.
                          </div>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="lifestyle" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personalized Lifestyle Suggestions</CardTitle>
                      <CardDescription>
                        Tailored recommendations based on your profile (not medical advice)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Kidney Health</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Stay well-hydrated with 2-3 liters of water daily</li>
                            <li>• Moderate protein intake - aim for balanced portions</li>
                            <li>• Limit sodium intake by minimizing processed foods</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Calcium Management</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Maintain adequate hydration to support kidney function</li>
                            <li>• Include vitamin K-rich foods like leafy greens in your diet</li>
                            <li>• Moderate calcium intake from supplements if you take them</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">General Health</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Regular physical activity - aim for 150 minutes weekly</li>
                            <li>• Balanced diet with plenty of fruits, vegetables, and whole grains</li>
                            <li>• Adequate sleep (7-9 hours) for overall health</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="supplements" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Supplement Suggestions</CardTitle>
                      <CardDescription>
                        Potential supplements that may help improve your markers (not medical advice)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Alert className="mb-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Important:</strong> Always consult your healthcare provider before starting any
                          supplements. This is educational information only and not medical advice.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-6">
                        {supplements.map((category, categoryIndex) => (
                          <div key={categoryIndex}>
                            <h4 className="font-semibold mb-3 text-primary">{category.category}</h4>
                            <div className="grid gap-3 md:grid-cols-1">
                              {category.items.map((supplement, itemIndex) => (
                                <div key={itemIndex} className="p-4 rounded-lg border bg-card/50">
                                  <div className="flex items-start justify-between mb-2">
                                    <h5 className="font-medium">{supplement.name}</h5>
                                    <Badge variant="outline" className="text-xs">
                                      {supplement.dosage}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{supplement.description}</p>
                                  <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                                    <strong>Note:</strong> {supplement.caution}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="questions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Questions to Ask Your Doctor</CardTitle>
                      <CardDescription>Prepare for your next appointment</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                          <MessageCircleQuestion className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            My calcium is slightly elevated at 10.34 mg/dL. Is this something I should be concerned
                            about?
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <MessageCircleQuestion className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            My eGFR is 75 ml/min/1.73m² (reference range: &gt;85). Is this worth investigating further?
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <MessageCircleQuestion className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>Are there any specific dietary recommendations for someone with my lab profile?</div>
                        </li>
                        <li className="flex items-start gap-2">
                          <MessageCircleQuestion className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>How often should I have follow-up labs to monitor these values?</div>
                        </li>
                        <li className="flex items-start gap-2">
                          <MessageCircleQuestion className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>Are there any other tests you would recommend based on these results?</div>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Complete Lab Results */}
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold text-center">Complete Lab Results</h2>
            <p className="text-center text-muted-foreground mb-8">
              All your markers with values and reference ranges for easy comparison
            </p>
            <div className="space-y-8">
              <TooltipProvider>
                {categories.map((category) => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary border-b pb-2">{category}</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {allMarkers
                        .filter((marker) => marker.category === category)
                        .map((marker, index) => {
                          const IconComponent = marker.icon
                          return (
                            <Card key={index} className="relative">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-sm">{marker.name}</CardTitle>
                                  </div>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Info className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p className="text-xs">{marker.tooltip}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0 space-y-3">
                                <p className="text-xs text-muted-foreground">{marker.description}</p>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">Your value:</span>
                                    <span className="text-sm font-semibold">{marker.value}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">Reference:</span>
                                    <span className="text-xs">{marker.referenceRange}</span>
                                  </div>
                                </div>
                                <Badge className={marker.rangeColor} variant="secondary">
                                  {marker.range}
                                </Badge>
                              </CardContent>
                            </Card>
                          )
                        })}
                    </div>
                  </div>
                ))}
              </TooltipProvider>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between">
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home Page
              </Link>
            </Button>
            <div className="flex gap-2">
              {!isAuthenticated ? (
                <>
                  <Button asChild variant="outline">
                    <Link href="/signup">Save Results</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/upload">
                      <FileUp className="mr-2 h-4 w-4" />
                      Upload New Report
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link href="/dashboard">
                      <User className="mr-2 h-4 w-4" />
                      Back to Dashboard
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/upload">
                      <FileUp className="mr-2 h-4 w-4" />
                      Upload New Report
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Always consult with qualified healthcare professionals</strong> for medical advice and treatment
            decisions. This analysis is for educational purposes only and is not a substitute for professional medical
            consultation.
          </p>
        </div>
      </footer>
    </div>
  )
}
