import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { ClaimCategory, ClaimEntry } from "@/lib/types";

interface CheckRequestBody {
  new_claim: { category: ClaimCategory; value: string; quote: string; timestamp: number };
  existing_claims: ClaimEntry[];
}

interface ContradictionResult {
  contradicts: boolean;
  original_quote: string;
  reason: string;
}

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * LLM-backed contradiction check, used as a second pass alongside the local
 * heuristic in lib/ledger.ts — it catches semantically conflicting claims
 * that don't share literal wording (e.g. "at my desk" vs "I'd already left").
 * Runs on Groq's free tier (openai/gpt-oss-20b) with strict JSON schema
 * output. https://console.groq.com/docs/structured-outputs
 */
export async function POST(request: Request) {
  const body = (await request.json()) as CheckRequestBody;
  const { new_claim, existing_claims } = body;

  const relevant = (existing_claims ?? []).filter((c) => c.category === new_claim.category);
  if (relevant.length === 0) {
    return NextResponse.json({ contradicts: false, original_quote: "", reason: "" });
  }

  if (!process.env.GROQ_API_KEY) {
    // Fail soft: this endpoint is a secondary check on top of the local
    // heuristic, so a missing key should just skip it rather than surface
    // as a broken request (e.g. in mock-mode testing).
    return NextResponse.json({ contradicts: false, original_quote: "", reason: "" });
  }

  const priorClaims = relevant
    .map((c, i) => `${i + 1}. "${c.quote}" (said at ${c.timestamp}s)`)
    .join("\n");

  try {
    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "You are a fact-checking assistant for a criminal interrogation. You compare a suspect's new statement about a " +
            `${new_claim.category} claim against things they said earlier, and decide whether they contradict each other. ` +
            "Only flag a real contradiction — restating, elaborating on, or adding detail to an earlier claim is NOT a contradiction.",
        },
        {
          role: "user",
          content:
            `Category: ${new_claim.category}\n\n` +
            `Earlier statements by the suspect about this:\n${priorClaims}\n\n` +
            `New statement: "${new_claim.quote}"\n\n` +
            "Does the new statement contradict one of the earlier ones? If so, quote the earlier statement verbatim as original_quote and explain why in reason. If not, set contradicts to false and leave original_quote/reason as empty strings.",
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "contradiction_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              contradicts: { type: "boolean" },
              original_quote: { type: "string" },
              reason: { type: "string" },
            },
            required: ["contradicts", "original_quote", "reason"],
            additionalProperties: false,
          },
        },
      },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ contradicts: false, original_quote: "", reason: "" });
    }
    const parsed = JSON.parse(raw) as ContradictionResult;
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Groq contradiction check failed:", err);
    return NextResponse.json({ contradicts: false, original_quote: "", reason: "" });
  }
}
