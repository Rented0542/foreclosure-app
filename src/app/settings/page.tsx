export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="rounded border bg-white p-4 space-y-2">
        <p className="text-sm">Configure via <code>.env</code>. LLM base URL, provider keys, DB URL, outreach creds.</p>
        <form action="/api/llm/test" method="post">
          <button className="rounded bg-slate-900 text-white px-4 py-2 text-sm">Test LLM connection</button>
        </form>
      </div>
      <div className="rounded border bg-white p-4 space-y-2 text-sm">
        <h2 className="font-semibold">Compliance notes</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Outreach defaults to dry-run; real sends require consent + human approval.</li>
          <li>DNC flag enforced in matching and outreach.</li>
          <li>Only free LLM providers allowing commercial use are in the default set.</li>
        </ul>
      </div>
    </div>
  );
}