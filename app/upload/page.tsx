"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLabTest } from "@/lib/lab-test-context"; // must expose setExtractedLabs
import { redact } from "@/lib/redact";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { setExtractedLabs } = useLabTest();

  async function onAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!file || busy) return;

    try {
      setBusy(true);

      // 1) Convert PDF/CSV -> text (server, in memory)
      const form = new FormData();
      form.append("file", file);
      const tRes = await fetch("/api/extract-text", { method: "POST", body: form });
      if (!tRes.ok) {
        const msg = await tRes.text();
        throw new Error(`extract-text failed: ${msg}`);
      }
      const { text } = await tRes.json();
      if (!text || text.length < 10) {
        throw new Error("No readable text found in the file.");
      }

      // 2) Redact locally, then call Claude extractor
      const redactedText = redact(text);
      const eRes = await fetch("/api/llm-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redactedText }),
      });
      if (!eRes.ok) {
        const msg = await eRes.text();
        throw new Error(`llm-extract failed: ${msg}`);
      }
      const data = await eRes.json(); // { markers: [...], unrecognized_lines?: [...] }
      const markers = Array.isArray(data?.markers) ? data.markers : [];
      if (!markers.length) {
        throw new Error("No markers were extracted. Please check your file.");
      }

      // 3) Save to context and go to Review
      setExtractedLabs(markers);
      router.push("/review");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Could not analyze the report.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Upload your lab report</h1>
      <p className="text-sm text-muted-foreground">
        We read your file in memory, redact identifiers, and only keep structured values.
      </p>

      <form onSubmit={onAnalyze} className="space-y-3">
        <input
          type="file"
          accept=".pdf,.csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <div className="text-xs text-muted-foreground">
          Accepted: PDF or CSV. Images (OCR) coming soon.
        </div>

        <button
          type="submit"
          disabled={!file || busy}
          className="px-4 py-2 rounded-md border"
        >
          {busy ? "Analyzing…" : "Analyze Report"}
        </button>
      </form>
    </div>
  );
}
