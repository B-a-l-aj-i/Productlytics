import { db, products } from "@Productlytics/db";
import express, { Router } from "express";
import { and, desc, eq, ilike, or } from "drizzle-orm";
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

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  status: z.enum(["draft", "published"]).optional(),
  category: z.enum(["Battery", "Steel", "Textile"]).optional(),
});

productsRouter.get("/", requireAuth, async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }

  const { page, limit, search, status, category } = parsed.data;

  const conditions = [eq(products.orgId, req.user!.orgId)];
  if (search) {
    // Escape ilike wildcards so a literal "%" in the box can't match everything.
    const pattern = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
    conditions.push(or(ilike(products.name, pattern), ilike(products.sku, pattern))!);
  }
  if (status) {
    conditions.push(eq(products.status, status));
  }
  if (category) {
    conditions.push(eq(products.category, category));
  }
  const where = and(...conditions);

  const [data, total] = await Promise.all([
    db
      .select()
      .from(products)
      .where(where)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.$count(products, where),
  ]);

  res.json({ data, total, page, limit });
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

productsRouter.get("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const product = await db.query.products.findFirst({
    where: and(eq(products.id, id), eq(products.orgId, req.user!.orgId)),
  });

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(product);
});

productsRouter.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  // org filter in the WHERE = other org's id deletes nothing → 404
  const deleted = await db
    .delete(products)
    .where(and(eq(products.id, id), eq(products.orgId, req.user!.orgId)))
    .returning({ id: products.id });

  if (deleted.length === 0) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.status(204).end();
});

// Postgres unique_violation; drizzle may wrap the pg error in `cause`.
function isUniqueViolation(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const code =
    (err as { code?: string }).code ??
    (err as { cause?: { code?: string } }).cause?.code;
  return code === "23505";
}
