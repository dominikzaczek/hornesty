"use client";

import { useOptimistic } from "react";
import { toggleHeart } from "./actions";

type HeartState = { votes: number; voted: boolean };

export function HeartButton({
  truthId,
  votes,
  voted,
}: HeartState & { truthId: number }) {
  const [state, toggleOptimistic] = useOptimistic<HeartState, void>(
    { votes, voted },
    (current) => ({
      voted: !current.voted,
      votes: current.votes + (current.voted ? -1 : 1),
    }),
  );

  return (
    <form
      action={async () => {
        toggleOptimistic();
        await toggleHeart(truthId);
      }}
    >
      <button
        aria-pressed={state.voted}
        aria-label={state.voted ? "Take back your heart" : "Give it a heart"}
        className={`group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition hover:bg-hot/10 ${
          state.voted ? "text-hot" : "text-muted hover:text-hot-soft"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={`h-5 w-5 transition-transform group-active:scale-125 ${
            state.voted ? "fill-current" : "fill-none"
          }`}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinejoin="round"
        >
          <path d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.6 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.6 0 5.8 3.6 4.5 7.1-1.8 4.8-9.3 9.4-9.3 9.4Z" />
        </svg>
        <span className="tabular-nums">{state.votes}</span>
      </button>
    </form>
  );
}
