import { db, initDb, schema } from "@/lib/db";
import { desc } from "drizzle-orm";

export default async function ProspectsPage() {
  initDb();
  const rows = await db.select().from(schema.prospects).orderBy(desc(schema.prospects.createdAt));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Prospects (Buyers)</h1>
      <form action="/api/prospects" method="post" className="rounded border bg-white p-4 space-y-2">
        <h2 className="font-semibold">Add prospect manually</h2>
        <div className="grid grid-cols-3 gap-2">
          <input name="name" placeholder="Name/handle" className="border p-2 rounded" required />
          <input name="contactChannel" placeholder="Channel (telegram/email)" className="border p-2 rounded" />
          <input name="contactValue" placeholder="Contact value" className="border p-2 rounded" />
          <input name="budgetMax" type="number" placeholder="Budget max" className="border p-2 rounded" />
          <input name="targetCities" placeholder="Target cities" className="border p-2 rounded" />
          <input name="intentSummary" placeholder="Intent summary" className="border p-2 rounded" />
        </div>
        <button className="rounded bg-slate-900 text-white px-4 py-2 text-sm">Add</button>
      </form>
      <div className="overflow-x-auto rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr><th className="p-2 text-left">Name</th><th>Source</th><th>Budget</th><th>Cities</th><th>Consent</th><th>DNC</th></tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.name}</td>
                <td>{r.source}</td>
                <td>{r.budgetMin ?? "-"} - {r.budgetMax ?? "-"}</td>
                <td>{r.targetCities || "-"}</td>
                <td>{r.consentStatus}</td>
                <td>{r.doNotContact ? "YES" : "no"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}