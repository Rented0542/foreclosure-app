import { db, initDb, schema } from "@/lib/db";
import { count } from "drizzle-orm";

export default async function Home() {
  initDb();
  const [{ c: p }] = await db.select({ c: count() }).from(schema.properties);
  const [{ c: b }] = await db.select({ c: count() }).from(schema.prospects);
  const [{ c: m }] = await db.select({ c: count() }).from(schema.matches);
  const unreviewed = await db.select().from(schema.properties).where((schema.properties as any).reviewStatus ? undefined : undefined);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <Card title="Properties" value={p} href="/properties" />
        <Card title="Prospects" value={b} href="/prospects" />
        <Card title="Matches" value={m} href="/matches" />
      </div>
      <p className="text-sm text-slate-600">Local-first. Data stored in <code>data/</code> (git-tracked). Use Scan to discover new properties and buyers.</p>
    </div>
  );
}

function Card({ title, value, href }: { title: string; value: number; href: string }) {
  return (
    <a href={href} className="block rounded-lg border bg-white p-6 shadow-sm hover:shadow">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </a>
  );
}