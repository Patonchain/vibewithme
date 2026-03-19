import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CONFIG_DIR = path.join(os.homedir(), ".vibewithme");
const AUTH_FILE = path.join(CONFIG_DIR, "auth.json");

export interface AuthConfig {
  userId: string;
  name: string;
  email: string;
  color: string;
  accessToken: string;
  refreshToken: string;
  serverUrl: string;
}

export function getStoredAuth(): AuthConfig | null {
  try {
    if (!fs.existsSync(AUTH_FILE)) return null;
    const data = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
    return data as AuthConfig;
  } catch {
    return null;
  }
}

export function saveAuth(auth: AuthConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
  fs.writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2), { mode: 0o600 });
}

export function clearAuth(): void {
  try {
    fs.unlinkSync(AUTH_FILE);
  } catch {
    // ignore
  }
}

export async function registerUser(
  serverUrl: string,
  name: string,
  email: string,
  password: string,
): Promise<AuthConfig> {
  const res = await fetch(`${serverUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || `Registration failed (${res.status})`);
  }

  const data = (await res.json()) as any;
  const auth: AuthConfig = {
    userId: data.user.id,
    name: data.user.name,
    email: data.user.email,
    color: data.user.color,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    serverUrl,
  };
  saveAuth(auth);
  return auth;
}

export async function loginUser(
  serverUrl: string,
  email: string,
  password: string,
): Promise<AuthConfig> {
  const res = await fetch(`${serverUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || `Login failed (${res.status})`);
  }

  const data = (await res.json()) as any;
  const auth: AuthConfig = {
    userId: data.user.id,
    name: data.user.name,
    email: data.user.email,
    color: data.user.color,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    serverUrl,
  };
  saveAuth(auth);
  return auth;
}

export async function refreshAccessToken(auth: AuthConfig): Promise<string> {
  const res = await fetch(`${auth.serverUrl}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: auth.refreshToken }),
  });

  if (!res.ok) {
    throw new Error("Token refresh failed — please log in again");
  }

  const data = (await res.json()) as any;
  auth.accessToken = data.accessToken;
  saveAuth(auth);
  return data.accessToken;
}
