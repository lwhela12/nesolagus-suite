/*
  Warnings:

  - You are about to drop the column `dashboard_preview_responses` on the `drafts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "drafts" DROP COLUMN "dashboard_preview_responses",
ADD COLUMN     "dashboardPreviewResponses" JSONB;
