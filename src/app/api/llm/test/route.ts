import { NextResponse } from "next/server";
import { llmChat } from "@/lib/llm/client";

export async function POST() {
  try {
    const r = await llmChat([{ role: "user", content: "Reply with the word OK." }], { maxTokens: 10 });
    return NextResponse.json({ ok: true, response: r });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}