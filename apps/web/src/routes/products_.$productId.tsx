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
import { ArrowLeft } from "lucide-react";

import { getProduct, type ProductListResponse } from "@/api/products";
import { DeleteProduct } from "@/components/products/delete-product";

export const Route = createFileRoute("/products_/$productId")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
            <DeleteProduct
              id={p.id}
              name={p.name}
              onDeleted={() => navigate({ to: "/products" })}
            />
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
