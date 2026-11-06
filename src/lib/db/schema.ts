import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("member"),
  teamId: text("team_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const properties = sqliteTable("properties", {
  id: text("id").primaryKey(),
  source: text("source").notNull(),
  externalId: text("external_id"),
  address: text("address").notNull(),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  price: real("price"),
  beds: real("beds"),
  baths: real("baths"),
  sqft: real("sqft"),
  type: text("type"),
  status: text("status"),
  auctionDate: text("auction_date"),
  url: text("url"),
  raw: text("raw"),
  reviewStatus: text("review_status").notNull().default("unreviewed"),
  reviewedBy: text("reviewed_by"),
  notes: text("notes"),
  firstSeen: integer("first_seen", { mode: "timestamp" }).notNull(),
  lastSeen: integer("last_seen", { mode: "timestamp" }).notNull(),
});

export const prospects = sqliteTable("prospects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  handle: text("handle"),
  contactChannel: text("contact_channel"),
  contactValue: text("contact_value"),
  source: text("source").notNull(),
  intentSummary: text("intent_summary"),
  budgetMin: real("budget_min"),
  budgetMax: real("budget_max"),
  targetCities: text("target_cities"),
  consentStatus: text("consent_status").notNull().default("unknown"),
  consentAt: integer("consent_at", { mode: "timestamp" }),
  doNotContact: integer("do_not_contact", { mode: "boolean" }).notNull().default(false),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const matches = sqliteTable("matches", {
  id: text("id").primaryKey(),
  propertyId: text("property_id").notNull(),
  prospectId: text("prospect_id").notNull(),
  score: real("score").notNull(),
  reasons: text("reasons"),
  status: text("status").notNull().default("suggested"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const outreach = sqliteTable("outreach", {
  id: text("id").primaryKey(),
  prospectId: text("prospect_id").notNull(),
  channel: text("channel").notNull(),
  message: text("message").notNull(),
  sentAt: integer("sent_at", { mode: "timestamp" }),
  providerMsgId: text("provider_msg_id"),
  deliveryStatus: text("delivery_status"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const scans = sqliteTable("scans", {
  id: text("id").primaryKey(),
  source: text("source").notNull(),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  finishedAt: integer("finished_at", { mode: "timestamp" }),
  itemsFound: integer("items_found").notNull().default(0),
  itemsNew: integer("items_new").notNull().default(0),
  error: text("error"),
});

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  entity: text("entity"),
  metadata: text("metadata"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});