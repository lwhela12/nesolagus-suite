-- AlterTable
ALTER TABLE "deployments" ADD COLUMN     "dashboardSnapshot" JSONB;

-- AlterTable
ALTER TABLE "drafts" ADD COLUMN     "dashboardConfig" JSONB,
ADD COLUMN     "dashboardLayout" JSONB,
ADD COLUMN     "dashboardPreview" JSONB;
