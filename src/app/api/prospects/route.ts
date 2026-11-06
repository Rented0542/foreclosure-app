import { NextResponse } from "next/server";
import { db, initDb, schema } from "@/lib/db";
import { newId } from "@/lib/storage/files";

export async function GET() {
  initDb();
  const rows = await db.select().from(schema.prospects);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  initDb();
  const form = await req.formData().catch(() => null);
  const body = form ? Object.fromEntries(form.entries()) : await req.json().catch(() => ({}));
  const row = {
    id: newId(),
    name: String(body.name || "unknown"),
    handle: null,
    contactChannel: body.contactChannel ? String(body.contactChannel) : null,
    contactValue: body.contactValue ? String(body.contactValue) : null,
    source: "manual",
    intentSummary: body.intentSummary ? String(body.intentSummary) : null,
    budgetMin: null,
    budgetMax: body.budgetMax ? Number(body.budgetMax) : null,
    targetCities: body.targetCities ? String(body.targetCities) : null,
    consentStatus: "unknown",
    consentAt: null,
    doNotContact: false,
    notes: null,
    createdAt: new Date(),
  };
  await db.insert(schema.prospects).values(row as any);
  return NextResponse.redirect(new URL("/prospects", req.url));
}