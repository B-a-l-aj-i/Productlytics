import { Button } from "@Productlytics/ui/components/button";
import { Input } from "@Productlytics/ui/components/input";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

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
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  // Debounce typing → one request 300ms after the last keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const list = useQuery({
    queryKey: ["products", page, search, status, category],
    queryFn: () =>
      getProducts({
        page,
        search: search || undefined,
        status: (status || undefined) as "draft" | "published" | undefined,
        category: (category || undefined) as
          | "Battery"
          | "Steel"
          | "Textile"
          | undefined,
      }),
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

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Input
          className="max-w-xs"
          placeholder="Search name or SKU…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-xs outline-none"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="draft">draft</option>
          <option value="published">published</option>
        </select>
        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-xs outline-none"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All categories</option>
          <option value="Battery">Battery</option>
          <option value="Steel">Steel</option>
          <option value="Textile">Textile</option>
        </select>
      </div>


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
