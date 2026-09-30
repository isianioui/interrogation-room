import { NextResponse } from "next/server";

/**
 * Mints a short-lived AssemblyAI Streaming (Universal-Streaming v3) token
 * server-side. The API key never reaches the browser — only this
 * one-time-use token does.
 * https://www.assemblyai.com/docs/streaming/authenticate-with-a-temporary-token
 */
export async function GET() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ASSEMBLYAI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const url = new URL("https://streaming.assemblyai.com/v3/token");
  url.searchParams.set("expires_in_seconds", "60");

  const response = await fetch(url, {
    headers: { Authorization: apiKey },
  });

  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json(
      { error: `Failed to mint AssemblyAI token: ${response.status} ${text}` },
      { status: 502 }
    );
  }

  const data = (await response.json()) as { token: string };
  return NextResponse.json({ token: data.token });
}
