-- Add raw dashboard preview responses column
ALTER TABLE "drafts"
ADD COLUMN IF NOT EXISTS "dashboard_preview_responses" JSONB;
