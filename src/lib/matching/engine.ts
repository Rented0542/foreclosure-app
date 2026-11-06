import { llmJson } from "@/lib/llm/client";

export type Property = {
  id: string; address: string; city?: string | null; state?: string | null; zip?: string | null;
  price?: number | null; beds?: number | null; baths?: number | null; sqft?: number | null;
  type?: string | null; status?: string | null; notes?: string | null;
};

export type Prospect = {
  id: string; name: string; intentSummary?: string | null; budgetMin?: number | null; budgetMax?: number | null;
  targetCities?: string | null; notes?: string | null; doNotContact?: boolean;
};

export function hardFilter(p: Property, b: Prospect): { ok: boolean; reason?: string } {
  if (b.doNotContact) return { ok: false, reason: "do-not-contact" };
  if (b.budgetMax && p.price && p.price > b.budgetMax * 1.15) return { ok: false, reason: "over budget" };
  if (b.budgetMin && p.price && p.price < b.budgetMin * 0.6) return { ok: false, reason: "under budget" };
  if (b.targetCities && p.city) {
    const cities = b.targetCities.toLowerCase().split(/[;,]/).map(s => s.trim()).filter(Boolean);
    if (cities.length && !cities.some(c => (p.city || "").toLowerCase().includes(c) || (p.state || "").toLowerCase() === c)) {
      // allow state-level match loosely
    }
  }
  return { ok: true };
}

export async function scoreMatch(property: Property, prospect: Prospect): Promise<{ score: number; reasons: string[]; recommendation: string }> {
  const prompt = `You are a real-estate matching assistant. Score how well this foreclosed property fits this buyer prospect from 0 to 100.
Return JSON: {"score": number, "reasons": string[], "recommendation": "pursue"|"maybe"|"skip"}.
Property: ${JSON.stringify(property)}
Prospect: ${JSON.stringify(prospect)}`;
  try {
    const r = await llmJson<{ score: number; reasons: string[]; recommendation: string }>([
      { role: "system", content: "You output only JSON." },
      { role: "user", content: prompt },
    ]);
    return { score: Math.max(0, Math.min(100, Number(r.score) || 0)), reasons: r.reasons || [], recommendation: r.recommendation || "maybe" };
  } catch {
    // fallback heuristic
    let score = 50;
    if (property.price && prospect.budgetMax && property.price <= prospect.budgetMax) score += 20;
    if (property.beds && property.beds >= 3) score += 5;
    return { score: Math.min(100, score), reasons: ["heuristic fallback (LLM unavailable)"], recommendation: score >= 70 ? "pursue" : "maybe" };
  }
}