"use client";

import { useActionState } from "react";
import { confess } from "./actions";

export function TruthForm({ maxLength }: { maxLength: number }) {
  const [error, action, pending] = useActionState(confess, null);

  return (
    <form
      action={action}
      className="rounded-2xl border border-hot/40 bg-surface-strong/80 p-6"
    >
      <label htmlFor="body" className="font-display text-xl italic">
        Share a Horny Truth
      </label>
      <p className="mt-1 text-sm text-muted">
        It&apos;s anonymous. Nobody will know it was you.
      </p>
      <textarea
        id="body"
        name="body"
        required
        rows={4}
        maxLength={maxLength}
        placeholder="Go on, confess…"
        className="mt-4 w-full resize-y rounded-xl border border-line bg-background px-4 py-3 leading-relaxed outline-none placeholder:text-muted/50 focus:border-hot"
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-hot-soft">
          {error}
        </p>
      )}
      <div className="mt-4 flex justify-end">
        <button
          disabled={pending}
          className="rounded-full bg-gradient-to-r from-crimson to-hot px-6 py-2.5 font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Posting…" : "Confess"}
        </button>
      </div>
    </form>
  );
}
