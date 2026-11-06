import { NextResponse } from "next/server";
import { db, initDb, schema } from "@/lib/db";
import { scoreMatch, hardFilter } from "@/lib/matching/engine";
import { newId } from "@/lib/storage/files";

export async function POST(req: Request) {
  initDb();
  const props = await db.select().from(schema.properties);
  const pros = await db.select().from(schema.prospects);
  let created = 0;
  for (const p of props) {
    for (const b of pros) {
      if (b.doNotContact) continue;
      const hf = hardFilter(p as any, b as any);
      if (!hf.ok) continue;
      const s = await scoreMatch(p as any, b as any);
      await db.insert(schema.matches).values({
        id: newId(),
        propertyId: p.id,
        prospectId: b.id,
        score: s.score,
        reasons: JSON.stringify(s.reasons),
        status: s.recommendation === "pursue" ? "suggested" : "suggested",
        createdAt: new Date(),
      } as any);
      created++;
    }
  }
  return NextResponse.redirect(new URL("/matches", req.url));
}