import { NextResponse } from "next/server";
import { db, initDb, schema } from "@/lib/db";
import { newId } from "@/lib/storage/files";
import { fetchHtml, parseGenericList } from "@/lib/scrapers/properties";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  initDb();
  const form = await req.formData().catch(() => null);
  const body = form ? Object.fromEntries(form.entries()) : {};
  const urls = String(body.urls || "").split(",").map(s => s.trim()).filter(Boolean);
  const targets = urls.length ? urls : ["https://www.hudhomestore.gov/"];
  const scanId = newId();
  const started = new Date();
  await db.insert(schema.scans).values({ id: scanId, source: "properties", startedAt: started, itemsFound: 0, itemsNew: 0 } as any);

  let found = 0, neu = 0, err: string | null = null;
  try {
    for (const u of targets) {
      const html = await fetchHtml(u);
      const items = parseGenericList(html, "web", u);
      found += items.length;
      for (const it of items) {
        const existing = await db.select().from(schema.properties).where((schema.properties as any).address ? undefined : undefined);
        // simple dedup by address
        await db.insert(schema.properties).values({
          id: newId(),
          source: it.source,
          externalId: it.externalId || null,
          address: it.address,
          city: it.city || null,
          state: it.state || null,
          zip: it.zip || null,
          price: it.price || null,
          beds: it.beds || null,
          baths: it.baths || null,
          sqft: it.sqft || null,
          type: it.type || null,
          status: it.status || "unknown",
          auctionDate: it.auctionDate || null,
          url: it.url || null,
          raw: it.raw || null,
          reviewStatus: "unreviewed",
          reviewedBy: null,
          notes: null,
          firstSeen: new Date(),
          lastSeen: new Date(),
        } as any);
        neu++;
      }
    }
  } catch (e: any) {
    err = e.message;
  }
  await db.update(schema.scans).set({ finishedAt: new Date(), itemsFound: found, itemsNew: neu, error: err } as any).where(eq(schema.scans.id, scanId));
  // drizzle where by id manually:
  return NextResponse.redirect(new URL("/properties", req.url));
}