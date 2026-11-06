import { db, initDb, schema } from "../src/lib/db";
import { newId } from "../src/lib/storage/files";
import { scrapeReddit } from "../src/lib/scrapers/buyers";

async function main() {
  initDb();
  const subs = (process.argv[2] || "FirstTimeHomeBuyer,RealEstate").split(",");
  const r = await scrapeReddit(subs);
  for (const p of r) {
    await db.insert(schema.prospects).values({
      id: newId(), name: p.name, handle: p.handle || null, contactChannel: p.contactChannel || null,
      contactValue: p.contactValue || null, source: p.source, intentSummary: p.intentSummary || null,
      budgetMin: p.budgetMin || null, budgetMax: p.budgetMax || null, targetCities: p.targetCities || null,
      consentStatus: "unknown", consentAt: null, doNotContact: false, notes: null, createdAt: new Date(),
    } as any);
  }
  console.log(`scraped ${r.length} prospects`);
}
main();