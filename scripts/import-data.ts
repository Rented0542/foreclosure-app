import { db, initDb, schema } from "../src/lib/db";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

async function main() {
  initDb();
  const map: Record<string, any> = {
    properties: schema.properties,
    prospects: schema.prospects,
    matches: schema.matches,
    outreach: schema.outreach,
    scans: schema.scans,
  };
  for (const [name, table] of Object.entries(map)) {
    const p = join("data/export", `${name}.json`);
    if (!existsSync(p)) continue;
    const rows = JSON.parse(readFileSync(p, "utf8"));
    for (const r of rows) await db.insert(table).values(r).onConflictDoNothing?.() ?? db.insert(table).values(r);
    console.log(`imported ${rows.length} ${name}`);
  }
}
main().catch(e => { console.error(e); process.exit(1); });