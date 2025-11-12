/*
  Warnings:

  - You are about to drop the `EmailAdjunto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmailMensaje` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmailRespuesta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GmailSyncState` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."EmailAdjunto" DROP CONSTRAINT "EmailAdjunto_emailMensajeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EmailMensaje" DROP CONSTRAINT "EmailMensaje_consultaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EmailMensaje" DROP CONSTRAINT "EmailMensaje_operadorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EmailRespuesta" DROP CONSTRAINT "EmailRespuesta_emailMensajeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EmailRespuesta" DROP CONSTRAINT "EmailRespuesta_enviadoPorId_fkey";

-- DropTable
DROP TABLE "public"."EmailAdjunto";

-- DropTable
DROP TABLE "public"."EmailMensaje";

-- DropTable
DROP TABLE "public"."EmailRespuesta";

-- DropTable
DROP TABLE "public"."GmailSyncState";

-- DropEnum
DROP TYPE "public"."EmailEstado";

-- DropEnum
DROP TYPE "public"."PrioridadMensaje";
