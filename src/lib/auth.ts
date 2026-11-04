import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

// Admin login with a single username/password from environment variables:
//   ADMIN_USERNAME, ADMIN_PASSWORD, AUTH_SECRET (a long random string)
// A successful login stores a signed, expiring cookie. Changing the password
// or AUTH_SECRET signs everyone out.

const COOKIE = "library_admin";
const SESSION_DAYS = 30;

function config() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.AUTH_SECRET;
  if (!username || !password || !secret || secret.length < 32) return null;
  return { username, password, secret };
}

export function isAuthConfigured() {
  return config() !== null;
}

function sign(expires: number, cfg: NonNullable<ReturnType<typeof config>>) {
  return crypto
    .createHmac("sha256", cfg.secret)
    .update(`${cfg.username}\n${cfg.password}\n${expires}`)
    .digest("base64url");
}

function safeEqual(a: string, b: string) {
  // Hash first so the comparison is constant-time regardless of length.
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function checkCredentials(username: string, password: string) {
  const cfg = config();
  if (!cfg) return false;
  // Evaluate both so timing doesn't reveal which one was wrong.
  const userOk = safeEqual(username, cfg.username);
  const passOk = safeEqual(password, cfg.password);
  return userOk && passOk;
}

export async function startSession() {
  const cfg = config();
  if (!cfg) throw new Error("Admin login is not configured.");
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  (await cookies()).set(COOKIE, `${expires}.${sign(expires, cfg)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const cfg = config();
  if (!cfg) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  // The expiry check below reads the current time, so it must run at request
  // time, not while Next.js prerenders/prefetches the page shell.
  await connection();
  const [expiresRaw, signature] = value.split(".");
  const expires = Number(expiresRaw);
  if (!signature || !Number.isFinite(expires) || expires < Date.now()) return false;
  return safeEqual(signature, sign(expires, cfg));
}

/** Call at the top of every server action that changes data. */
export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("You need to sign in as admin to do that.");
}
