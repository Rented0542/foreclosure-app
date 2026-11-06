import * as cheerio from "cheerio";

export type ScrapedProperty = {
  source: string; externalId?: string; address: string; city?: string; state?: string; zip?: string;
  price?: number; beds?: number; baths?: number; sqft?: number; type?: string; status?: string;
  auctionDate?: string; url?: string; raw?: string;
};

export interface PropertySource {
  name: string;
  listUrls: () => string[];
  scrape: (url: string) => Promise<ScrapedProperty[]>;
}

// Generic HTML adapter: extracts data-* or common fields via cheerio selectors configurable.
export function parseGenericList(html: string, source: string, baseUrl: string): ScrapedProperty[] {
  const $ = cheerio.load(html);
  const out: ScrapedProperty[] = [];
  $("article, .listing, .property, li").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text.length < 20) return;
    const priceMatch = text.match(/\$[\d,]+/);
    const bedsMatch = text.match(/(\d+)\s*bed/i);
    const bathsMatch = text.match(/(\d+(?:\.\d+)?)\s*bath/i);
    const sqftMatch = text.match(/([\d,]+)\s*sq\s*ft/i);
    const addr = $(el).find("h2,h3,.address,[itemprop=streetAddress]").first().text().trim() || text.slice(0, 80);
    out.push({
      source,
      address: addr || "Unknown",
      price: priceMatch ? Number(priceMatch[0].replace(/[$,]/g, "")) : undefined,
      beds: bedsMatch ? Number(bedsMatch[1]) : undefined,
      baths: bathsMatch ? Number(bathsMatch[1]) : undefined,
      sqft: sqftMatch ? Number(sqftMatch[1].replace(/,/g, "")) : undefined,
      url: $(el).find("a").first().attr("href") ? new URL($(el).find("a").first().attr("href")!, baseUrl).href : undefined,
      raw: text.slice(0, 500),
    });
  });
  return out.slice(0, 50);
}

export const SOURCES: Record<string, { urls: string[] }> = {
  hud: { urls: ["https://www.hudhomestore.gov/"] },
  // County/regional sources added by user in data/config.yml
};

export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "foreclosure-ops/0.1 (+contact@example.com)" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}