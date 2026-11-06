export default function ScanPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Scan</h1>
      <div className="grid grid-cols-2 gap-4">
        <form action="/api/scan/properties" method="post" className="rounded border bg-white p-4 space-y-2">
          <h2 className="font-semibold">Scan properties</h2>
          <input name="urls" placeholder="Comma-separated URLs (optional)" className="border p-2 rounded w-full" />
          <button className="rounded bg-slate-900 text-white px-4 py-2 text-sm">Run</button>
        </form>
        <form action="/api/scan/buyers" method="post" className="rounded border bg-white p-4 space-y-2">
          <h2 className="font-semibold">Scan buyers (Reddit)</h2>
          <input name="subs" placeholder="subreddits comma-separated (default: FirstTimeHomeBuyer,RealEstate)" className="border p-2 rounded w-full" />
          <button className="rounded bg-slate-900 text-white px-4 py-2 text-sm">Run</button>
        </form>
      </div>
      <p className="text-sm text-slate-600">Scans run synchronously for v1; may take a minute. Check Properties/Prospects after.</p>
    </div>
  );
}