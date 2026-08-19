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

export async function getProducts(): Promise<ProductResponse[]> {
  const res = await fetch(`${API_URL}/api/products`, {
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Could not fetch products");
  }

  return res.json();
}