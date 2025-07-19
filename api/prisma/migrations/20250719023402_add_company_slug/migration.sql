/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `companies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "slug" TEXT;

-- Update existing records with generated slugs
UPDATE "companies" SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'), '^-|-$', '', 'g'));

-- Make slug NOT NULL after updating existing data
ALTER TABLE "companies" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");
