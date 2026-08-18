import {
  char,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { organizations } from "./organizations";

export const productCategory = pgEnum("product_category", [
  "Battery",
  "Steel",
  "Textile",
]);

export const productStatus = pgEnum("product_status", ["draft", "published"]);

export const products = pgTable(
  "products",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    orgId: integer("org_id")
      .notNull()
      .references(() => organizations.id),
    name: text("name").notNull(),
    sku: text("sku").notNull(), // Stock Keeping Unit - unique identifier for the product
    category: productCategory("category"),
    manufacturedOn: date("manufactured_on"),
    countryOfOrigin: char("country_of_origin", { length: 2 }),
    status: productStatus("status").notNull().default("draft"),
    attributes: jsonb("attributes")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    unique("products_org_id_sku_unique").on(t.orgId, t.sku),
    index("products_org_id_idx").on(t.orgId),
  ],
);
