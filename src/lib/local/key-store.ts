import "server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { ProviderId } from "@/types/workspace";

type StoredProvider = {
  enabled: boolean;
  encryptedApiKey?: string;
  monthlyTokenLimit: number;
};

type StoredKeys = Partial<Record<ProviderId, StoredProvider>>;

const dataDir = join(process.cwd(), ".local-data");
const keysPath = join(dataDir, "providers.json");
const secretPath = join(dataDir, "secret");

export function readLocalProviders(): StoredKeys {
  ensureDataDir();
  if (!existsSync(keysPath)) return {};
  return JSON.parse(readFileSync(keysPath, "utf8")) as StoredKeys;
}

export function saveLocalProvider(input: {
  providerId: ProviderId;
  enabled: boolean;
  apiKey?: string;
  monthlyTokenLimit: number;
}) {
  const current = readLocalProviders();
  const existing = current[input.providerId];
  current[input.providerId] = {
    enabled: input.enabled,
    encryptedApiKey: input.apiKey?.trim() ? encrypt(input.apiKey.trim()) : existing?.encryptedApiKey,
    monthlyTokenLimit: input.monthlyTokenLimit
  };
  writeJson(keysPath, current);
}

export function getLocalApiKey(providerId: ProviderId) {
  const envKey = envApiKey(providerId);
  if (envKey) return envKey;
  const encrypted = readLocalProviders()[providerId]?.encryptedApiKey;
  return encrypted ? decrypt(encrypted) : undefined;
}

export function hasLocalApiKey(providerId: ProviderId) {
  return Boolean(getLocalApiKey(providerId));
}

export function isLocalProviderEnabled(providerId: ProviderId, fallback: boolean) {
  return readLocalProviders()[providerId]?.enabled ?? fallback;
}

export function localMonthlyLimit(providerId: ProviderId, fallback: number) {
  return readLocalProviders()[providerId]?.monthlyTokenLimit ?? fallback;
}

function envApiKey(providerId: ProviderId) {
  const keys: Partial<Record<ProviderId, string | undefined>> = {
    openai: process.env.OPENAI_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY
  };
  return keys[providerId];
}

function ensureDataDir() {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  if (!existsSync(secretPath)) writeFileSync(secretPath, randomBytes(32).toString("hex"), { mode: 0o600 });
}

function encryptionKey() {
  ensureDataDir();
  return createHash("sha256").update(readFileSync(secretPath, "utf8")).digest();
}

function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decrypt(value: string) {
  const payload = Buffer.from(value, "base64");
  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(12, 28);
  const encrypted = payload.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

function writeJson(path: string, value: unknown) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
}
