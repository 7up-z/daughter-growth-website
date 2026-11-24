import { spawnSync } from "node:child_process"
import { createRequire } from "node:module"
import pg from "pg"

const initialMigration = "20260324100107_init"
const timestamps = { createdAt: "timestamp(3) without time zone", updatedAt: "timestamp(3) without time zone" }
const legacyColumns = {
  User: { email: "text", username: "text", password: "text", nickname: "text?", avatar: "text?", theme: "text", role: "text" },
  BirthdayVideo: { year: "integer", title: "text", bvid: "text", description: "text?", thumbnail: "text?" },
  TravelEntry: {
    title: "text", content: "text", location: "text?", travelDate: timestamps.createdAt,
    coverImage: "text?", images: "text", published: "boolean", authorId: "text",
  },
  PhotoEntry: {
    title: "text", description: "text?", imageUrl: "text", photoDate: `${timestamps.createdAt}?`,
    category: "text", tags: "text", thoughts: "text?", published: "boolean", authorId: "text",
  },
  Comment: { content: "text", authorId: "text", travelEntryId: "text?", photoEntryId: "text?" },
}

async function verifyLegacySchema(client) {
  const { rows } = await client.query(`
    SELECT t.relname AS table_name, a.attname AS column_name,
      pg_catalog.format_type(a.atttypid, a.atttypmod) AS column_type, a.attnotnull AS required
    FROM pg_catalog.pg_attribute a
    JOIN pg_catalog.pg_class t ON t.oid = a.attrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = current_schema() AND t.relkind = 'r'
      AND a.attnum > 0 AND NOT a.attisdropped AND t.relname = ANY($1::text[])
  `, [Object.keys(legacyColumns)])
  const actualColumns = new Map(rows.map(({ table_name, column_name, column_type, required }) => [
    `${table_name}.${column_name}`, `${column_type}${required ? "" : "?"}`,
  ]))
  for (const [table, fields] of Object.entries(legacyColumns)) {
    for (const [column, type] of Object.entries({ id: "text", ...timestamps, ...fields })) {
      if (actualColumns.get(`${table}.${column}`) !== type) {
        throw new Error(`Cannot baseline the legacy database: unexpected definition for ${table}.${column}.`)
      }
    }
  }

  const { rows: keys } = await client.query(`
    SELECT c.conname AS name
    FROM pg_catalog.pg_constraint c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.connamespace
    WHERE n.nspname = current_schema() AND c.convalidated AND c.contype IN ('p', 'f')
    UNION
    SELECT indexname AS name FROM pg_catalog.pg_indexes WHERE schemaname = current_schema()
  `)
  const actualKeys = new Set(keys.map(({ name }) => name))
  const requiredKeys = [
    ...Object.keys(legacyColumns).map((table) => `${table}_pkey`),
    "User_email_key", "User_username_key", "BirthdayVideo_year_idx",
    "TravelEntry_authorId_fkey", "PhotoEntry_authorId_fkey", "Comment_authorId_fkey",
    "Comment_travelEntryId_fkey", "Comment_photoEntryId_fkey",
  ]
  const missingKey = requiredKeys.find((name) => !actualKeys.has(name))
  if (missingKey) throw new Error(`Cannot baseline the legacy database: missing ${missingKey}.`)
}

async function needsInitialBaseline(client) {
  const { rows: [ledger] } = await client.query("SELECT to_regclass('_prisma_migrations') IS NOT NULL AS exists")
  if (ledger.exists) {
    const { rows: [initial] } = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $1
          AND finished_at IS NOT NULL AND rolled_back_at IS NULL
      ) AS applied
    `, [initialMigration])
    if (initial.applied) return false
  }

  // The original production schema predates Prisma's migration ledger.
  // Resolve the initial migration only after verifying its schema is already present.
  await verifyLegacySchema(client)
  return true
}

function runPrismaMigration(...args) {
  const prismaCli = createRequire(import.meta.url).resolve("prisma")
  const migration = spawnSync(process.execPath, [prismaCli, "migrate", ...args], { stdio: "inherit" })
  if (migration.status !== 0) throw new Error(`Prisma migrate ${args[0]} did not complete.`)
}

async function migrateProduction() {
  const required = ["DATABASE_URL", "NEXTAUTH_SECRET", "BLOB_PRIVATE_READ_WRITE_TOKEN"]
  const missing = required.filter((name) => !process.env[name]?.trim())
  if (missing.length) throw new Error(`Missing production environment variables: ${missing.join(", ")}.`)

  // Verify the existing database retains an administrator before changing its schema.
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10_000,
  })

  let baselineInitial
  try {
    await client.connect()
    const schema = new URL(process.env.DATABASE_URL).searchParams.get("schema") ?? "public"
    await client.query("SELECT set_config('search_path', quote_ident($1), false)", [schema])

    const { rows: [admin] } = await client.query(`SELECT EXISTS (
        SELECT 1 FROM "User" WHERE "role" = 'admin' AND length("password") > 0
      ) AS administrator_exists`).catch(() => {
      throw new Error("Could not verify an administrator in the existing production database.")
    })
    if (!admin.administrator_exists) throw new Error("No existing administrator can retain access after migration.")
    baselineInitial = await needsInitialBaseline(client)
  } finally {
    await client.end()
  }

  if (baselineInitial) {
    console.log("The legacy production schema is present. Recording the initial Prisma migration.")
    runPrismaMigration("resolve", "--applied", initialMigration)
  }
  runPrismaMigration("deploy")
}

if (process.env.VERCEL_ENV === "production") {
  try {
    await migrateProduction()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
