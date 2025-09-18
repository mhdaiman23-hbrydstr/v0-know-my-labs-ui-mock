"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, BarChart3, Lightbulb } from "lucide-react"

interface TrendAnalysisData {
  improvingMarkers: string[]
  decliningMarkers: string[]
  stableMarkers: string[]
  keyInsights: string[]
}

interface TrendAnalysisWidgetProps {
  trendData: TrendAnalysisData
  isLoading?: boolean
}

export function TrendAnalysisWidget({ trendData, isLoading = false }: TrendAnalysisWidgetProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Trend Analysis
          </CardTitle>
          <CardDescription>AI analysis of your health marker trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-muted-foreground">Analyzing health trends...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasImproving = trendData.improvingMarkers.length > 0
  const hasDeclining = trendData.decliningMarkers.length > 0
  const hasStable = trendData.stableMarkers.length > 0
  const hasInsights = trendData.keyInsights.length > 0

  const totalMarkers =
    trendData.improvingMarkers.length + trendData.decliningMarkers.length + trendData.stableMarkers.length

  if (totalMarkers === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Trend Analysis
          </CardTitle>
          <CardDescription>AI analysis of your health marker trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <div className="text-sm text-muted-foreground">Upload multiple lab results to see trend analysis</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Trend Analysis
        </CardTitle>
        <CardDescription>AI analysis of your health marker trends over time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trend Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{trendData.improvingMarkers.length}</div>
            <div className="text-xs text-muted-foreground">Improving</div>
          </div>
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <Minus className="h-5 w-5 text-gray-600" />
            </div>
            <div className="text-2xl font-bold text-gray-600">{trendData.stableMarkers.length}</div>
            <div className="text-xs text-muted-foreground">Stable</div>
          </div>
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">{trendData.decliningMarkers.length}</div>
            <div className="text-xs text-muted-foreground">Declining</div>
          </div>
        </div>

        {/* Detailed Trends */}
        <div className="space-y-4">
          {/* Improving Markers */}
          {hasImproving && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-sm">Improving Markers</h4>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {trendData.improvingMarkers.length}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendData.improvingMarkers.map((marker, index) => (
                  <Badge key={index} variant="outline" className="text-green-700 border-green-200">
                    {marker}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Declining Markers */}
          {hasDeclining && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <h4 className="font-medium text-sm">Declining Markers</h4>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {trendData.decliningMarkers.length}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendData.decliningMarkers.map((marker, index) => (
                  <Badge key={index} variant="outline" className="text-red-700 border-red-200">
                    {marker}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Stable Markers */}
          {hasStable && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-gray-600" />
                <h4 className="font-medium text-sm">Stable Markers</h4>
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                  {trendData.stableMarkers.length}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendData.stableMarkers.map((marker, index) => (
                  <Badge key={index} variant="outline" className="text-gray-700 border-gray-200">
                    {marker}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Key Insights */}
        {hasInsights && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-sm">Key Insights</h4>
            </div>
            <div className="space-y-2">
              {trendData.keyInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-2" />
                  <span className="text-muted-foreground leading-relaxed">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Trend */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Health Trend:</span>
            <Badge
              variant={
                trendData.improvingMarkers.length > trendData.decliningMarkers.length
                  ? "default"
                  : trendData.decliningMarkers.length > trendData.improvingMarkers.length
                    ? "destructive"
                    : "secondary"
              }
              className={
                trendData.improvingMarkers.length > trendData.decliningMarkers.length
                  ? "bg-green-100 text-green-800"
                  : trendData.decliningMarkers.length > trendData.improvingMarkers.length
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
              }
            >
              {trendData.improvingMarkers.length > trendData.decliningMarkers.length
                ? "Improving"
                : trendData.decliningMarkers.length > trendData.improvingMarkers.length
                  ? "Needs Attention"
                  : "Stable"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
