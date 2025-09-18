"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Utensils, Dumbbell, Heart, Stethoscope, Pill, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface Recommendation {
  category: "diet" | "exercise" | "lifestyle" | "medical" | "supplements"
  priority: "high" | "medium" | "low"
  recommendation: string
  reasoning: string
}

interface LifestyleRecommendationsProps {
  recommendations: Recommendation[]
  isLoading?: boolean
}

export function LifestyleRecommendations({ recommendations, isLoading = false }: LifestyleRecommendationsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>AI-powered lifestyle suggestions based on your health profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-muted-foreground">Generating personalized recommendations...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const categoryIcons = {
    diet: Utensils,
    exercise: Dumbbell,
    lifestyle: Heart,
    medical: Stethoscope,
    supplements: Pill,
  }

  const categoryLabels = {
    diet: "Diet & Nutrition",
    exercise: "Exercise & Fitness",
    lifestyle: "Lifestyle",
    medical: "Medical",
    supplements: "Supplements",
  }

  const priorityConfig = {
    high: {
      icon: AlertCircle,
      color: "bg-red-100 text-red-800 border-red-200",
      label: "High Priority",
    },
    medium: {
      icon: Clock,
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Medium Priority",
    },
    low: {
      icon: CheckCircle,
      color: "bg-green-100 text-green-800 border-green-200",
      label: "Low Priority",
    },
  }

  // Group recommendations by category
  const groupedRecommendations = recommendations.reduce(
    (acc, rec) => {
      if (!acc[rec.category]) {
        acc[rec.category] = []
      }
      acc[rec.category].push(rec)
      return acc
    },
    {} as Record<string, Recommendation[]>,
  )

  // Sort recommendations by priority within each category
  Object.keys(groupedRecommendations).forEach((category) => {
    groupedRecommendations[category].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  })

  const categories = Object.keys(groupedRecommendations) as Array<keyof typeof categoryIcons>
  const highPriorityCount = recommendations.filter((r) => r.priority === "high").length

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>AI-powered lifestyle suggestions based on your health profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <div className="text-sm text-muted-foreground">
              Complete your profile and upload lab results for personalized recommendations
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Personalized Recommendations
        </CardTitle>
        <CardDescription>
          AI-powered lifestyle suggestions based on your health profile
          {highPriorityCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {highPriorityCount} High Priority
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={categories[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => {
              const Icon = categoryIcons[category]
              const count = groupedRecommendations[category].length
              return (
                <TabsTrigger key={category} value={category} className="flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{categoryLabels[category]}</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {count}
                  </Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-4">
              <div className="space-y-4">
                {groupedRecommendations[category].map((rec, index) => {
                  const priorityInfo = priorityConfig[rec.priority]
                  const PriorityIcon = priorityInfo.icon

                  return (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={priorityInfo.color}>
                              <PriorityIcon className="h-3 w-3 mr-1" />
                              {priorityInfo.label}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm mb-2">{rec.recommendation}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{rec.reasoning}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{recommendations.length} personalized recommendations</span>
            <Button variant="outline" size="sm">
              Export Recommendations
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
