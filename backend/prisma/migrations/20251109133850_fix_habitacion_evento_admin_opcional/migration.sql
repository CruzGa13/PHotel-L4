-- DropForeignKey
ALTER TABLE "public"."habitaciones_eventos" DROP CONSTRAINT "habitaciones_eventos_adminId_fkey";

-- AlterTable
ALTER TABLE "habitaciones_eventos" ALTER COLUMN "adminId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "habitaciones_eventos" ADD CONSTRAINT "habitaciones_eventos_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
