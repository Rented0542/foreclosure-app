export type ScrapedProperty = {
  source: string; externalId?: string; address: string; city?: string; state?: string; zip?: string;
  price?: number; beds?: number; baths?: number; sqft?: number; type?: string; status?: string;
  auctionDate?: string; url?: string; raw?: string;
};

export async function scrapeHud(max = 300): Promise<ScrapedProperty[]> {
  const out: ScrapedProperty[] = [];
  let offset = 0;
  const page = 100;
  while (offset < max) {
    const url = `https://egis.hud.gov/arcgis/rest/services/cpdmaps/HudSfReo/MapServer/1/query?where=1%3D1&outFields=CASE_NUM,STREET_NUM,DIRECTION_PREFIX,STREET_NAME,CITY,STATE_CODE,DISPLAY_ZIP_CODE&returnGeometry=false&f=json&resultRecordCount=${page}&resultOffset=${offset}`;
    const res = await fetch(url, { headers: { "User-Agent": "foreclosure-ops/0.1" } });
    if (!res.ok) break;
    const j = await res.json();
    const feats = j.features || [];
    if (!feats.length) break;
    for (const f of feats) {
      const a = f.attributes;
      const address = [a.STREET_NUM, a.DIRECTION_PREFIX, a.STREET_NAME].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
      const caseNum = a.CASE_NUM;
      out.push({
        source: "hud",
        externalId: caseNum,
        address: address || "Unknown",
        city: a.CITY,
        state: a.STATE_CODE,
        zip: a.DISPLAY_ZIP_CODE ? String(a.DISPLAY_ZIP_CODE) : undefined,
        status: "available",
        url: caseNum ? `https://www.hudhomestore.gov/propertydetails?caseNumber=${caseNum}` : undefined,
        raw: `HUD REO case ${caseNum}`,
      });
    }
    offset += feats.length;
    if (feats.length < page) break;
  }
  return out;
}

export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "foreclosure-ops/0.1 (+contact@example.com)" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

// Generic fallback (kept for user-supplied URLs)
export function parseGenericList(html: string, source: string, baseUrl: string): ScrapedProperty[] {
  // unchanged minimal
  return [];
}