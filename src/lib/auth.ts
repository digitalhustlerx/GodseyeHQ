// Minimal auth client for the Godseye account system.
// Talks to the same-origin /api/auth/* endpoints (proxied to the Node backend).

export interface User {
  id: number;
  email: string;
  name: string;
  plan: string;
  plan_id: string;
  credits_remaining: number;
  credits?: string;
}

export interface Subscription {
  plan: string;
  plan_id: string;
  credits_remaining: number;
  referral_discount?: number;
  referral_discount_label?: string | null;
  rewards?: Reward[];
}

export interface Reward {
  kind: string;
  label: string;
  status: string;
}

export interface AccountData {
  user: User;
  subscription: Subscription;
  next_step: string;
}

async function jsonFetch(url: string, options?: RequestInit): Promise<any> {
  const res = await fetch(url, {
    credentials: "same-origin",
    headers: options?.body ? { "Content-Type": "application/json" } : undefined,
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    (err as any).status = res.status;
    throw err;
  }
  return data;
}

export async function getMe(): Promise<User | null> {
  try {
    const data = await jsonFetch("/api/auth/me");
    return data.user || null;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<User> {
  const data = await jsonFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data.user;
}

export async function register(email: string, password: string, name: string, referralCode?: string, bonusChoice?: "memory" | "context"): Promise<User> {
  const data = await jsonFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name, referralCode, bonusChoice }),
  });
  return data.user;
}

export async function logout(): Promise<void> {
  await jsonFetch("/api/auth/logout", { method: "POST" });
}

export async function getAccount(): Promise<AccountData> {
  return jsonFetch("/api/account");
}
