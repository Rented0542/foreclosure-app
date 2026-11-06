import { db, initDb, schema } from "@/lib/db";
import { desc } from "drizzle-orm";

export default async function PropertiesPage() {
  initDb();
  const rows = await db.select().from(schema.properties).orderBy(desc(schema.properties.lastSeen));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Properties</h1>
        <a href="/api/properties/export" className="text-sm text-blue-600">Export JSON</a>
      </div>
      <form action="/api/properties" method="post" className="rounded border bg-white p-4 space-y-2">
        <h2 className="font-semibold">Add property manually</h2>
        <div className="grid grid-cols-3 gap-2">
          <input name="address" placeholder="Address" className="border p-2 rounded" required />
          <input name="city" placeholder="City" className="border p-2 rounded" />
          <input name="state" placeholder="State" className="border p-2 rounded" />
          <input name="zip" placeholder="Zip" className="border p-2 rounded" />
          <input name="price" type="number" placeholder="Price" className="border p-2 rounded" />
          <input name="beds" type="number" placeholder="Beds" className="border p-2 rounded" />
        </div>
        <button className="rounded bg-slate-900 text-white px-4 py-2 text-sm">Add</button>
      </form>
      <div className="overflow-x-auto rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Address</th><th>City/State</th><th>Price</th><th>Beds/Baths</th><th>Status</th><th>Review</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.address}</td>
                <td>{r.city}, {r.state} {r.zip}</td>
                <td>{r.price ? `$${r.price.toLocaleString()}` : "-"}</td>
                <td>{r.beds ?? "-"} / {r.baths ?? "-"}</td>
                <td>{r.status || "unknown"}</td>
                <td>{r.reviewStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}