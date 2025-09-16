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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = Req.parse(body) // 400s on bad input

    // Build a minimal, privacy-first payload for the model
    const modelInput = {
      demographics: parsed.demographics,
      context: parsed.context ?? {},
      labs: parsed.labs.map(({ panel, code, name, value_si, unit_si }) => ({
        panel,
        code,
        name,
        value_si,
        unit_si,
      })),
    }

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
${JSON.stringify(modelInput, null, 2)}`,
            },
          ],
        },
      ],
    })

    const text = completion.content?.[0]?.type === "text" ? completion.content[0].text : ""
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: "Upstream JSON parse failed" }, { status: 502 })
    }

    const valid = Resp.safeParse(data)
    if (!valid.success) {
      return NextResponse.json({ error: "Invalid response shape", details: valid.error.flatten() }, { status: 502 })
    }

    return NextResponse.json(valid.data, { status: 200 })
  } catch (e: any) {
    // Bad request or server error
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: e.flatten() }, { status: 400 })
    }
    console.error(e)
    return NextResponse.json({ error: "Interpretation failed" }, { status: 500 })
  }
}
