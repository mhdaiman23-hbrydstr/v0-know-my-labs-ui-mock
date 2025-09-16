import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import Anthropic from "@anthropic-ai/sdk"

export const runtime = "nodejs"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const Req = z.object({
  demographics: z.object({
    sex: z.enum(["male", "female", "intersex", "unspecified"]),
    ageYears: z.number().min(0).max(120),
    ethnicity: z.string().optional(),
    units: z.enum(["SI", "US"]),
    fasting: z.boolean().optional(),
    testDate: z.string().optional(),
  }),
  context: z
    .object({
      conditions: z.array(z.string()).optional(),
      medications: z.array(z.string()).optional(),
      lifestyle: z.array(z.string()).optional(),
    })
    .optional(),
  labs: z
    .array(
      z.object({
        panel: z.string(),
        code: z.string(),
        name: z.string(),
        value_si: z.number(), // SI required
        unit_si: z.string(),
      }),
    )
    .min(1),
})

// Desired response shape (for the model & for our parse)
const ResponseHint = {
  summary: "string",
  flags: [{ code: "string", name: "string", severity: "low|high|critical|note", rationale: "string" }],
  considerations: ["string"],
  lifestyle: ["string"],
  questionsForDoctor: ["string"],
  safetyNotice: "string",
}

const Resp = z.object({
  summary: z.string(),
  flags: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
      severity: z.enum(["low", "high", "critical", "note"]),
      rationale: z.string(),
    }),
  ),
  considerations: z.array(z.string()),
  lifestyle: z.array(z.string()),
  questionsForDoctor: z.array(z.string()),
  safetyNotice: z.string(),
})

const SYSTEM_PROMPT = `
You are a cautious educational assistant for lab results.
- Do NOT diagnose, treat, or prescribe.
- Use only the provided demographics and lab markers; do not invent reference ranges.
- Explain in clear, plain English and keep it scannable.
- Always include a safety disclaimer telling users to consult a clinician.
- Return ONLY valid JSON matching the schema provided. No extra text.
`

function groupLabsByPanel(labs: any[]) {
  const grouped: Record<string, any[]> = {}
  for (const lab of labs) {
    if (!grouped[lab.panel]) {
      grouped[lab.panel] = []
    }
    grouped[lab.panel].push({
      code: lab.code,
      name: lab.name,
      value_si: lab.value_si,
      unit_si: lab.unit_si,
    })
  }
  return grouped
}

export async function POST(req: NextRequest) {
  try {
    console.log("[v0] Starting lab interpretation request")
    const body = await req.json()
    const parsed = Req.parse(body) // 400s on bad input
    console.log("[v0] Parsed request with", parsed.labs.length, "lab values")

    const labsByPanel = groupLabsByPanel(parsed.labs)

    // Build a minimal, privacy-first payload for the model
    const modelInput = {
      demographics: parsed.demographics,
      context: parsed.context ?? {},
      labsByPanel,
    }

    console.log("[v0] Sending request to Claude with panels:", Object.keys(labsByPanel))

    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 1200,
      temperature: 0.2,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Return ONLY JSON in this shape (no markdown, no prose):
${JSON.stringify(ResponseHint, null, 2)}

Here is the user context (no identifiers):
${JSON.stringify(modelInput, null, 2)}

The lab results are grouped by panel for easier analysis. Please provide a comprehensive interpretation focusing on:
1. Overall health summary
2. Any concerning values (flags)
3. Health considerations based on the results
4. Lifestyle recommendations
5. Questions the user should ask their doctor`,
            },
          ],
        },
      ],
    })

    console.log("[v0] Received response from Claude")
    const text = completion.content?.[0]?.type === "text" ? completion.content[0].text : ""

    let data: unknown
    try {
      data = JSON.parse(text)
      console.log("[v0] Successfully parsed Claude response JSON")
    } catch (parseError) {
      console.error("[v0] Failed to parse Claude response:", parseError)
      console.error("[v0] Raw response:", text)
      return NextResponse.json({ error: "Upstream JSON parse failed" }, { status: 502 })
    }

    const valid = Resp.safeParse(data)
    if (!valid.success) {
      console.error("[v0] Invalid response shape:", valid.error.flatten())
      return NextResponse.json({ error: "Invalid response shape", details: valid.error.flatten() }, { status: 502 })
    }

    console.log("[v0] Successfully validated and returning interpretation")
    return NextResponse.json(valid.data, { status: 200 })
  } catch (e: any) {
    // Bad request or server error
    if (e instanceof z.ZodError) {
      console.error("[v0] Validation error:", e.flatten())
      return NextResponse.json({ error: "Invalid payload", details: e.flatten() }, { status: 400 })
    }
    console.error("[v0] Interpretation error:", e)
    return NextResponse.json({ error: "Interpretation failed" }, { status: 500 })
  }
}
