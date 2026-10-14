"use client";

import { useActionState } from "react";
import { enterClub } from "./actions";

export function PasswordGate() {
  const [error, action, pending] = useActionState(enterClub, null);

  return (
    <form
      action={action}
      className="mx-auto w-full max-w-sm rounded-2xl border border-line bg-surface/80 p-8 text-center"
    >
      <h2 className="font-display text-2xl italic">Whisper the password</h2>
      <p className="mt-2 text-sm text-muted">
        No password, no peeking.
      </p>
      <input
        type="password"
        name="password"
        required
        autoFocus
        autoComplete="current-password"
        placeholder="••••••••"
        aria-label="Password"
        className="mt-6 w-full rounded-full border border-line bg-background px-5 py-3 text-center outline-none placeholder:text-muted/50 focus:border-hot"
      />
      {error && (
        <p role="alert" className="mt-3 text-sm text-hot-soft">
          {error}
        </p>
      )}
      <button
        disabled={pending}
        className="mt-6 w-full rounded-full bg-gradient-to-r from-crimson to-hot px-5 py-3 font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Checking…" : "Let me in"}
      </button>
    </form>
  );
}
