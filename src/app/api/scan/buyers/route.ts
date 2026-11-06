import { NextResponse } from "next/server";
import { db, initDb, schema } from "@/lib/db";
import { newId } from "@/lib/storage/files";
import { scrapeReddit, scrapeCraigslist } from "@/lib/scrapers/buyers";

export async function POST(req: Request) {
  initDb();
  const form = await req.formData().catch(() => null);
  const body = form ? Object.fromEntries(form.entries()) : {};
  const subs = String(body.subs || "FirstTimeHomeBuyer,RealEstate").split(",").map(s => s.trim()).filter(Boolean);
  const scanId = newId();
  await db.insert(schema.scans).values({ id: scanId, source: "buyers", startedAt: new Date(), itemsFound: 0, itemsNew: 0 } as any);

  let found = 0, neu = 0, err: string | null = null;
  try {
    const reddit = await scrapeReddit(subs);
    found += reddit.length;
    for (const r of reddit) {
      await db.insert(schema.prospects).values({
        id: newId(),
        name: r.name,
        handle: r.handle || null,
        contactChannel: r.contactChannel || null,
        contactValue: r.contactValue || null,
        source: r.source,
        intentSummary: r.intentSummary || null,
        budgetMin: r.budgetMin || null,
        budgetMax: r.budgetMax || null,
        targetCities: r.targetCities || null,
        consentStatus: "unknown",
        consentAt: null,
        doNotContact: false,
        notes: null,
        createdAt: new Date(),
      } as any);
      neu++;
    }
    const cl = await scrapeCraigslist("sfbay");
    found += cl.length;
    for (const r of cl) {
      await db.insert(schema.prospects).values({
        id: newId(),
        name: r.name,
        handle: null,
        contactChannel: null,
        contactValue: null,
        source: r.source,
        intentSummary: r.intentSummary || null,
        budgetMin: null,
        budgetMax: null,
        targetCities: null,
        consentStatus: "unknown",
        consentAt: null,
        doNotContact: false,
        notes: null,
        createdAt: new Date(),
      } as any);
      neu++;
    }
  } catch (e: any) {
    err = e.message;
  }
  const { eq } = await import("drizzle-orm");
  await db.update(schema.scans).set({ finishedAt: new Date(), itemsFound: found, itemsNew: neu, error: err } as any).where(eq(schema.scans.id, scanId));
  return NextResponse.redirect(new URL("/prospects", req.url));
}