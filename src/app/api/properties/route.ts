import { NextResponse } from "next/server";
import { db, initDb, schema } from "@/lib/db";
import { newId } from "@/lib/storage/files";

export async function GET() {
  initDb();
  const rows = await db.select().from(schema.properties);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  initDb();
  const form = await req.formData().catch(() => null);
  const body = form ? Object.fromEntries(form.entries()) : await req.json().catch(() => ({}));
  const now = new Date();
  const row = {
    id: newId(),
    source: "manual",
    externalId: null,
    address: String(body.address || "Unknown"),
    city: body.city ? String(body.city) : null,
    state: body.state ? String(body.state) : null,
    zip: body.zip ? String(body.zip) : null,
    price: body.price ? Number(body.price) : null,
    beds: body.beds ? Number(body.beds) : null,
    baths: null,
    sqft: null,
    type: null,
    status: "unknown",
    auctionDate: null,
    url: null,
    raw: null,
    reviewStatus: "unreviewed",
    reviewedBy: null,
    notes: null,
    firstSeen: now,
    lastSeen: now,
  };
  await db.insert(schema.properties).values(row as any);
  return NextResponse.redirect(new URL("/properties", req.url));
}