import { db, products } from "@Productlytics/db";
import express, { Router } from "express";
import { and, eq } from "drizzle-orm";

export const publicRouter = Router() as express.Router;

// No auth — anyone holding the link. Draft, unpublished, or unknown id all
// return the same 404 so outsiders can't probe what exists.
publicRouter.get("/:publicId", async (req, res) => {
  const { publicId } = req.params;

  const product = await db.query.products.findFirst({
    where: and(
      eq(products.publicId, publicId),
      eq(products.status, "published"),
    ),
  });

  if (!product) {
    res.status(404).json({ error: "Passport not found" });
    return;
  }

  // Explicit allowlist — brief: no internal/cross-org info in the public response.
  res.json({
    name: product.name,
    sku: product.sku,
    category: product.category,
    countryOfOrigin: product.countryOfOrigin,
    manufacturedOn: product.manufacturedOn,
    attributes: product.attributes,
  });
});
