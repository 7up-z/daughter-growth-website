ALTER TABLE "BirthdayVideo" ADD COLUMN "privateVideoKey" TEXT;
CREATE UNIQUE INDEX "BirthdayVideo_privateVideoKey_key" ON "BirthdayVideo"("privateVideoKey");
