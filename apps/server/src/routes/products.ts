import { db, products } from "@Productlytics/db";
import express, { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { requireAuth } from "../lib/session";

const createProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.enum(["Battery", "Steel", "Textile"]).optional(),
  manufactured_on: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
    .optional(),
  country_of_origin: z
    .string()
    .regex(/^[A-Za-z]{2}$/, "Expected ISO 3166-1 alpha-2 code")
    .transform((s) => s.toUpperCase())
    .optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  attributes: z.record(z.string(), z.string()).default({}),
});

export const productsRouter = Router() as express.Router;

productsRouter.use(requireAuth);

productsRouter.get("/", requireAuth, async (req, res) => {
  const allProducts = await db
    .select()
    .from(products)
    .where(eq(products.orgId, req.user!.orgId));
  res.json(allProducts);
});

productsRouter.post("/", requireAuth, async (req, res) => {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    res.status(400).json({
      error: issue
        ? `${issue.path.join(".")}: ${issue.message}`
        : "Invalid request body",
    });
    return;
  }

  const input = parsed.data;
  try {
    const [product] = await db
      .insert(products)
      .values({
        orgId: req.user!.orgId,
        name: input.name,
        sku: input.sku,
        category: input.category,
        manufacturedOn: input.manufactured_on,
        countryOfOrigin: input.country_of_origin,
        status: input.status,
        attributes: input.attributes,
      })
      .returning();
    res.status(201).json(product);
  } catch (err) {
    if (isUniqueViolation(err)) {
      res
        .status(409)
        .json({ error: "SKU already exists in your organisation" });
      return;
    }
    throw err;
  }
});

// Postgres unique_violation; drizzle may wrap the pg error in `cause`.
function isUniqueViolation(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const code =
    (err as { code?: string }).code ??
    (err as { cause?: { code?: string } }).cause?.code;
  return code === "23505";
}
