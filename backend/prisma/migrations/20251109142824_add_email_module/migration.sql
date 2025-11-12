-- CreateEnum
CREATE TYPE "EmailEstado" AS ENUM ('Pendiente', 'Respondido', 'Archivado');

-- CreateEnum
CREATE TYPE "PrioridadMensaje" AS ENUM ('Alta', 'Media', 'Baja');

-- CreateTable
CREATE TABLE "EmailMensaje" (
    "id" SERIAL NOT NULL,
    "gmailMessageId" TEXT NOT NULL,
    "gmailThreadId" TEXT NOT NULL,
    "gmailHistoryId" BIGINT,
    "remitenteNombre" TEXT,
    "remitenteEmail" TEXT NOT NULL,
    "para" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cc" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bcc" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "asunto" TEXT NOT NULL,
    "snippet" TEXT,
    "cuerpoHtml" TEXT,
    "cuerpoTexto" TEXT,
    "estado" "EmailEstado" NOT NULL DEFAULT 'Pendiente',
    "prioridad" "PrioridadMensaje",
    "internalDate" TIMESTAMP(3) NOT NULL,
    "recibidoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operadorId" TEXT,
    "consultaId" INTEGER,
    "etiquetas" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "EmailMensaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailRespuesta" (
    "id" SERIAL NOT NULL,
    "emailMensajeId" INTEGER NOT NULL,
    "gmailMessageId" TEXT,
    "gmailThreadId" TEXT,
    "cuerpoHtml" TEXT,
    "cuerpoTexto" TEXT,
    "enviadoPorId" TEXT,
    "enviadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailRespuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailAdjunto" (
    "id" SERIAL NOT NULL,
    "emailMensajeId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "mimetype" TEXT,
    "tamanoBytes" INTEGER,
    "storagePath" TEXT,
    "gmailAttachmentId" TEXT,

    CONSTRAINT "EmailAdjunto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GmailSyncState" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "historyId" TEXT,
    "lastSync" TIMESTAMP(3),

    CONSTRAINT "GmailSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailMensaje_gmailMessageId_key" ON "EmailMensaje"("gmailMessageId");

-- CreateIndex
CREATE INDEX "EmailMensaje_estado_internalDate_idx" ON "EmailMensaje"("estado", "internalDate");

-- CreateIndex
CREATE INDEX "EmailMensaje_gmailThreadId_idx" ON "EmailMensaje"("gmailThreadId");

-- CreateIndex
CREATE INDEX "EmailMensaje_prioridad_idx" ON "EmailMensaje"("prioridad");

-- CreateIndex
CREATE INDEX "EmailRespuesta_emailMensajeId_idx" ON "EmailRespuesta"("emailMensajeId");

-- CreateIndex
CREATE INDEX "EmailAdjunto_emailMensajeId_idx" ON "EmailAdjunto"("emailMensajeId");

-- AddForeignKey
ALTER TABLE "EmailMensaje" ADD CONSTRAINT "EmailMensaje_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailMensaje" ADD CONSTRAINT "EmailMensaje_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "consultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailRespuesta" ADD CONSTRAINT "EmailRespuesta_emailMensajeId_fkey" FOREIGN KEY ("emailMensajeId") REFERENCES "EmailMensaje"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailRespuesta" ADD CONSTRAINT "EmailRespuesta_enviadoPorId_fkey" FOREIGN KEY ("enviadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailAdjunto" ADD CONSTRAINT "EmailAdjunto_emailMensajeId_fkey" FOREIGN KEY ("emailMensajeId") REFERENCES "EmailMensaje"("id") ON DELETE CASCADE ON UPDATE CASCADE;
