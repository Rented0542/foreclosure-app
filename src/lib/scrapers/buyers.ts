import { llmJson } from "@/lib/llm/client";

export type ScrapedProspect = {
  name: string; handle?: string; source: string; contactChannel?: string; contactValue?: string;
  intentSummary?: string; budgetMin?: number; budgetMax?: number; targetCities?: string;
};

// Reddit public JSON (no auth) for housing intent. Respect rate limits.
export async function scrapeReddit(subs: string[]): Promise<ScrapedProspect[]> {
  const out: ScrapedProspect[] = [];
  for (const sub of subs) {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/new.json?limit=25`, {
        headers: { "User-Agent": "foreclosure-ops/0.1" },
      });
      if (!res.ok) continue;
      const j = await res.json();
      const posts = j?.data?.children || [];
      for (const p of posts) {
        const d = p.data;
        const text = `${d.title}\n${d.selftext || ""}`.slice(0, 2000);
        try {
          const parsed = await llmJson<any>([
            { role: "system", content: "Extract buyer intent. Return JSON with fields: isBuyerIntent (boolean), budgetMin, budgetMax, targetCities (string), summary (string). If not buyer intent, isBuyerIntent false." },
            { role: "user", content: text },
          ]);
          if (!parsed.isBuyerIntent) continue;
          out.push({
            name: d.author || "reddit-user",
            handle: `u/${d.author}`,
            source: `reddit:r/${sub}`,
            intentSummary: parsed.summary || d.title,
            budgetMin: parsed.budgetMin,
            budgetMax: parsed.budgetMax,
            targetCities: parsed.targetCities,
          });
        } catch {
          // skip
        }
      }
    } catch {
      // skip subreddit
    }
  }
  return out;
}

// Craigslist "housing wanted" RSS (public)
export async function scrapeCraigslist(city: string): Promise<ScrapedProspect[]> {
  const out: ScrapedProspect[] = [];
  try {
    const res = await fetch(`https://${city}.craigslist.org/search/hhh?format=rss`, { headers: { "User-Agent": "foreclosure-ops/0.1" } });
    if (!res.ok) return out;
    const xml = await res.text();
    const titles = [...xml.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g)].map(m => m[1]);
    for (const t of titles.slice(0, 25)) {
      out.push({ name: "craigslist-poster", source: `craigslist:${city}`, intentSummary: t });
    }
  } catch {}
  return out;
}