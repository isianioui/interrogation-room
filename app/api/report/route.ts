import { NextResponse } from "next/server";
import { computeReport, type ReportInput } from "@/lib/scoring";

/** Computes the final case report (radar scores, talk ratio, weak spots) server-side. */
export async function POST(request: Request) {
  const body = (await request.json()) as ReportInput;
  return NextResponse.json(computeReport(body));
}
