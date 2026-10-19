UPDATE "priviledges"
SET "applications" = array_remove("applications", 'OKONOMIYAKI'::"Application")
WHERE 'OKONOMIYAKI'::"Application" = ANY("applications");

CREATE TYPE "Application_new" AS ENUM ('RESOLV', 'USTOR', 'VAPT');

ALTER TABLE "priviledges"
  ALTER COLUMN "applications" DROP DEFAULT;

ALTER TABLE "priviledges"
  ALTER COLUMN "applications" TYPE "Application_new"[]
  USING ("applications"::text[])::"Application_new"[];

ALTER TABLE "priviledges"
  ALTER COLUMN "applications" SET DEFAULT ARRAY[]::"Application_new"[];

DROP TYPE "Application";

ALTER TYPE "Application_new" RENAME TO "Application";
