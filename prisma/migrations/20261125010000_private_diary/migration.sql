BEGIN;
CREATE TYPE "DiaryAudience" AS ENUM ('OWNER', 'MEMBERS', 'FAMILY');

CREATE TABLE "PrivateDiary" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "diaryDate" DATE NOT NULL,
  "audience" "DiaryAudience" NOT NULL DEFAULT 'OWNER',
  "openAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "authorId" TEXT NOT NULL,
  CONSTRAINT "PrivateDiary_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PrivateDiary_audience_openAt_check" CHECK (
    ("audience" = 'OWNER' AND "openAt" IS NULL)
    OR "audience" = 'MEMBERS'
    OR ("audience" = 'FAMILY' AND "openAt" IS NOT NULL)
  ),
  CONSTRAINT "PrivateDiary_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "PrivateDiaryReader" (
  "diaryId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  CONSTRAINT "PrivateDiaryReader_pkey" PRIMARY KEY ("diaryId", "userId"),
  CONSTRAINT "PrivateDiaryReader_diaryId_fkey" FOREIGN KEY ("diaryId") REFERENCES "PrivateDiary"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PrivateDiaryReader_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "PrivateDiary_authorId_diaryDate_idx" ON "PrivateDiary" ("authorId", "diaryDate");
CREATE INDEX "PrivateDiary_audience_openAt_idx" ON "PrivateDiary" ("audience", "openAt");
CREATE INDEX "PrivateDiaryReader_userId_idx" ON "PrivateDiaryReader" ("userId");
COMMIT;
