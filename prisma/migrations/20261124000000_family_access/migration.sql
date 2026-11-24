CREATE TYPE "FamilyAccess" AS ENUM ('PENDING', 'ACTIVE', 'REVOKED');

ALTER TABLE "User"
ADD COLUMN "accessStatus" "FamilyAccess" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

UPDATE "User" SET "accessStatus" = 'ACTIVE' WHERE "role" = 'admin';

CREATE TABLE "FamilyInvitation" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "creatorId" TEXT NOT NULL,
    CONSTRAINT "FamilyInvitation_creatorId_fkey" FOREIGN KEY ("creatorId")
        REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "FamilyInvitation_codeHash_key" ON "FamilyInvitation"("codeHash");
