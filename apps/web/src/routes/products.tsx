import { Button } from "@Productlytics/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyTitle,
} from "@Productlytics/ui/components/empty";
import { Skeleton } from "@Productlytics/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

import { getProducts } from "@/api/products";
import { CreateProduct } from "@/components/products/create-product";
import { ProductCard } from "@/components/products/product-card";

export const Route = createFileRoute("/products")({
  component: RouteComponent,
});

function RouteComponent() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          <Plus data-icon="inline-start" />
          Create Product
        </Button>
      </div>

      {showForm && (
        <div className="mt-4">
          <CreateProduct onDone={() => setShowForm(false)} />
        </div>
      )}

      <ProductList />
    </div>
  );
}

function ProductList() {
  const list = useQuery({ queryKey: ["products"], queryFn: getProducts });

  if (list.isPending) {
    return (
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (list.isError) {
    return <p className="mt-6 text-sm text-destructive">{list.error.message}</p>;
  }

  if (list.data.length === 0) {
    return (
      <Empty className="mt-6">
        <EmptyTitle>No products yet</EmptyTitle>
        <EmptyDescription>Create your first product to see it here.</EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
