import { spawnSync } from "node:child_process"
import { createRequire } from "node:module"
import pg from "pg"

async function migrateProduction() {
  const required = ["DATABASE_URL", "NEXTAUTH_SECRET", "BLOB_PRIVATE_READ_WRITE_TOKEN"]
  const missing = required.filter((name) => !process.env[name]?.trim())
  if (missing.length) throw new Error(`Missing production environment variables: ${missing.join(", ")}.`)

  // Verify the existing database retains an administrator before changing its schema.
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10_000,
  })

  let administratorExists
  try {
    await client.connect()
    const { rows } = await client.query(
      `SELECT EXISTS (
        SELECT 1 FROM "User" WHERE "role" = 'admin' AND length("password") > 0
      ) AS administrator_exists`,
    )
    administratorExists = rows[0]?.administrator_exists
  } catch {
    throw new Error("Could not verify an administrator in the existing production database.")
  } finally {
    await client.end()
  }
  if (!administratorExists) throw new Error("No existing administrator can retain access after migration.")

  const prismaCli = createRequire(import.meta.url).resolve("prisma")
  const migration = spawnSync(process.execPath, [prismaCli, "migrate", "deploy"], { stdio: "inherit" })
  if (migration.status !== 0) throw new Error("The production database migration did not complete.")
}

if (process.env.VERCEL_ENV === "production") {
  try {
    await migrateProduction()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
