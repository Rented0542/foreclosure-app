import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const DATA_ROOT = join(process.cwd(), "data");

export function ensureDir(p: string) { mkdirSync(p, { recursive: true }); }

export function writeJsonFile(dir: string, id: string, obj: any) {
  ensureDir(dir);
  const tmp = join(dir, `.${id}.tmp`);
  writeFileSync(tmp, JSON.stringify(obj, null, 2));
  const final = join(dir, `${id}.json`);
  // atomic rename
  const { renameSync } = require("node:fs");
  renameSync(tmp, final);
}

export function readJsonFile(path: string): any | null {
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, "utf8")); } catch { return null; }
}

export function listJsonFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith(".json") && !f.startsWith("."));
}

export function newId() { return randomUUID(); }

export function dataPath(...parts: string[]) {
  return join(DATA_ROOT, ...parts);
}