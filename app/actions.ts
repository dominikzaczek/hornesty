"use server";

import { refresh } from "next/cache";
import {
  grantMembership,
  isCorrectPassword,
  isMember,
  revokeMembership,
} from "@/lib/auth";
import { addTruth, MAX_TRUTH_LENGTH } from "@/lib/db";

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
  await addTruth(body.slice(0, MAX_TRUTH_LENGTH));
  refresh();
  return null;
}
