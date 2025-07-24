-- Setze alle NULL-Werte auf true
UPDATE "User" SET "showBranding" = true WHERE "showBranding" IS NULL;

-- Erzwinge NOT NULL auf showBranding (nur falls noch nicht gesetzt)
ALTER TABLE "User" ALTER COLUMN "showBranding" SET NOT NULL; 