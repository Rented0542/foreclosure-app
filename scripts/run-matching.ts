import { db, initDb, schema } from "../src/lib/db";
import { newId } from "../src/lib/storage/files";
import { scoreMatch, hardFilter } from "../src/lib/matching/engine";

async function main() {
  initDb();
  const props = await db.select().from(schema.properties);
  const pros = await db.select().from(schema.prospects);
  let n = 0;
  for (const p of props) for (const b of pros) {
    if (b.doNotContact) continue;
    if (!hardFilter(p as any, b as any).ok) continue;
    const s = await scoreMatch(p as any, b as any);
    await db.insert(schema.matches).values({ id: newId(), propertyId: p.id, prospectId: b.id, score: s.score, reasons: JSON.stringify(s.reasons), status: "suggested", createdAt: new Date() } as any);
    n++;
  }
  console.log(`created ${n} matches`);
}
main();