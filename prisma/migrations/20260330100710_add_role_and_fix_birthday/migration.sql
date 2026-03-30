-- DropIndex
DROP INDEX "BirthdayVideo_year_key";

-- CreateIndex
CREATE INDEX "BirthdayVideo_year_idx" ON "BirthdayVideo"("year");
