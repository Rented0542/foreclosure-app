# Foreclosure Ops

Find foreclosed properties and match them to worthy buyers. Local-first, $0 LLM cost.

## Quick start
```bash
git clone <this-repo> && cd foreclosure-ops
npm install
cp .env.example .env   # add at least one free LLM key
npm run dev
```
Open http://localhost:3000.

## LLM routing ($0)
Uses an OpenAI-compatible endpoint (`LLM_BASE_URL`). Point it at a self-hosted
[Manifest](https://github.com/mnfst/manifest) gateway (MIT, commercial-safe) configured with
free providers from [awesome-free-llm-apis](https://github.com/mnfst/awesome-free-llm-apis),
or directly at Gemini/Groq/Mistral/etc. Free providers whose terms are non-commercial
(e.g. Cohere trial) are excluded by default.

## Where the data comes from
- Properties: HUD REO database via the public HUD ArcGIS REST service (real government-owned foreclosed homes), each with a link to the HUD Home Store property details page.
- Buyers: public Reddit/Craigslist intent posts (structured by LLM). No paid lead lists.

## Data sync
Local state lives in `data/` as JSON and is git-tracked, so a team can sync via
pull/push. For a shared portal, set `DATABASE_URL` (Postgres) and deploy via
`docker/docker-compose.yml`.

## Compliance
- Outreach defaults to dry-run; real sends require recorded consent + human approval.
- DNC flag enforced. Opt-out keywords handled.
- Only MIT/Apache/BSD deps (see `LICENSES.md`).
- Scraping respects robots.txt and documented per-source terms.

## Scripts
```bash
npm run scan:properties -- "https://example.com/listings"
npm run scrape:buyers -- "FirstTimeHomeBuyer,RealEstate"
npm run match
npm run data:export
```