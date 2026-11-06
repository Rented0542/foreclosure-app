import { NextResponse } from "next/server";
import { getStatus } from "@/lib/jobs/state";

export async function GET() {
  return NextResponse.json({
    properties: getStatus("properties"),
    buyers: getStatus("buyers"),
    matching: getStatus("matching"),
  });
}