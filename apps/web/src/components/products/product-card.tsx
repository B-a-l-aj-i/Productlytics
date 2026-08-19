import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@Productlytics/ui/components/card";
import { Link } from "@tanstack/react-router";

import type { ProductResponse } from "@/api/products";
import { DeleteProduct } from "@/components/products/delete-product";

export function ProductCard({ product }: { product: ProductResponse }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link
            to="/products/$productId"
            params={{ productId: String(product.id) }}
            className="hover:underline"
          >
            {product.name}
          </Link>
        </CardTitle>
        <CardDescription>{product.sku}</CardDescription>
        <CardAction>
          <DeleteProduct id={product.id} name={product.name} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-xs">
        <Row label="Status">
          <span
            className={
              product.status === "published"
                ? "font-medium text-primary"
                : "text-muted-foreground"
            }
          >
            {product.status}
          </span>
        </Row>
        {product.category && <Row label="Category">{product.category}</Row>}
        {product.countryOfOrigin && (
          <Row label="Country">{product.countryOfOrigin}</Row>
        )}
        {product.manufacturedOn && (
          <Row label="Manufactured">{product.manufacturedOn}</Row>
        )}
        {Object.entries(product.attributes).map(([key, value]) => (
          <Row key={key} label={key}>
            {value}
          </Row>
        ))}
      </CardContent>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate">{children}</span>
    </div>
  );
}
