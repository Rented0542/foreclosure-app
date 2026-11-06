import { NextResponse } from "next/server";
import { runPropertyScan, runBuyerScan, runMatching } from "@/lib/jobs/runner";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const job = body.job || "all";
  if (job === "properties" || job === "all") await runPropertyScan();
  if (job === "buyers" || job === "all") await runBuyerScan();
  if (job === "matching" || job === "all") await runMatching();
  return NextResponse.json({ ok: true });
}