import { API_URL } from "@/constant";

export interface PassportResponse {
  name: string;
  sku: string;
  category: "Battery" | "Steel" | "Textile" | null;
  countryOfOrigin: string | null;
  manufacturedOn: string | null;
  attributes: Record<string, string>;
}

export async function getPassport(publicId: string): Promise<PassportResponse> {
  const res = await fetch(`${API_URL}/api/p/${publicId}`);

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Passport not found");
  }

  return res.json();
}
