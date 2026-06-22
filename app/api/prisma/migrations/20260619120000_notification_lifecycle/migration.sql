-- Notification lifecycle: archive, snooze and expiration support

ALTER TABLE "Notification"
  ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "snoozedUntil" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Notification_userId_archivedAt_idx"
  ON "Notification"("userId", "archivedAt");
