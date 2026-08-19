ALTER TABLE "products" ADD COLUMN "public_id" text;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_public_id_unique" UNIQUE("public_id");