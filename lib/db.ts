import postgres from "postgres";

export const MAX_TRUTH_LENGTH = 5000;

export type HornyTruth = {
  id: number;
  body: string;
  created_at: Date;
};

// Reuse one connection pool across hot reloads in dev.
const globalForDb = globalThis as unknown as { sql?: postgres.Sql };
const sql = globalForDb.sql ?? postgres(process.env.DB!, { max: 5 });
if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;

let tableReady: Promise<unknown> | undefined;

function ensureTable() {
  tableReady ??= sql`
    create table if not exists horny_truths (
      id serial primary key,
      body text not null,
      created_at timestamptz not null default now()
    )
  `.catch((error) => {
    tableReady = undefined;
    throw error;
  });
  return tableReady;
}

export async function listTruths() {
  await ensureTable();
  return sql<HornyTruth[]>`
    select id, body, created_at from horny_truths
    order by id desc
    limit 500
  `;
}

export async function addTruth(body: string) {
  await ensureTable();
  await sql`insert into horny_truths (body) values (${body})`;
}
