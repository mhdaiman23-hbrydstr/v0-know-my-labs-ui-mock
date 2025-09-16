"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Heart,
  ArrowLeft,
  AlertTriangle,
  Activity,
  Droplets,
  Zap,
  Shield,
  Brain,
  Home,
  Leaf,
  Sun,
  Apple,
  Dumbbell,
  Search,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function GlossaryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const markerCategories = [
    {
      name: "Cardiovascular",
      description: "Markers related to heart and blood vessel health",
      markers: [
        {
          name: "LDL Cholesterol",
          icon: Activity,
          description: "Low-density lipoprotein cholesterol, often called 'bad' cholesterol",
          detailedExplanation:
            "LDL cholesterol carries cholesterol from your liver to cells throughout your body. When there's too much LDL cholesterol in your blood, it can build up in the walls of your arteries, forming plaques that can narrow arteries and reduce blood flow. This process, called atherosclerosis, can lead to heart disease and stroke.",
          optimalRange: "Less than 100 mg/dL (2.6 mmol/L)",
          referenceRange:
            "< 100 mg/dL optimal, 100-129 mg/dL near optimal, 130-159 mg/dL borderline high, 160-189 mg/dL high, ≥190 mg/dL very high",
          naturalImprovements: {
            diet: [
              "Increase soluble fiber (oats, beans, apples)",
              "Choose lean proteins",
              "Limit saturated and trans fats",
              "Add plant sterols and stanols",
            ],
            lifestyle: [
              "Regular aerobic exercise (30+ minutes, 5 days/week)",
              "Maintain healthy weight",
              "Don't smoke",
              "Limit alcohol",
            ],
            supplements: [
              "Plant sterols (2g daily)",
              "Red yeast rice (consult doctor first)",
              "Omega-3 fatty acids (1-2g daily)",
              "Psyllium husk fiber",
            ],
          },
        },
        {
          name: "HDL Cholesterol",
          icon: Shield,
          description: "High-density lipoprotein cholesterol, often called 'good' cholesterol",
          detailedExplanation:
            "HDL cholesterol acts like a cleanup crew for your arteries. It picks up excess cholesterol from your blood and artery walls and transports it back to your liver for disposal or recycling. Higher HDL levels are associated with lower risk of heart disease because this cholesterol is being removed from places where it could cause problems.",
          optimalRange: "60 mg/dL (1.6 mmol/L) or higher for optimal protection",
          referenceRange: "Men: >40 mg/dL, Women: >50 mg/dL (minimum), >60 mg/dL considered protective",
          naturalImprovements: {
            diet: [
              "Include healthy fats (olive oil, avocados, nuts)",
              "Eat fatty fish 2-3 times per week",
              "Choose whole grains over refined",
              "Moderate red wine (if you drink alcohol)",
            ],
            lifestyle: [
              "Regular aerobic exercise",
              "Maintain healthy weight",
              "Don't smoke (smoking lowers HDL)",
              "Manage stress",
            ],
            supplements: [
              "Niacin (under medical supervision)",
              "Omega-3 fish oil",
              "Chromium picolinate",
              "Green tea extract",
            ],
          },
        },
        {
          name: "Total Cholesterol",
          icon: Activity,
          description: "The sum of all cholesterol types in your blood",
          detailedExplanation:
            "Total cholesterol includes LDL, HDL, and VLDL cholesterol. While it gives an overall picture, it's less informative than looking at the individual components. You could have high total cholesterol but if most of it is HDL (good cholesterol), that's actually beneficial. The ratio of total cholesterol to HDL is often more meaningful than total cholesterol alone.",
          optimalRange: "Less than 200 mg/dL (5.2 mmol/L)",
          referenceRange: "<200 mg/dL desirable, 200-239 mg/dL borderline high, ≥240 mg/dL high",
          naturalImprovements: {
            diet: [
              "Follow a heart-healthy diet pattern",
              "Increase fiber intake",
              "Choose plant-based proteins more often",
              "Limit dietary cholesterol to <300mg daily",
            ],
            lifestyle: [
              "Regular physical activity",
              "Maintain healthy BMI",
              "Manage stress effectively",
              "Get adequate sleep",
            ],
            supplements: [
              "Combination approach targeting both LDL and HDL",
              "Plant sterols",
              "Soluble fiber supplements",
              "Omega-3 fatty acids",
            ],
          },
        },
        {
          name: "Triglycerides",
          icon: Droplets,
          description: "A type of fat found in your blood used for energy",
          detailedExplanation:
            "Triglycerides are the most common type of fat in your body. They come from food and are also made by your liver. When you eat more calories than you need, your body converts the extra calories into triglycerides and stores them in fat cells. High triglyceride levels, especially combined with low HDL or high LDL, can increase your risk of heart disease.",
          optimalRange: "Less than 100 mg/dL (1.1 mmol/L)",
          referenceRange: "<150 mg/dL normal, 150-199 mg/dL borderline high, 200-499 mg/dL high, ≥500 mg/dL very high",
          naturalImprovements: {
            diet: [
              "Limit simple carbohydrates and sugars",
              "Reduce refined grains",
              "Increase omega-3 rich foods",
              "Limit alcohol consumption",
            ],
            lifestyle: [
              "Lose excess weight",
              "Exercise regularly",
              "Control diabetes if present",
              "Limit portion sizes",
            ],
            supplements: [
              "High-dose omega-3 fish oil (2-4g daily)",
              "Niacin (medical supervision)",
              "Chromium",
              "Berberine",
            ],
          },
        },
      ],
    },
    {
      name: "Hormonal",
      description: "Markers related to hormone production and regulation",
      markers: [
        {
          name: "TSH (Thyroid Stimulating Hormone)",
          icon: Zap,
          description: "Hormone that regulates thyroid function",
          detailedExplanation:
            "TSH is produced by your pituitary gland and tells your thyroid how much thyroid hormone to make. When thyroid hormone levels are low, TSH goes up to stimulate more production. When thyroid hormone levels are high, TSH goes down. It's like a thermostat for your metabolism. High TSH usually means your thyroid is underactive (hypothyroidism), while low TSH often indicates an overactive thyroid (hyperthyroidism).",
          optimalRange: "1.0-2.5 mIU/L (many functional medicine practitioners prefer this tighter range)",
          referenceRange: "0.4-4.0 mIU/L (standard lab range, but some consider >2.5 as needing attention)",
          naturalImprovements: {
            diet: [
              "Ensure adequate iodine intake",
              "Include selenium-rich foods (Brazil nuts, seafood)",
              "Avoid excessive soy if hypothyroid",
              "Limit goitrogenic foods if TSH is high",
            ],
            lifestyle: [
              "Manage stress (chronic stress affects thyroid)",
              "Get adequate sleep",
              "Avoid extreme calorie restriction",
              "Regular moderate exercise",
            ],
            supplements: [
              "Selenium (200mcg daily)",
              "Iodine (if deficient, test first)",
              "Tyrosine",
              "Ashwagandha for stress support",
            ],
          },
        },
        {
          name: "Free T4 (Thyroxine)",
          icon: Zap,
          description: "The active form of thyroid hormone that regulates metabolism",
          detailedExplanation:
            "Free T4 is the unbound, active form of the main thyroid hormone thyroxine. It's responsible for regulating your metabolism, heart rate, body temperature, and energy levels. T4 is converted to T3 (the more active form) in your tissues. Free T4 levels help determine if your thyroid is producing adequate hormone, regardless of what your TSH level shows.",
          optimalRange: "Upper half of reference range (around 1.3-1.8 ng/dL)",
          referenceRange: "0.8-1.8 ng/dL (varies by lab)",
          naturalImprovements: {
            diet: [
              "Support T4 to T3 conversion with zinc and selenium",
              "Include tyrosine-rich foods",
              "Ensure adequate protein intake",
              "Consider timing of meals with thyroid medication",
            ],
            lifestyle: [
              "Consistent sleep schedule",
              "Stress management",
              "Avoid overtraining",
              "Maintain stable weight",
            ],
            supplements: [
              "Zinc (15-30mg daily)",
              "Selenium",
              "B-complex vitamins",
              "Iron if deficient (affects conversion)",
            ],
          },
        },
      ],
    },
    {
      name: "Nutritional",
      description: "Markers indicating nutritional status and deficiencies",
      markers: [
        {
          name: "Ferritin",
          icon: Brain,
          description: "A protein that stores iron in your body",
          detailedExplanation:
            "Ferritin is your body's iron storage protein. It acts like a bank account for iron - when you have plenty of iron, ferritin levels are high, and when iron stores are low, ferritin drops. Low ferritin is often the first sign of iron deficiency, even before anemia develops. Iron is crucial for oxygen transport, energy production, and brain function. Women typically need higher iron stores due to menstrual losses.",
          optimalRange: "50-150 ng/mL for optimal energy and wellbeing",
          referenceRange: "Men: 30-400 ng/mL, Women: 15-150 ng/mL (but many feel better with levels >50)",
          naturalImprovements: {
            diet: [
              "Include heme iron sources (red meat, poultry, fish)",
              "Combine non-heme iron with vitamin C",
              "Cook in cast iron cookware",
              "Avoid tea/coffee with iron-rich meals",
            ],
            lifestyle: [
              "Address any sources of blood loss",
              "Manage heavy menstrual periods",
              "Check for digestive issues affecting absorption",
              "Space out calcium and iron intake",
            ],
            supplements: [
              "Iron bisglycinate (gentler form)",
              "Vitamin C to enhance absorption",
              "B-complex for red blood cell production",
              "Avoid taking with calcium or zinc",
            ],
          },
        },
        {
          name: "Vitamin D",
          icon: Sun,
          description: "Essential vitamin for bone health, immune function, and more",
          detailedExplanation:
            "Vitamin D is actually a hormone that your skin produces when exposed to sunlight. It's crucial for calcium absorption, bone health, immune function, mood regulation, and muscle strength. Deficiency is extremely common, especially in northern climates or for people who spend most time indoors. Low vitamin D is linked to increased risk of infections, depression, bone problems, and autoimmune conditions.",
          optimalRange: "40-80 ng/mL (100-200 nmol/L) for optimal health",
          referenceRange: "30-100 ng/mL (75-250 nmol/L), but >50 ng/mL preferred for immune function",
          naturalImprovements: {
            diet: [
              "Fatty fish (salmon, mackerel, sardines)",
              "Egg yolks from pasture-raised chickens",
              "Fortified foods (limited effectiveness)",
              "Mushrooms exposed to UV light",
            ],
            lifestyle: [
              "Safe sun exposure (10-30 minutes daily depending on skin type)",
              "Spend time outdoors",
              "Maintain healthy weight (vitamin D is fat-soluble)",
              "Regular exercise",
            ],
            supplements: [
              "Vitamin D3 (cholecalciferol) 2000-4000 IU daily",
              "Take with fat for absorption",
              "Magnesium (needed for vitamin D metabolism)",
              "Vitamin K2 for synergy",
            ],
          },
        },
        {
          name: "Vitamin B12",
          icon: Brain,
          description: "Essential vitamin for nerve function and red blood cell formation",
          detailedExplanation:
            "Vitamin B12 is crucial for DNA synthesis, red blood cell formation, and proper nervous system function. It's only found naturally in animal products, making vegetarians and vegans at higher risk for deficiency. B12 deficiency can cause fatigue, weakness, memory problems, and nerve damage. Absorption decreases with age and certain medications (like metformin and proton pump inhibitors) can interfere with B12 absorption.",
          optimalRange: "500-900 pg/mL for optimal neurological function",
          referenceRange: "200-900 pg/mL (but symptoms can occur even with 'normal' levels)",
          naturalImprovements: {
            diet: [
              "Animal products: meat, fish, poultry, eggs, dairy",
              "Nutritional yeast (fortified)",
              "Fortified plant milks and cereals",
              "Shellfish and organ meats are especially rich",
            ],
            lifestyle: [
              "Address digestive health (affects absorption)",
              "Limit alcohol (interferes with absorption)",
              "Manage stress",
              "Consider genetic factors (MTHFR mutations)",
            ],
            supplements: [
              "Methylcobalamin or hydroxocobalamin forms",
              "Sublingual or injection if absorption issues",
              "B-complex for synergy",
              "Folate (but only with adequate B12)",
            ],
          },
        },
      ],
    },
    {
      name: "Metabolic",
      description: "Markers related to metabolism and blood sugar regulation",
      markers: [
        {
          name: "Hemoglobin A1C",
          icon: Droplets,
          description: "Average blood sugar levels over the past 2-3 months",
          detailedExplanation:
            "Hemoglobin A1C measures how much glucose has attached to your red blood cells over their 2-3 month lifespan. It's like a 'memory' of your average blood sugar levels. Unlike a single blood glucose test, A1C gives a broader picture of your blood sugar control. It's used to diagnose diabetes and prediabetes, and to monitor how well diabetes is being managed. Even levels in the 'normal' range can indicate increased risk if they're trending upward.",
          optimalRange: "Less than 5.0% for optimal metabolic health",
          referenceRange: "<5.7% normal, 5.7-6.4% prediabetes, ≥6.5% diabetes",
          naturalImprovements: {
            diet: [
              "Low glycemic index foods",
              "Increase fiber intake",
              "Balanced meals with protein and healthy fats",
              "Limit refined sugars and processed carbs",
            ],
            lifestyle: [
              "Regular physical activity (especially after meals)",
              "Maintain healthy weight",
              "Manage stress",
              "Get adequate sleep (poor sleep affects blood sugar)",
            ],
            supplements: [
              "Chromium picolinate",
              "Alpha-lipoic acid",
              "Cinnamon extract",
              "Berberine (very effective for blood sugar)",
            ],
          },
        },
      ],
    },
  ]

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return markerCategories
    }

    const searchLower = searchTerm.toLowerCase()

    return markerCategories
      .map((category) => ({
        ...category,
        markers: category.markers.filter(
          (marker) =>
            marker.name.toLowerCase().includes(searchLower) ||
            marker.description.toLowerCase().includes(searchLower) ||
            marker.detailedExplanation.toLowerCase().includes(searchLower),
        ),
      }))
      .filter((category) => category.markers.length > 0)
  }, [searchTerm])

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
              <Link href="/glossary" className="text-sm text-primary font-medium">
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
            <Badge variant="secondary" className="text-xs">
              UI Mock Only
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-balance">Lab Marker Glossary</h1>
            <p className="text-muted-foreground text-pretty">
              Detailed explanations of common lab markers, optimal ranges, and natural ways to improve them
            </p>
          </div>

          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search markers (e.g., cholesterol, TSH, vitamin D)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-border focus:border-primary"
              />
            </div>
            {searchTerm && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                {filteredCategories.reduce((total, cat) => total + cat.markers.length, 0)} markers found
              </p>
            )}
          </div>

          {/* Important Disclaimer */}
          <Alert className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Educational Information Only:</strong> This glossary is for educational purposes and is not
              medical advice. Always consult with qualified healthcare professionals for interpretation of your lab
              results and treatment decisions.
            </AlertDescription>
          </Alert>

          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No markers found</h3>
              <p className="text-muted-foreground">
                Try searching for different terms like "cholesterol", "thyroid", or "vitamin"
              </p>
            </div>
          ) : searchTerm ? (
            // Show search results without tabs
            <div className="space-y-8">
              {filteredCategories.map((category) => (
                <div key={category.name}>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-primary mb-2">{category.name} Markers</h2>
                    <p className="text-muted-foreground">{category.description}</p>
                  </div>
                  <div className="space-y-8">
                    {category.markers.map((marker, index) => {
                      const IconComponent = marker.icon
                      return (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className="bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div>
                                <CardTitle className="text-xl">{marker.name}</CardTitle>
                                <CardDescription className="text-base">{marker.description}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6 space-y-6">
                            {/* Detailed Explanation */}
                            <div>
                              <h4 className="font-semibold mb-2 text-primary">What is {marker.name}?</h4>
                              <p className="text-muted-foreground leading-relaxed">{marker.detailedExplanation}</p>
                            </div>

                            {/* Ranges */}
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                                <h5 className="font-semibold text-green-800 mb-2">Optimal Range</h5>
                                <p className="text-sm text-green-700">{marker.optimalRange}</p>
                              </div>
                              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                                <h5 className="font-semibold text-blue-800 mb-2">Reference Range</h5>
                                <p className="text-sm text-blue-700">{marker.referenceRange}</p>
                              </div>
                            </div>

                            {/* Natural Improvements */}
                            <div>
                              <h4 className="font-semibold mb-4 text-primary">
                                Natural Ways to Optimize {marker.name}
                              </h4>
                              <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Apple className="h-5 w-5 text-green-600" />
                                    <h5 className="font-semibold text-green-800">Dietary Approaches</h5>
                                  </div>
                                  <ul className="space-y-1 text-sm text-muted-foreground">
                                    {marker.naturalImprovements.diet.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-green-600 mt-1">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Dumbbell className="h-5 w-5 text-blue-600" />
                                    <h5 className="font-semibold text-blue-800">Lifestyle Changes</h5>
                                  </div>
                                  <ul className="space-y-1 text-sm text-muted-foreground">
                                    {marker.naturalImprovements.lifestyle.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-1">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Leaf className="h-5 w-5 text-purple-600" />
                                    <h5 className="font-semibold text-purple-800">Supplement Support</h5>
                                  </div>
                                  <ul className="space-y-1 text-sm text-muted-foreground">
                                    {marker.naturalImprovements.supplements.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-purple-600 mt-1">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Show normal tabbed interface when no search
            <Tabs defaultValue="Cardiovascular" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                {markerCategories.map((category) => (
                  <TabsTrigger key={category.name} value={category.name} className="text-xs">
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {markerCategories.map((category) => (
                <TabsContent key={category.name} value={category.name} className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-primary mb-2">{category.name} Markers</h2>
                    <p className="text-muted-foreground">{category.description}</p>
                  </div>

                  <div className="space-y-8">
                    {category.markers.map((marker, index) => {
                      const IconComponent = marker.icon
                      return (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className="bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div>
                                <CardTitle className="text-xl">{marker.name}</CardTitle>
                                <CardDescription className="text-base">{marker.description}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6 space-y-6">
                            {/* Detailed Explanation */}
                            <div>
                              <h4 className="font-semibold mb-2 text-primary">What is {marker.name}?</h4>
                              <p className="text-muted-foreground leading-relaxed">{marker.detailedExplanation}</p>
                            </div>

                            {/* Ranges */}
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                                <h5 className="font-semibold text-green-800 mb-2">Optimal Range</h5>
                                <p className="text-sm text-green-700">{marker.optimalRange}</p>
                              </div>
                              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                                <h5 className="font-semibold text-blue-800 mb-2">Reference Range</h5>
                                <p className="text-sm text-blue-700">{marker.referenceRange}</p>
                              </div>
                            </div>

                            {/* Natural Improvements */}
                            <div>
                              <h4 className="font-semibold mb-4 text-primary">
                                Natural Ways to Optimize {marker.name}
                              </h4>
                              <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Apple className="h-5 w-5 text-green-600" />
                                    <h5 className="font-semibold text-green-800">Dietary Approaches</h5>
                                  </div>
                                  <ul className="space-y-1 text-sm text-muted-foreground">
                                    {marker.naturalImprovements.diet.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-green-600 mt-1">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Dumbbell className="h-5 w-5 text-blue-600" />
                                    <h5 className="font-semibold text-blue-800">Lifestyle Changes</h5>
                                  </div>
                                  <ul className="space-y-1 text-sm text-muted-foreground">
                                    {marker.naturalImprovements.lifestyle.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-1">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Leaf className="h-5 w-5 text-purple-600" />
                                    <h5 className="font-semibold text-purple-800">Supplement Support</h5>
                                  </div>
                                  <ul className="space-y-1 text-sm text-muted-foreground">
                                    {marker.naturalImprovements.supplements.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-purple-600 mt-1">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between">
            <Button asChild variant="outline">
              <Link href="/results">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Results
              </Link>
            </Button>
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Always consult with qualified healthcare professionals</strong> before making changes to your diet,
            lifestyle, or supplement routine based on lab results. This information is for educational purposes only.
          </p>
        </div>
      </footer>
    </div>
  )
}
