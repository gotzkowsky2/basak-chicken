BEGIN;
DO $$
BEGIN
  IF to_regclass('public."Message"') IS NOT NULL THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS "Message_backup_20250819" AS TABLE "Message"';
    BEGIN
      EXECUTE 'ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "Message_recipientId_fkey"';
    EXCEPTION WHEN undefined_object THEN
      NULL;
    END;
    BEGIN
      EXECUTE 'ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "Message_senderId_fkey"';
    EXCEPTION WHEN undefined_object THEN
      NULL;
    END;
    EXECUTE 'DROP TABLE IF EXISTS "Message"';
  END IF;
END
$$;
COMMIT;
