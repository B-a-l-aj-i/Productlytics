import { API_URL } from "@/constant";

export interface LoginInput {
  email: string;
  password: string;
}

export interface MeResponse {
  id: number;
  email: string;
  orgId: number;
}

export async function login(data: LoginInput): Promise<MeResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Could not log in");
  }

  return res.json();
}

export async function logout(): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Could not log out");
  }
}

export async function getMe(): Promise<MeResponse> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Not authenticated");
  }

  return res.json();
}
