import { db, initDb, schema } from "../src/lib/db";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

async function main() {
  initDb();
  mkdirSync("data/export", { recursive: true });
  const tables = [schema.properties, schema.prospects, schema.matches, schema.outreach, schema.scans];
  for (const t of tables) {
    const rows = await db.select().from(t);
    const name = (t as any)._.name || "table";
    writeFileSync(join("data/export", `${name}.json`), JSON.stringify(rows, null, 2));
    console.log(`exported ${rows.length} ${name}`);
  }
}
main().catch(e => { console.error(e); process.exit(1); });