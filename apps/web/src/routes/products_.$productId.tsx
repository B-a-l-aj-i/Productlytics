import { Button } from "@Productlytics/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@Productlytics/ui/components/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Copy, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ProductDocuments } from "@/components/products/documents";
import { EditProduct } from "@/components/products/edit-product";

import { getProduct, type ProductListResponse } from "@/api/products";
import { DeleteProduct } from "@/components/products/delete-product";

export const Route = createFileRoute("/products_/$productId")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const product = useQuery({
    queryKey: ["products", "detail", productId],
    queryFn: () => getProduct(Number(productId)),
    // Instant paint when arriving from the list: reuse the cached row while
    // the endpoint confirms. On refresh/direct URL the fetch is the source.
    placeholderData: () =>
      queryClient
        .getQueriesData<ProductListResponse>({ queryKey: ["products"] })
        .flatMap(([, list]) => list?.data ?? [])
        .find((p) => p.id === Number(productId)),
  });

  if (product.isPending) {
    return <p className="mx-auto max-w-3xl px-4 py-6 text-sm">Loading…</p>;
  }

  if (product.isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-sm text-destructive">{product.error.message}</p>
        <Link to="/products" className="text-sm underline">
          Back to products
        </Link>
      </div>
    );
  }

  const p = product.data;

  if (editing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <EditProduct product={p} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link
        to="/products"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Products
      </Link>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{p.name}</CardTitle>
          <CardDescription>{p.sku}</CardDescription>
          <CardAction>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Edit product"
                onClick={() => setEditing(true)}
              >
                <Pencil />
              </Button>
              <DeleteProduct
                id={p.id}
                name={p.name}
                onDeleted={() => navigate({ to: "/products" })}
              />
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <Row label="Status" value={p.status} />
          <Row label="Category" value={p.category ?? "—"} />
          <Row label="Country of origin" value={p.countryOfOrigin ?? "—"} />
          <Row label="Manufactured on" value={p.manufacturedOn ?? "—"} />
          <div className="mt-2">
            <p className="mb-1 text-muted-foreground">Attributes</p>
            {Object.keys(p.attributes).length === 0 ? (
              <p>—</p>
            ) : (
              <div className="flex flex-col gap-1">
                {Object.entries(p.attributes).map(([key, value]) => (
                  <Row key={key} label={key} value={value} />
                ))}
              </div>
            )}
          </div>

          <ProductDocuments productId={p.id} />

          {p.status === "published" && p.publicId && (
            <div className="mt-2 flex items-center justify-between gap-2 border-t pt-3">
              <div className="min-w-0">
                <p className="text-muted-foreground">Public passport link</p>
                <p className="truncate text-xs">
                  {`${window.location.origin}/p/${p.publicId}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Copy public link"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/p/${p.publicId}`,
                  );
                  toast.success("Public link copied");
                }}
              >
                <Copy />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
