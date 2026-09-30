import { NextResponse } from "next/server";
import { getRandomCase } from "@/lib/cases";

/** Returns a randomly selected pre-written case file. */
export async function GET() {
  return NextResponse.json({ case: getRandomCase() });
}
