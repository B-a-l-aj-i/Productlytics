import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

import * as schema from "./schema";

dotenv.config({ path: "../../apps/server/.env" });

const db = drizzle(process.env.DATABASE_URL ?? "", { schema });

// Documented in README — reviewers log in with these.
const SEED_PASSWORD = "password";

const CATEGORIES = ["Battery", "Steel", "Textile"] as const;

const NAMES: Record<(typeof CATEGORIES)[number], string[]> = {
  Battery: ["EV Pack 75", "Home Cell 10", "Grid Buffer 200", "Scooter Cell 2", "Drone Pack 0.5"],
  Steel: ["Beam S355", "Coil DC01", "Rebar B500", "Plate S235", "Tube E235"],
  Textile: ["Organic Tee", "Denim Roll", "Canvas 340", "Fleece Roll", "Linen Sheet"],
};

const ATTRIBUTES: Record<(typeof CATEGORIES)[number], Record<string, string>[]> = {
  Battery: [
    { cell_chemistry: "LFP", capacity_kwh: "75" },
    { cell_chemistry: "NMC", capacity_kwh: "10" },
  ],
  Steel: [
    { grade: "S355", recycled_content_pct: "42" },
    { grade: "DC01", coating: "zinc" },
  ],
  Textile: [
    { material: "organic cotton", gsm: "180" },
    { material: "linen", gsm: "220" },
  ],
};

const COUNTRIES = ["IN", "CN"];

async function main() {
  // Reset to a known state so the script is safe to re-run.
  await db.execute(
    sql`truncate table documents, products, users, organizations restart identity cascade`,
  );

  const [org1, org2] = await db
    .insert(schema.organizations)
    .values([{ name: "org_1" }, { name: "org_2" }])
    .returning();

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  await db.insert(schema.users).values([
    { orgId: org1.id, email: "user1@gmail.com", passwordHash },
    { orgId: org2.id, email: "user2@gmail.com", passwordHash },
  ]);

  const products: (typeof schema.products.$inferInsert)[] = [];

  for (const [orgIndex, org] of [org1, org2].entries()) {
    for (let i = 0; i < 15; i++) {
      const category = CATEGORIES[i % CATEGORIES.length];
      const names = NAMES[category];
      products.push({
        orgId: org.id,
        name: `${names[i % names.length]} ${Math.floor(i / names.length) + 1}`,
        // SKU-001..SKU-015 in BOTH orgs — proves uniqueness is per-org, per the brief.
        sku: `SKU-${String(i + 1).padStart(3, "0")}`,
        category,
        manufacturedOn: `2026-${String((i % 12) + 1).padStart(2, "0")}-15`,
        countryOfOrigin: COUNTRIES[(i + orgIndex) % COUNTRIES.length],
        status: i % 2 === 0 ? "published" : "draft",
        // Publishing normally mints publicId in the PATCH route; seeded
        // published rows need one too or their passport URLs don't exist.
        publicId: i % 2 === 0 ? randomUUID() : null,
        attributes: ATTRIBUTES[category][i % 2],
      });
    }
  }

  await db.insert(schema.products).values(products);

  console.log("Seeded: 2 organizations, 2 users, 30 products");
  console.log(`Logins: user1@gmail.com / ${SEED_PASSWORD}`);
  console.log(`        user2@gmail.com / ${SEED_PASSWORD}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
