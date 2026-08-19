import { randomUUID } from "node:crypto";

import { db, documents, products } from "@Productlytics/db";
import { and, eq } from "drizzle-orm";
import express, { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";

import { requireAuth, SESSION_COOKIE, verifySession } from "../lib/session";
import { storage } from "../lib/storage";

// Brief: PDF, PNG or JPG, max 5 MB each.
const ALLOWED_MIME: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/png": ".png",
  "image/jpeg": ".jpg",
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype in ALLOWED_MIME);
  },
});

export const documentsRouter = Router() as express.Router;

// Upload one file to a product the session's org owns.
documentsRouter.post(
  "/products/:id/documents",
  requireAuth,
  upload.single("file"),
  async (req, res) => {
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

    // Missing here = either no file sent or fileFilter rejected the mime type.
    if (!req.file) {
      res.status(400).json({ error: "File missing or not PDF/PNG/JPG" });
      return;
    }

    const key = randomUUID() + ALLOWED_MIME[req.file.mimetype];
    await storage.put(key, req.file.buffer);

    const [doc] = await db
      .insert(documents)
      .values({
        productId: product.id,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        storageKey: key,
      })
      .returning();

    res.status(201).json(doc);
  },
);

// List a product's documents (own org only).
documentsRouter.get("/products/:id/documents", requireAuth, async (req, res) => {
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

  const docs = await db.query.documents.findMany({
    where: eq(documents.productId, product.id),
  });
  res.json(docs);
});

// Serve file bytes. Allowed for the owning org's session, or for anyone
// while the product is published (passport pages link here).
documentsRouter.get("/documents/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid document id" });
    return;
  }

  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, id),
  });
  const product = doc
    ? await db.query.products.findFirst({ where: eq(products.id, doc.productId) })
    : undefined;

  const token: string | undefined = req.cookies?.[SESSION_COOKIE];
  const user = token ? verifySession(token) : null;
  const allowed =
    product &&
    ((user && user.orgId === product.orgId) || product.status === "published");

  if (!doc || !allowed) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  const bytes = await storage.get(doc.storageKey);
  res.setHeader("Content-Type", doc.mimeType);
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${doc.originalFilename.replace(/"/g, "")}"`,
  );
  res.send(bytes);
});

// Multer errors (e.g. file over 5 MB) → 400 instead of a 500 stack trace.
documentsRouter.use(
  (err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE" ? "File exceeds 5 MB limit" : err.message;
      res.status(400).json({ error: message });
      return;
    }
    next(err);
  },
);
