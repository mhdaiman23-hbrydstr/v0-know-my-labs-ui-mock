import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface LabEntry {
  id: string
  marker: string
  value: number
  unit: string
  value_si?: number
  unit_si?: string
  panel: string
  referenceRange: string
}

interface SaveRequest {
  set: {
    source: string
    collected_at: string
    input_units: string
    parse_method: string
    panel_selection: string
    demographics: any
  }
  labs: LabEntry[]
  interpretation: any
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body: SaveRequest = await request.json()

    if (!body.set || !body.labs || !body.interpretation) {
      return NextResponse.json(
        {
          error: "Missing required fields: set, labs, interpretation",
        },
        { status: 400 },
      )
    }

    if (!Array.isArray(body.labs) || body.labs.length === 0) {
      return NextResponse.json(
        {
          error: "Labs must be a non-empty array",
        },
        { status: 400 },
      )
    }

    const { data: labSet, error: setError } = await supabase
      .from("lab_sets")
      .insert({
        user_id: user.id,
        source: body.set.source,
        collected_at: body.set.collected_at,
        input_units: body.set.input_units,
        parse_method: body.set.parse_method,
        panel_selection: body.set.panel_selection,
        demographics: body.set.demographics,
      })
      .select("id")
      .single()

    if (setError) {
      console.error("Error inserting lab_set:", setError)
      return NextResponse.json(
        {
          error: "Failed to save lab set",
        },
        { status: 500 },
      )
    }

    const setId = labSet.id

    const labResults = body.labs.map((lab) => ({
      set_id: setId,
      marker: lab.marker,
      value_si: lab.value_si || lab.value, // Use SI value if available, fallback to raw
      unit_si: lab.unit_si || lab.unit,
      value_raw: lab.value,
      unit_raw: lab.unit,
      panel: lab.panel,
      reference_range: lab.referenceRange,
    }))

    const { error: labsError } = await supabase.from("lab_results").insert(labResults)

    if (labsError) {
      console.error("Error inserting lab_results:", labsError)
      return NextResponse.json(
        {
          error: "Failed to save lab results",
        },
        { status: 500 },
      )
    }

    const { error: interpretationError } = await supabase.from("interpretations").insert({
      set_id: setId,
      model: "mock",
      response: body.interpretation,
      created_at: new Date().toISOString(),
    })

    if (interpretationError) {
      console.error("Error inserting interpretation:", interpretationError)
      return NextResponse.json(
        {
          error: "Failed to save interpretation",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      set_id: setId,
    })
  } catch (error) {
    console.error("Error in save API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
