"use server";

import { refresh } from "next/cache";
import { headers } from "next/headers";
import {
  getOrCreateVoterId,
  grantMembership,
  isCorrectPassword,
  isMember,
  revokeMembership,
} from "@/lib/auth";
import { addTruth, MAX_TRUTH_LENGTH, toggleVote } from "@/lib/db";

export async function enterClub(_prev: string | null, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!isCorrectPassword(password)) {
    return "Wrong password, naughty. Try again.";
  }
  await grantMembership();
  refresh();
  return null;
}

export async function leaveClub() {
  await revokeMembership();
  refresh();
}

export async function confess(_prev: string | null, formData: FormData) {
  if (!(await isMember())) {
    return "You're not in the club. Refresh and enter the password.";
  }
  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return "Don't be shy, write something.";
  }
  await addTruth(body.slice(0, MAX_TRUTH_LENGTH), await clientIp());
  refresh();
  return null;
}

export async function toggleHeart(truthId: number) {
  if (!(await isMember()) || !Number.isInteger(truthId)) return;
  await toggleVote(truthId, await getOrCreateVoterId());
  refresh();
}

// Hosting proxies put the original client first in x-forwarded-for.
async function clientIp() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headerList.get("x-real-ip") || null;
}
