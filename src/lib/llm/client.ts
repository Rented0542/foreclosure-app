import OpenAI from "openai";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export type LLMProvider = { name: string; baseUrl: string; apiKey: string; model: string };

// Free providers that allow commercial use (per awesome-free-llm-apis). Cohere trial excluded (non-commercial).
export const FREE_PROVIDERS: LLMProvider[] = [
  { name: "gemini", baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/", apiKey: process.env.GEMINI_API_KEY || "", model: "gemini-2.5-flash" },
  { name: "groq", baseUrl: "https://api.groq.com/openai/v1", apiKey: process.env.GROQ_API_KEY || "", model: "openai/gpt-oss-20b" },
  { name: "mistral", baseUrl: "https://api.mistral.ai/v1", apiKey: process.env.MISTRAL_API_KEY || "", model: "mistral-small-latest" },
  { name: "openrouter", baseUrl: "https://openrouter.ai/api/v1", apiKey: process.env.OPENROUTER_API_KEY || "", model: "google/gemma-4-31b-it:free" },
  { name: "nvidia", baseUrl: "https://integrate.api.nvidia.com/v1", apiKey: process.env.NVIDIA_API_KEY || "", model: "meta/llama-3.3-70b-instruct" },
];

const CACHE_DIR = join(process.cwd(), "data", ".llm-cache");

function cachePath(key: string) {
  mkdirSync(CACHE_DIR, { recursive: true });
  return join(CACHE_DIR, key + ".json");
}

export async function llmChat(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  opts: { temperature?: number; maxTokens?: number; json?: boolean } = {}
): Promise<string> {
  const cacheKey = createHash("sha256").update(JSON.stringify({ messages, opts })).digest("hex");
  const cp = cachePath(cacheKey);
  if (existsSync(cp)) {
    try { return JSON.parse(readFileSync(cp, "utf8")).content; } catch {}
  }

  const base = process.env.LLM_BASE_URL || "http://localhost:2099/v1";
  const key = process.env.LLM_API_KEY || "none";
  const providers: LLMProvider[] = [{ name: "gateway", baseUrl: base, apiKey: key, model: process.env.LLM_MODEL || "auto" }, ...FREE_PROVIDERS.filter(p => p.apiKey)];

  let lastErr: any;
  for (const p of providers) {
    try {
      const client = new OpenAI({ apiKey: p.apiKey || "none", baseURL: p.baseUrl });
      const res = await client.chat.completions.create({
        model: p.model,
        messages,
        temperature: opts.temperature ?? 0.2,
        max_tokens: opts.maxTokens ?? 1500,
        response_format: opts.json ? { type: "json_object" } : undefined,
      });
      const content = res.choices?.[0]?.message?.content || "";
      writeFileSync(cp, JSON.stringify({ content }));
      return content;
    } catch (e) {
      lastErr = e;
      continue;
    }
  }
  throw lastErr || new Error("No LLM provider available");
}

export async function llmJson<T>(messages: any[], opts: any = {}): Promise<T> {
  const raw = await llmChat(messages, { ...opts, json: true });
  try { return JSON.parse(raw) as T; } catch {
    // try extract json
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]) as T;
    throw new Error("LLM did not return JSON");
  }
}