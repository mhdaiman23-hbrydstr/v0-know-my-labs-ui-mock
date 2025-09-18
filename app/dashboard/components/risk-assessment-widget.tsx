"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Shield, CheckCircle, Info } from "lucide-react"

interface RiskAssessmentData {
  highRisk: string[]
  moderateRisk: string[]
  protectiveFactors: string[]
}

interface RiskAssessmentWidgetProps {
  riskData: RiskAssessmentData
  isLoading?: boolean
}

export function RiskAssessmentWidget({ riskData, isLoading = false }: RiskAssessmentWidgetProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Risk Assessment
          </CardTitle>
          <CardDescription>Personalized health risk analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-muted-foreground">Analyzing your health risks...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasHighRisk = riskData.highRisk.length > 0
  const hasModerateRisk = riskData.moderateRisk.length > 0
  const hasProtectiveFactors = riskData.protectiveFactors.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Risk Assessment
        </CardTitle>
        <CardDescription>Personalized health risk analysis based on your profile and labs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* High Risk Factors */}
        {hasHighRisk && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">High Risk Factors</div>
                <div className="space-y-1">
                  {riskData.highRisk.map((risk, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                      <span className="text-sm">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Moderate Risk Factors */}
        {hasModerateRisk && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium text-yellow-800">Moderate Risk Factors</div>
                <div className="space-y-1">
                  {riskData.moderateRisk.map((risk, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0" />
                      <span className="text-sm text-yellow-800">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Protective Factors */}
        {hasProtectiveFactors && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium text-green-800">Protective Factors</div>
                <div className="space-y-1">
                  {riskData.protectiveFactors.map((factor, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                      <span className="text-sm text-green-800">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* No Risk Factors */}
        {!hasHighRisk && !hasModerateRisk && !hasProtectiveFactors && (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <div className="text-sm text-muted-foreground">
              Complete your profile and upload lab results for personalized risk assessment
            </div>
          </div>
        )}

        {/* Risk Summary */}
        {(hasHighRisk || hasModerateRisk || hasProtectiveFactors) && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Risk Level:</span>
              <Badge
                variant={hasHighRisk ? "destructive" : hasModerateRisk ? "secondary" : "default"}
                className={
                  hasHighRisk
                    ? "bg-red-100 text-red-800"
                    : hasModerateRisk
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                }
              >
                {hasHighRisk ? "High" : hasModerateRisk ? "Moderate" : "Low"}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
