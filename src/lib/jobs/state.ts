export type JobStatus = {
  name: string;
  running: boolean;
  lastRun: string | null;
  lastResult: string | null;
  lastError: string | null;
  runs: number;
};

const g = globalThis as any;
if (!g.__jobState) g.__jobState = new Map<string, JobStatus>();
export const jobState: Map<string, JobStatus> = g.__jobState;

export function getStatus(name: string): JobStatus {
  if (!jobState.has(name)) jobState.set(name, { name, running: false, lastRun: null, lastResult: null, lastError: null, runs: 0 });
  return jobState.get(name)!;
}