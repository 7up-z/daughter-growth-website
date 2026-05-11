-- Promote the preserved production account after removing obsolete SQLite seed files.
UPDATE "User"
SET "role" = 'admin', "updatedAt" = CURRENT_TIMESTAMP
WHERE "username" = '7up';
