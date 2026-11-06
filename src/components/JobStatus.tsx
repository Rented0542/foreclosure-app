"use client";
import { useEffect, useState } from "react";

export default function JobStatus() {
  const [status, setStatus] = useState<any>(null);
  useEffect(() => {
    const load = async () => {
      const r = await fetch("/api/jobs/status");
      setStatus(await r.json());
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);
  if (!status) return <p>Loading status…</p>;
  return (
    <div className="rounded border bg-white p-4 text-sm space-y-2">
      <h2 className="font-semibold">Background jobs (proactive)</h2>
      {Object.values(status).map((s: any) => (
        <div key={s.name} className="flex justify-between gap-4">
          <span>{s.name}</span>
          <span>{s.running ? "running…" : s.lastResult || "idle"} · runs: {s.runs}</span>
        </div>
      ))}
      <form action="/api/jobs/run" method="post" className="pt-2">
        <input type="hidden" name="job" value="all" />
        <button className="rounded bg-slate-900 text-white px-4 py-2 text-sm">Run all now</button>
      </form>
    </div>
  );
}