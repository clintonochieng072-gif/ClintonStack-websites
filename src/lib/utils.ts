import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  // Use NEXTAUTH_URL if defined
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // Check if we're on the client side
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Server-side: Check if we're in production on Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Default to localhost for development
  return "http://localhost:3000";
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

export async function apiPut(path: string, body: any) {
  const res = await fetch(path, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API PUT ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function apiPost(path: string, body: any) {
  const res = await fetch(path, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API POST ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export function generateClientId() {
  return "CLIENT-" + nanoid(10).toUpperCase();
}

export function generateReferralCode() {
  return "AFF-" + nanoid(10).toUpperCase();
}
