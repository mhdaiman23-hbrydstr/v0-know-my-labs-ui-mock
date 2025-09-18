"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Heart, Activity, Zap, Shield } from "lucide-react"

interface HealthScoreData {
  overall: number
  categories: {
    metabolic: number
    cardiovascular: number
    inflammation: number
    hormonal: number
  }
  explanation: string
}

interface HealthScoreWidgetProps {
  scoreData: HealthScoreData
  isLoading?: boolean
}

export function HealthScoreWidget({ scoreData, isLoading = false }: HealthScoreWidgetProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            AI Health Score
          </CardTitle>
          <CardDescription>Personalized health assessment based on your profile and labs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse text-muted-foreground">Calculating your personalized health score...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "Excellent", variant: "default" as const, color: "bg-green-100 text-green-800" }
    if (score >= 60) return { label: "Good", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" }
    return { label: "Needs Attention", variant: "destructive" as const, color: "bg-red-100 text-red-800" }
  }

  const categoryIcons = {
    metabolic: Zap,
    cardiovascular: Heart,
    inflammation: Shield,
    hormonal: Activity,
  }

  const categoryLabels = {
    metabolic: "Metabolic",
    cardiovascular: "Cardiovascular",
    inflammation: "Inflammation",
    hormonal: "Hormonal",
  }

  const overallBadge = getScoreBadge(scoreData.overall)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          AI Health Score
        </CardTitle>
        <CardDescription>Personalized health assessment based on your profile and labs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className={`text-4xl font-bold ${getScoreColor(scoreData.overall)}`}>{scoreData.overall}</div>
            <div className="text-2xl text-muted-foreground">/100</div>
          </div>
          <Badge className={overallBadge.color}>{overallBadge.label}</Badge>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">{scoreData.explanation}</p>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Category Breakdown</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(scoreData.categories).map(([category, score]) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons]
              const label = categoryLabels[category as keyof typeof categoryLabels]

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              )
            })}
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span className="text-sm text-muted-foreground">Score updated based on latest lab results</span>
        </div>
      </CardContent>
    </Card>
  )
}
