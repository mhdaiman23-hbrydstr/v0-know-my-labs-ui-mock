import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

const healthInsightsSchema = z.object({
  personalizedScore: z.object({
    overall: z.number().min(0).max(100).describe("Overall health score from 0-100"),
    categories: z.object({
      metabolic: z.number().min(0).max(100),
      cardiovascular: z.number().min(0).max(100),
      inflammation: z.number().min(0).max(100),
      hormonal: z.number().min(0).max(100),
    }),
    explanation: z.string().describe("Brief explanation of the score calculation"),
  }),
  riskAssessment: z.object({
    highRisk: z.array(z.string()).describe("High risk conditions based on profile and labs"),
    moderateRisk: z.array(z.string()).describe("Moderate risk conditions"),
    protectiveFactors: z.array(z.string()).describe("Positive health factors"),
  }),
  personalizedRecommendations: z.array(
    z.object({
      category: z.enum(["diet", "exercise", "lifestyle", "medical", "supplements"]),
      priority: z.enum(["high", "medium", "low"]),
      recommendation: z.string(),
      reasoning: z.string(),
    }),
  ),
  trendAnalysis: z.object({
    improvingMarkers: z.array(z.string()).describe("Lab markers showing improvement"),
    decliningMarkers: z.array(z.string()).describe("Lab markers showing decline"),
    stableMarkers: z.array(z.string()).describe("Lab markers remaining stable"),
    keyInsights: z.array(z.string()).describe("Important trends to note"),
  }),
  nextSteps: z.array(
    z.object({
      action: z.string(),
      timeframe: z.string(),
      importance: z.enum(["critical", "important", "routine"]),
    }),
  ),
})

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (profileError) {
      return Response.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    // Fetch recent lab results
    const { data: labSets, error: labError } = await supabase
      .from("lab_sets")
      .select(`
        *,
        lab_results (*)
      `)
      .eq("user_id", userId)
      .order("collected_at", { ascending: false })
      .limit(3)

    if (labError) {
      return Response.json({ error: "Failed to fetch lab results" }, { status: 500 })
    }

    // Create comprehensive prompt with user data
    const prompt = `
You are a health insights AI analyzing lab results and personal health data. Generate personalized health insights based on the following information:

USER PROFILE:
- Age: ${profile.age || "Not provided"}
- Sex: ${profile.sex || "Not provided"}
- Ethnicity: ${profile.ethnicity || "Not provided"}
- Height: ${profile.height || "Not provided"}
- Weight: ${profile.weight || "Not provided"}
- Medical Conditions: ${profile.medical_conditions?.join(", ") || "None reported"}
- Medications: ${profile.medications?.join(", ") || "None reported"}
- Exercise Level: ${profile.lifestyle?.exercise || "Not provided"}
- Diet Type: ${profile.lifestyle?.diet || "Not provided"}
- Smoking Status: ${profile.lifestyle?.smoking || "Not provided"}
- Alcohol Consumption: ${profile.lifestyle?.alcohol || "Not provided"}
- Sleep Hours: ${profile.lifestyle?.sleep || "Not provided"}
- Stress Level: ${profile.lifestyle?.stress || "Not provided"}

RECENT LAB RESULTS:
${
  labSets
    ?.map(
      (set) => `
Date: ${set.collected_at}
Results: ${set.lab_results?.map((result) => `${result.name}: ${result.value_raw} ${result.unit_raw}`).join(", ") || "No results"}
`,
    )
    .join("\n") || "No lab results available"
}

Please provide comprehensive, personalized health insights that:
1. Calculate health scores based on the specific profile and lab values
2. Identify risk factors considering age, sex, ethnicity, and lifestyle
3. Provide actionable recommendations tailored to their specific situation
4. Analyze trends if multiple lab results are available
5. Suggest next steps with appropriate urgency levels

Be specific and personalized - avoid generic advice. Consider the interplay between lifestyle factors, medical conditions, medications, and lab results.
`

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: healthInsightsSchema,
      prompt,
      maxOutputTokens: 2000,
    })

    return Response.json({ insights: object })
  } catch (error) {
    console.error("AI Insights API Error:", error)
    return Response.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
