import { Button } from "@Productlytics/ui/components/button";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

import { getProducts } from "@/api/products";
import { CreateProduct } from "@/components/products/create-product";
import { Pagination } from "@/components/products/pagination";
import { ProductCard } from "@/components/products/product-card";

export const Route = createFileRoute("/products")({
  component: RouteComponent,
});

function RouteComponent() {
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);

  const list = useQuery({
    queryKey: ["products", page],
    queryFn: () => getProducts(page),
  });

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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.data?.data.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {list.data && (
        <Pagination
          page={page}
          total={list.data.total}
          limit={list.data.limit}
          onChange={setPage}
        />
      )}
    </div>
  );
}
