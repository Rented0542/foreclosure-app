import { db, initDb, schema } from "../src/lib/db";
import { newId } from "../src/lib/storage/files";
import { fetchHtml, parseGenericList } from "../src/lib/scrapers/properties";
import { eq } from "drizzle-orm";

async function main() {
  initDb();
  const urls = (process.argv[2] || "").split(",").filter(Boolean);
  const targets = urls.length ? urls : ["https://www.hudhomestore.gov/"];
  for (const u of targets) {
    console.log("scanning", u);
    try {
      const html = await fetchHtml(u);
      const items = parseGenericList(html, "web", u);
      for (const it of items) {
        await db.insert(schema.properties).values({
          id: newId(), source: it.source, externalId: it.externalId || null, address: it.address,
          city: it.city || null, state: it.state || null, zip: it.zip || null, price: it.price || null,
          beds: it.beds || null, baths: it.baths || null, sqft: it.sqft || null, type: it.type || null,
          status: it.status || "unknown", auctionDate: it.auctionDate || null, url: it.url || null,
          raw: it.raw || null, reviewStatus: "unreviewed", reviewedBy: null, notes: null,
          firstSeen: new Date(), lastSeen: new Date(),
        } as any);
      }
      console.log(`  found ${items.length}`);
    } catch (e: any) { console.error("  err", e.message); }
  }
}
main();