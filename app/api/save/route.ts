import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    console.log("[v0] Save API: Starting request processing")

    // Get the request body
    const body = await req.json()
    console.log("[v0] Save API: Request body received", {
      hasLabs: !!body.labs,
      labsCount: body.labs?.length,
      hasInterpretation: !!body.interpretation,
      hasDemographics: !!body.demographics,
    })

    const { demographics, context, labs, interpretation } = body

    // Validate required fields
    if (!labs || !Array.isArray(labs) || labs.length === 0) {
      console.log("[v0] Save API: Missing or empty labs array")
      return NextResponse.json({ error: "Labs data is required and must be a non-empty array" }, { status: 400 })
    }

    if (!interpretation) {
      console.log("[v0] Save API: Missing interpretation data")
      return NextResponse.json({ error: "Interpretation data is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the current user from session cookies
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    console.log("[v0] Save API: User authentication check", {
      hasUser: !!user,
      userId: user?.id,
      error: userError?.message,
    })

    if (userError || !user) {
      console.log("[v0] Save API: Authentication failed", userError)
      return NextResponse.json({ error: "Authentication required. Please log in." }, { status: 401 })
    }

    const panels = [...new Set(labs.map((lab: any) => lab.panel).filter(Boolean))]
    const source = context?.source || "upload"
    const collectedAt = context?.collected_at || new Date().toISOString().split("T")[0]

    console.log("[v0] Save API: Extracted metadata", {
      panels,
      source,
      collectedAt,
      userId: user.id,
    })

    const { data: labSet, error: labSetError } = await supabase
      .from("lab_sets")
      .insert({
        user_id: user.id,
        demographics: demographics || {},
        source,
        panel_selection: panels, // Use panel_selection instead of panels
        collected_at: collectedAt,
        status: "completed",
        input_units: "mixed",
        parse_method: "ai_extraction",
      })
      .select("id")
      .single()

    if (labSetError) {
      console.error("[v0] Save API: Error inserting lab_set:", labSetError)
      return NextResponse.json({ error: "Failed to save lab set", details: labSetError.message }, { status: 500 })
    }

    console.log("[v0] Save API: Lab set created", { labSetId: labSet.id })

    const labResults = labs.map((lab: any) => ({
      set_id: labSet.id, // Use set_id to match database schema
      panel: lab.panel || "unknown",
      code: lab.code || "",
      name: lab.name || "",
      value_raw: lab.value_raw !== undefined ? Number(lab.value_raw) : null,
      unit_raw: lab.unit_raw || "",
      value_si: lab.value_si !== undefined ? Number(lab.value_si) : null,
      unit_si: lab.unit_si || "",
    }))

    console.log("[v0] Save API: Inserting lab results", { count: labResults.length })

    const { error: labResultsError } = await supabase.from("lab_results").insert(labResults)

    if (labResultsError) {
      console.error("[v0] Save API: Error inserting lab_results:", labResultsError)
      return NextResponse.json(
        { error: "Failed to save lab results", details: labResultsError.message },
        { status: 500 },
      )
    }

    const interpretationData = {
      set_id: labSet.id, // Use set_id to match database schema
      summary: interpretation.summary || "",
      flags: interpretation.flags || {},
      considerations: interpretation.considerations || {},
      lifestyle: interpretation.lifestyle || {},
      questions: interpretation.questions || {},
      safety_notice: interpretation.safety_notice || "",
      model: interpretation.model || "claude-3-5-sonnet",
    }

    console.log("[v0] Save API: Inserting interpretation")

    const { error: interpretationError } = await supabase.from("interpretations").insert(interpretationData)

    if (interpretationError) {
      console.error("[v0] Save API: Error inserting interpretation:", interpretationError)
      return NextResponse.json(
        { error: "Failed to save interpretation", details: interpretationError.message },
        { status: 500 },
      )
    }

    console.log("[v0] Save API: Successfully saved all data", { labSetId: labSet.id })

    return NextResponse.json({
      success: true,
      lab_set_id: labSet.id, // Return lab_set_id as requested
      message: "Lab results and interpretation saved successfully",
    })
  } catch (error) {
    console.error("[v0] Save API: Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
