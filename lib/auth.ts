import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "hornesty_member";
const ONE_YEAR = 60 * 60 * 24 * 365;

// The cookie holds a hash of the password, so changing PASSWORD in .env
// kicks everyone out without needing a session store.
function memberToken() {
  return createHash("sha256")
    .update(`hornesty-club:${process.env.PASSWORD ?? ""}`)
    .digest("hex");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function isCorrectPassword(input: string) {
  const password = process.env.PASSWORD;
  if (!password) return false;
  return safeEqual(input, password);
}

export async function isMember() {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  return value !== undefined && safeEqual(value, memberToken());
}

export async function grantMembership() {
  (await cookies()).set(COOKIE_NAME, memberToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR,
    path: "/",
  });
}

export async function revokeMembership() {
  (await cookies()).delete(COOKIE_NAME);
}
