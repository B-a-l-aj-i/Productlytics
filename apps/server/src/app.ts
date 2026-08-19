import { env } from "@Productlytics/env/server";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { authRouter } from "./routes/auth";
import { documentsRouter } from "./routes/documents";
import { productsRouter } from "./routes/products";
import { publicRouter } from "./routes/public";

export const app = express() as express.Application;

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true, // cookies cross-origin (web :3001 → api :3000)
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/p", publicRouter);
app.use("/api", documentsRouter);
