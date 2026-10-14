import { Suspense } from "react";
import { isMember } from "@/lib/auth";
import { listTruths, MAX_TRUTH_LENGTH, type HornyTruth } from "@/lib/db";
import { leaveClub } from "./actions";
import { PasswordGate } from "./password-gate";
import { TruthForm } from "./truth-form";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-24 pt-14 sm:pt-20">
      <header className="mb-12 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-hot-soft">
          Members only
        </p>
        <h1 className="font-display text-5xl italic leading-tight text-foreground sm:text-6xl">
          The <span className="text-hot">Hornesty</span> Club
        </h1>
        <p className="mt-4 text-muted">
          Anonymous. Unfiltered. Brutally, deliciously honest.
        </p>
      </header>

      <Suspense fallback={<Loading />}>
        <Club />
      </Suspense>
    </main>
  );
}

async function Club() {
  if (!(await isMember())) {
    return <PasswordGate />;
  }

  const truths = await listTruths();

  return (
    <>
      <TruthForm maxLength={MAX_TRUTH_LENGTH} />

      <section className="mt-14">
        <div className="mb-6 flex items-baseline justify-between border-b border-line pb-3">
          <h2 className="font-display text-2xl italic">The confessions</h2>
          <span className="text-sm text-muted">
            {truths.length} {truths.length === 1 ? "truth" : "truths"}
          </span>
        </div>

        {truths.length === 0 ? (
          <p className="py-12 text-center text-muted">
            Nobody&apos;s confessed yet. Be the first to get it off your chest.
          </p>
        ) : (
          <ol className="flex flex-col gap-5">
            {truths.map((truth) => (
              <TruthCard key={truth.id} truth={truth} />
            ))}
          </ol>
        )}
      </section>

      <form action={leaveClub} className="mt-16 text-center">
        <button className="text-sm text-muted underline-offset-4 hover:text-hot-soft hover:underline">
          Leave the club
        </button>
      </form>
    </>
  );
}

function TruthCard({ truth }: { truth: HornyTruth }) {
  return (
    <li className="rounded-2xl border border-line bg-surface/80 p-6 shadow-[0_10px_40px_-20px_rgba(255,46,126,0.45)]">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-lg italic text-hot">
          Horny Truth #{truth.id}
        </h3>
        <time
          dateTime={truth.created_at.toISOString()}
          className="shrink-0 text-xs text-muted"
        >
          {timeAgo(truth.created_at)}
        </time>
      </div>
      <p className="whitespace-pre-wrap break-words leading-relaxed">
        {truth.body}
      </p>
    </li>
  );
}

function Loading() {
  return (
    <p className="animate-pulse text-center text-muted">Slipping in…</p>
  );
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

function timeAgo(date: Date) {
  const seconds = (date.getTime() - Date.now()) / 1000;
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return relative.format(Math.round(seconds / size), unit);
    }
  }
  return "just now";
}
