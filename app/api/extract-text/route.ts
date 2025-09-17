// app/api/extract-text/route.ts
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

// Helper: PDF parser
async function parsePdf(buffer: Buffer) {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return (data.text || "").trim();
}

// Helper: CSV parser (for now just raw text, Claude will parse it)
async function parseCsv(buffer: Buffer) {
  return buffer.toString("utf8").trim();
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const name = (file.name || "").toLowerCase();
    const type = file.type || "";
    const buffer = Buffer.from(await file.arrayBuffer());

    let text = "";

    if (name.endsWith(".pdf") || type.includes("pdf")) {
      text = await parsePdf(buffer);
    } else if (name.endsWith(".csv") || type.includes("csv")) {
      text = await parseCsv(buffer);
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Only PDF/CSV accepted." },
        { status: 415 }
      );
    }

    return NextResponse.json({ text }, { status: 200 });
  } catch (err) {
    console.error("extract-text error", err);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}
