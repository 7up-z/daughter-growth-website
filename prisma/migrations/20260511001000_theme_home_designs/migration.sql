-- Replace legacy theme names with the four homepage-selectable design themes.
UPDATE "User"
SET "theme" = CASE
  WHEN "theme" IN ('warm', 'vintage') THEN 'paper'
  WHEN "theme" = 'minimal' THEN 'cinematic'
  WHEN "theme" IN ('cool', 'modern') THEN 'future'
  WHEN "theme" IN ('paper', 'cinematic', 'playful', 'future') THEN "theme"
  ELSE 'playful'
END,
"updatedAt" = CURRENT_TIMESTAMP;

ALTER TABLE "User" ALTER COLUMN "theme" SET DEFAULT 'playful';
