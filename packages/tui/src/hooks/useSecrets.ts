import { useCallback, useEffect } from "react";
import { create } from "zustand";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

export interface Secret {
  key: string;
  value: string;
  createdAt: number;
  updatedAt: number;
}

interface SecretsState {
  secrets: Secret[];
  loaded: boolean;
  setSecrets: (secrets: Secret[]) => void;
  setLoaded: (loaded: boolean) => void;
}

export const useSecretsStore = create<SecretsState>((set) => ({
  secrets: [],
  loaded: false,
  setSecrets: (secrets) => set({ secrets }),
  setLoaded: (loaded) => set({ loaded }),
}));

const SECRETS_DIR = path.join(os.homedir(), ".vibewithme");
const SECRETS_FILE = path.join(SECRETS_DIR, "secrets.enc");
const KEY_FILE = path.join(SECRETS_DIR, "secrets.key");

function getEncryptionKey(): Buffer {
  if (fs.existsSync(KEY_FILE)) {
    return Buffer.from(fs.readFileSync(KEY_FILE, "utf-8"), "hex");
  }
  // Generate a new key
  const key = crypto.randomBytes(32);
  if (!fs.existsSync(SECRETS_DIR)) {
    fs.mkdirSync(SECRETS_DIR, { recursive: true, mode: 0o700 });
  }
  fs.writeFileSync(KEY_FILE, key.toString("hex"), { mode: 0o600 });
  return key;
}

function encrypt(data: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(data, "utf-8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

function decrypt(data: string): string {
  const key = getEncryptionKey();
  const [ivHex, authTagHex, encrypted] = data.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}

function loadSecretsFromDisk(): Secret[] {
  try {
    if (!fs.existsSync(SECRETS_FILE)) return [];
    const raw = fs.readFileSync(SECRETS_FILE, "utf-8");
    const json = decrypt(raw);
    return JSON.parse(json);
  } catch {
    return [];
  }
}

function saveSecretsToDisk(secrets: Secret[]): void {
  if (!fs.existsSync(SECRETS_DIR)) {
    fs.mkdirSync(SECRETS_DIR, { recursive: true, mode: 0o700 });
  }
  const json = JSON.stringify(secrets);
  const encrypted = encrypt(json);
  fs.writeFileSync(SECRETS_FILE, encrypted, { mode: 0o600 });
}

export function useSecrets() {
  const { secrets, loaded, setSecrets, setLoaded } = useSecretsStore();

  // Load on first use
  useEffect(() => {
    if (!loaded) {
      const stored = loadSecretsFromDisk();
      setSecrets(stored);
      setLoaded(true);
    }
  }, [loaded, setSecrets, setLoaded]);

  const addSecret = useCallback(
    (key: string, value: string) => {
      const now = Date.now();
      const existing = secrets.findIndex((s) => s.key === key);
      let next: Secret[];
      if (existing >= 0) {
        next = [...secrets];
        next[existing] = { key, value, createdAt: next[existing].createdAt, updatedAt: now };
      } else {
        next = [...secrets, { key, value, createdAt: now, updatedAt: now }];
      }
      setSecrets(next);
      saveSecretsToDisk(next);
    },
    [secrets, setSecrets],
  );

  const removeSecret = useCallback(
    (key: string) => {
      const next = secrets.filter((s) => s.key !== key);
      setSecrets(next);
      saveSecretsToDisk(next);
    },
    [secrets, setSecrets],
  );

  const getSecretValue = useCallback(
    (key: string): string | undefined => {
      return secrets.find((s) => s.key === key)?.value;
    },
    [secrets],
  );

  // Get all secrets as env vars (for injecting into Claude sessions)
  const getEnvVars = useCallback((): Record<string, string> => {
    const env: Record<string, string> = {};
    for (const s of secrets) {
      env[s.key] = s.value;
    }
    return env;
  }, [secrets]);

  // Export as .env format
  const toEnvFile = useCallback((): string => {
    return secrets.map((s) => `${s.key}=${s.value}`).join("\n") + "\n";
  }, [secrets]);

  return { secrets, addSecret, removeSecret, getSecretValue, getEnvVars, toEnvFile };
}
