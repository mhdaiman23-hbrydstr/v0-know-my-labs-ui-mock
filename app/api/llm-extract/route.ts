// app/api/llm-extract/route.ts
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { redact } from "@/lib/redact";

export const runtime = "nodejs"; // required because we use Node deps

// --- Input & Output validation ---
const Req = z.object({
  redactedText: z.string().min(10), // must be non-trivial text
});

const Resp = z.object({
  markers: z.array(z.object({
    panel: z.string().nullable(),
    code: z.string().nullable(),
    name: z.string(),
    value_raw: z.string(),                 // keep operators like "<5"
    unit_raw: z.string().nullable(),
    ref_low_raw: z.string().nullable().optional(),
    ref_high_raw: z.string().nullable().optional(),
    confidence: z.number().min(0).max(1),
  })),
  unrecognized_lines: z.array(z.string()).optional(),
});

// --- Model client ---
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// --- Prompts ---
const SYSTEM = `
You are an extraction engine for lab reports.
- Do NOT diagnose; only extract marker values.
- If any personal identifiers remain, replace with [REDACTED].
- Return STRICT JSON only (no prose or markdown).
- If a value is "<5" or ">1000", keep the operator in value_raw.
- If units are missing, set unit_raw to null and lower confidence.
`;

const SCHEMA_HINT = {
  markers: [
    {
      panel: "string|null",
      code: "string|null",
      name: "string",
      value_raw: "string",
      unit_raw: "string|null",
      ref_low_raw: "string|null",
      ref_high_raw: "string|null",
      confidence: 0.0
    }
  ],
  unrecognized_lines: ["string"]
};

// --- Handler ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { redactedText } = Req.parse(body);

    // Belt & suspenders: redact again server-side
    const safeText = redact(redactedText);

    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 1500,
      temperature: 0.1,
      system: SYSTEM,
      messages: [{
        role: "user",
        content: [{
          type: "text",
          text:
`Return ONLY JSON in this exact shape (no markdown):
${JSON.stringify(SCHEMA_HINT, null, 2)}

Text:
<<<
${safeText}
>>>`
        }]
      }]
    });

    const text = completion.content?.[0]?.type === "text" ? completion.content[0].text : "";
    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Upstream JSON parse failed" }, { status: 502 });
    }

    const parsed = Resp.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid extraction shape", details: parsed.error.flatten() }, { status: 502 });
    }

    // Return markers as-is; you can normalize to SI later in your flow
    return NextResponse.json(parsed.data, { status: 200 });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: e.flatten() }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
