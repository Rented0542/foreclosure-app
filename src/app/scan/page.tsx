import JobStatus from "@/components/JobStatus";

export default function ScanPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Scan (proactive background)</h1>
      <JobStatus />
      <p className="text-sm text-slate-600">
        The scheduler scans property sources every 30 min and buyer sources every 60 min automatically.
        No comma-separated URLs required.
      </p>
    </div>
  );
}