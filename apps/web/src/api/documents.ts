import { API_URL } from "@/constant";

export interface DocumentResponse {
  id: number;
  productId: number;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

// Browser opens this directly — cookie rides along for private products,
// published products serve to anyone.
export function documentUrl(id: number): string {
  return `${API_URL}/api/documents/${id}`;
}

export async function listDocuments(productId: number): Promise<DocumentResponse[]> {
  const res = await fetch(`${API_URL}/api/products/${productId}/documents`, {
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Could not fetch documents");
  }

  return res.json();
}

export async function uploadDocument(
  productId: number,
  file: File,
): Promise<DocumentResponse> {
  const formData = new FormData();
  formData.append("file", file);

  // No Content-Type header — the browser sets multipart boundaries itself.
  const res = await fetch(`${API_URL}/api/products/${productId}/documents`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Could not upload document");
  }

  return res.json();
}
