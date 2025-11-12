-- DropForeignKey
ALTER TABLE "public"."emails_respuestas" DROP CONSTRAINT "emails_respuestas_operadorId_fkey";

-- AlterTable
ALTER TABLE "emails_respuestas" ALTER COLUMN "operadorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "emails_respuestas" ADD CONSTRAINT "emails_respuestas_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
