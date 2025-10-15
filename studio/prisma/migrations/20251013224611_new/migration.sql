-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('NEW', 'GENERATING', 'GENERATED', 'VALIDATION_FAILED', 'READY', 'DEPLOYED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('PENDING', 'BUILDING', 'READY', 'ERROR', 'CANCELED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "vercelProjectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drafts" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "discoveryDoc" TEXT NOT NULL,
    "methodologyDoc" TEXT NOT NULL,
    "maxMinutes" INTEGER NOT NULL DEFAULT 8,
    "tone" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "segments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "archetypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "config" JSONB NOT NULL,
    "methodBrief" JSONB,
    "status" "DraftStatus" NOT NULL DEFAULT 'NEW',
    "validationErrors" JSONB,
    "llmModel" TEXT,
    "llmTokens" INTEGER,
    "generationTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deployments" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "vercelDeploymentId" TEXT,
    "vercelUrl" TEXT,
    "configSnapshot" JSONB NOT NULL,
    "status" "DeploymentStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "deployedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deployedBy" TEXT,

    CONSTRAINT "deployments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_name_key" ON "clients"("name");

-- CreateIndex
CREATE UNIQUE INDEX "clients_slug_key" ON "clients"("slug");

-- CreateIndex
CREATE INDEX "clients_slug_idx" ON "clients"("slug");

-- CreateIndex
CREATE INDEX "drafts_clientId_status_idx" ON "drafts"("clientId", "status");

-- CreateIndex
CREATE INDEX "deployments_clientId_environment_idx" ON "deployments"("clientId", "environment");

-- CreateIndex
CREATE INDEX "deployments_draftId_idx" ON "deployments"("draftId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- AddForeignKey
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
