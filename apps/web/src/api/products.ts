import { API_URL } from "@/constant";

export interface CreateProductInput {
  name: string;
  sku: string;
  category?: "Battery" | "Steel" | "Textile";
  manufactured_on?: string; // YYYY-MM-DD
  country_of_origin?: string; // ISO 3166-1 alpha-2
  attributes?: Record<string, string>;
}

export interface ProductResponse {
  id: number;
  orgId: number;
  name: string;
  sku: string;
  category: "Battery" | "Steel" | "Textile" | null;
  manufacturedOn: string | null;
  countryOfOrigin: string | null;
  status: "draft" | "published";
  attributes: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export async function createProduct(
  data: CreateProductInput,
): Promise<ProductResponse> {
  const res = await fetch(`${API_URL}/api/products`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Could not create product");
  }

  return res.json();
}

export interface ProductListResponse {
  data: ProductResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "draft" | "published";
  category?: "Battery" | "Steel" | "Textile";
}

export async function getProducts({
  page = 1,
  limit = 20,
  search,
  status,
  category,
}: ProductListParams = {}): Promise<ProductListResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  if (category) params.set("category", category);

  const res = await fetch(`${API_URL}/api/products?${params}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Could not fetch products");
  }

  return res.json();
}