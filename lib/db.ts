import postgres from "postgres";

export const MAX_TRUTH_LENGTH = 5000;

export type HornyTruth = {
  id: number;
  body: string;
  created_at: Date;
  votes: number;
  voted: boolean;
};

// Reuse one connection pool across hot reloads in dev.
const globalForDb = globalThis as unknown as { sql?: postgres.Sql };
const sql = globalForDb.sql ?? postgres(process.env.DB!, { max: 5 });
if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;

let tablesReady: Promise<unknown> | undefined;

function ensureTables() {
  tablesReady ??= (async () => {
    await sql`
      create table if not exists horny_truths (
        id serial primary key,
        body text not null,
        created_at timestamptz not null default now()
      )
    `;
    await sql`
      create table if not exists horny_votes (
        truth_id int not null references horny_truths (id) on delete cascade,
        voter_id text not null,
        primary key (truth_id, voter_id)
      )
    `;
    // Poster's IP, kept for moderation only. Never selected for the page.
    await sql`alter table horny_truths add column if not exists ip text`;
  })().catch((error) => {
    tablesReady = undefined;
    throw error;
  });
  return tablesReady;
}

export async function listTruths(voterId: string | null) {
  await ensureTables();
  return sql<HornyTruth[]>`
    select
      t.id,
      t.body,
      t.created_at,
      count(v.voter_id)::int as votes,
      coalesce(bool_or(v.voter_id = ${voterId ?? ""}), false) as voted
    from horny_truths t
    left join horny_votes v on v.truth_id = t.id
    group by t.id
    order by t.id desc
    limit 500
  `;
}

export async function addTruth(body: string, ip: string | null) {
  await ensureTables();
  await sql`insert into horny_truths (body, ip) values (${body}, ${ip})`;
}

// Hearts toggle: a second click from the same voter takes the vote back.
export async function toggleVote(truthId: number, voterId: string) {
  await ensureTables();
  const removed = await sql`
    delete from horny_votes
    where truth_id = ${truthId} and voter_id = ${voterId}
    returning truth_id
  `;
  if (removed.length === 0) {
    await sql`
      insert into horny_votes (truth_id, voter_id)
      select id, ${voterId} from horny_truths where id = ${truthId}
      on conflict do nothing
    `;
  }
}
