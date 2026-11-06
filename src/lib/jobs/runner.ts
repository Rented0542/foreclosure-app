import { db, initDb, schema } from "@/lib/db";
import { newId } from "@/lib/storage/files";
import { fetchHtml, parseGenericList } from "@/lib/scrapers/properties";
import { scrapeReddit, scrapeCraigslist } from "@/lib/scrapers/buyers";
import { scoreMatch, hardFilter } from "@/lib/matching/engine";
import { getStatus } from "./state";

const PROPERTY_SOURCES = [
  "https://www.hudhomestore.gov/",
  "https://www.homes.usda.gov/",
  "https://www.homepath.com/",
  "https://www.homesteps.com/",
];

export async function runPropertyScan() {
  const st = getStatus("properties");
  if (st.running) return;
  st.running = true;
  st.lastError = null;
  initDb();
  const started = new Date();
  const scanId = newId();
  await db.insert(schema.scans).values({ id: scanId, source: "properties", startedAt: started, itemsFound: 0, itemsNew: 0 } as any);
  let found = 0, neu = 0, err: string | null = null;
  try {
    for (const u of PROPERTY_SOURCES) {
      try {
        const html = await fetchHtml(u);
        const items = parseGenericList(html, "web", u);
        found += items.length;
        for (const it of items) {
          await db.insert(schema.properties).values({
            id: newId(), source: it.source, externalId: it.externalId || null, address: it.address,
            city: it.city || null, state: it.state || null, zip: it.zip || null, price: it.price || null,
            beds: it.beds || null, baths: it.baths || null, sqft: it.sqft || null, type: it.type || null,
            status: it.status || "unknown", auctionDate: it.auctionDate || null, url: it.url || null,
            raw: it.raw || null, reviewStatus: "unreviewed", reviewedBy: null, notes: null,
            firstSeen: new Date(), lastSeen: new Date(),
          } as any);
          neu++;
        }
      } catch (e: any) { err = e.message; }
    }
  } catch (e: any) { err = e.message; }
  const { eq } = await import("drizzle-orm");
  await db.update(schema.scans).set({ finishedAt: new Date(), itemsFound: found, itemsNew: neu, error: err } as any).where(eq(schema.scans.id, scanId));
  st.running = false;
  st.lastRun = new Date().toISOString();
  st.lastResult = `found ${found}, new ${neu}`;
  st.lastError = err;
  st.runs++;
}

export async function runBuyerScan() {
  const st = getStatus("buyers");
  if (st.running) return;
  st.running = true;
  st.lastError = null;
  initDb();
  const subs = ["FirstTimeHomeBuyer", "RealEstate", "personalfinance", "FirstTimeHomeBuyer"];
  const scanId = newId();
  await db.insert(schema.scans).values({ id: scanId, source: "buyers", startedAt: new Date(), itemsFound: 0, itemsNew: 0 } as any);
  let found = 0, neu = 0, err: string | null = null;
  try {
    const reddit = await (await import("@/lib/scrapers/buyers")).scrapeReddit(subs);
    found += reddit.length;
    for (const r of reddit) {
      await db.insert(schema.prospects).values({
        id: newId(), name: r.name, handle: r.handle || null, contactChannel: r.contactChannel || null,
        contactValue: r.contactValue || null, source: r.source, intentSummary: r.intentSummary || null,
        budgetMin: r.budgetMin || null, budgetMax: r.budgetMax || null, targetCities: r.targetCities || null,
        consentStatus: "unknown", consentAt: null, doNotContact: false, notes: null, createdAt: new Date(),
      } as any);
      neu++;
    }
    const cl = await (await import("@/lib/scrapers/buyers")).scrapeCraigslist("sfbay");
    found += cl.length;
    for (const r of cl) {
      await db.insert(schema.prospects).values({
        id: newId(), name: r.name, handle: null, contactChannel: null, contactValue: null, source: r.source,
        intentSummary: r.intentSummary || null, budgetMin: null, budgetMax: null, targetCities: null,
        consentStatus: "unknown", consentAt: null, doNotContact: false, notes: null, createdAt: new Date(),
      } as any);
      neu++;
    }
  } catch (e: any) { err = e.message; }
  const { eq } = await import("drizzle-orm");
  await db.update(schema.scans).set({ finishedAt: new Date(), itemsFound: found, itemsNew: neu, error: err } as any).where(eq(schema.scans.id, scanId));
  st.running = false;
  st.lastRun = new Date().toISOString();
  st.lastResult = `found ${found}, new ${neu}`;
  st.lastError = err;
  st.runs++;
}

export async function runMatching() {
  const st = getStatus("matching");
  if (st.running) return;
  st.running = true;
  st.lastError = null;
  initDb();
  const props = await db.select().from(schema.properties);
  const pros = await db.select().from(schema.prospects);
  let n = 0;
  try {
    for (const p of props) for (const b of pros) {
      if (b.doNotContact) continue;
      if (!hardFilter(p as any, b as any).ok) continue;
      const s = await scoreMatch(p as any, b as any);
      await db.insert(schema.matches).values({ id: newId(), propertyId: p.id, prospectId: b.id, score: s.score, reasons: JSON.stringify(s.reasons), status: "suggested", createdAt: new Date() } as any);
      n++;
    }
  } catch (e: any) { st.lastError = e.message; }
  st.running = false;
  st.lastRun = new Date().toISOString();
  st.lastResult = `created ${n} matches`;
  st.runs++;
}