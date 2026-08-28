import { cookies } from "next/headers";

const SU_COOKIE_NAME = "su_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

function getSecret(): string {
  return process.env.SU_SESSION_SECRET || "shehzad-su-default-fallback-secret-2026";
}

export function getExpectedCredentials() {
  return {
    username: process.env.SU_USERNAME || "shehzad",
    password: process.env.SU_PASSWORD || "shehzad@admin2026",
  };
}

/**
 * Creates an HMAC-SHA256 signed session token.
 * Format: `username.expiresAt.signatureHex`
 */
export async function createSessionToken(username: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${username}.${expiresAt}`;
  const secretKey = getSecret();

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(payload)
  );

  const signatureHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${payload}.${signatureHex}`;
}

/**
 * Verifies the HMAC-SHA256 session token and checks expiration.
 */
export async function verifySessionToken(token: string | undefined | null): Promise<{
  valid: boolean;
  username?: string;
}> {
  if (!token) return { valid: false };

  const parts = token.split(".");
  if (parts.length !== 3) return { valid: false };

  const [username, expiresAtStr, signatureHex] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);

  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return { valid: false };
  }

  const payload = `${username}.${expiresAtStr}`;
  const secretKey = getSecret();
  const enc = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  // Convert hex back to Uint8Array
  const sigMatch = signatureHex.match(/.{1,2}/g);
  if (!sigMatch) return { valid: false };
  const signatureBytes = new Uint8Array(
    sigMatch.map((byte) => parseInt(byte, 16))
  );

  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    enc.encode(payload)
  );

  if (!isValid) return { valid: false };

  return { valid: true, username };
}

/**
 * Helper to get the current session in server components or route handlers.
 */
export async function getSuSession(): Promise<{
  authenticated: boolean;
  username?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SU_COOKIE_NAME)?.value;
    const { valid, username } = await verifySessionToken(token);
    return { authenticated: valid, username };
  } catch {
    return { authenticated: false };
  }
}

export { SU_COOKIE_NAME, SESSION_MAX_AGE };
