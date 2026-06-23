-- AlterTable: Add deletedAt columns for soft deletes
ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Zone" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Incident" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Asset" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "MaintenanceTicket" ADD COLUMN "deletedAt" TIMESTAMP(3);
