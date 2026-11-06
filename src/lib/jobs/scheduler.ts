import cron from "node-cron";
import { runPropertyScan, runBuyerScan, runMatching } from "./runner";

const g = globalThis as any;
export function startScheduler() {
  if (g.__schedulerStarted) return;
  g.__schedulerStarted = true;
  // proactive background scans (Tranchi-style)
  cron.schedule("*/30 * * * *", () => { runPropertyScan().then(() => runMatching()).catch(() => {}); });
  cron.schedule("*/60 * * * *", () => { runBuyerScan().then(() => runMatching()).catch(() => {}); });
  // initial run shortly after boot
  setTimeout(() => { runPropertyScan().then(() => runBuyerScan()).then(() => runMatching()).catch(() => {}); }, 5000);
  console.log("[scheduler] started proactive background scans");
}