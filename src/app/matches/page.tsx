import { db, initDb, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export default async function MatchesPage() {
  initDb();
  const rows = await db.select().from(schema.matches).orderBy(desc(schema.matches.createdAt));
  const props = await db.select().from(schema.properties);
  const pros = await db.select().from(schema.prospects);
  const pmap = Object.fromEntries(props.map((p: any) => [p.id, p]));
  const bmap = Object.fromEntries(pros.map((b: any) => [b.id, b]));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Matches</h1>
        <form action="/api/matches/generate" method="post">
          <button className="rounded bg-slate-900 text-white px-4 py-2 text-sm">Generate matches</button>
        </form>
      </div>
      <div className="overflow-x-auto rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr><th className="p-2 text-left">Property</th><th>Prospect</th><th>Score</th><th>Status</th><th>Reasons</th></tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{pmap[r.propertyId]?.address || r.propertyId}</td>
                <td>{bmap[r.prospectId]?.name || r.prospectId}</td>
                <td>{r.score}</td>
                <td>{r.status}</td>
                <td className="max-w-md truncate">{r.reasons}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}