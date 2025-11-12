-- CreateEnum
CREATE TYPE "EstadoEmail" AS ENUM ('NoLeido', 'Leido', 'Respondido', 'Archivado', 'Spam');

-- CreateEnum
CREATE TYPE "PrioridadEmail" AS ENUM ('Alta', 'Media', 'Baja');

-- CreateEnum
CREATE TYPE "CanalEmail" AS ENUM ('Email', 'Web', 'WhatsApp');

-- CreateTable
CREATE TABLE "emails" (
    "id" SERIAL NOT NULL,
    "messageId" TEXT NOT NULL,
    "gmailId" TEXT,
    "threadId" TEXT,
    "deNombre" TEXT,
    "deEmail" TEXT NOT NULL,
    "paraNombres" TEXT,
    "paraEmails" TEXT NOT NULL,
    "cc" TEXT,
    "bcc" TEXT,
    "asunto" TEXT NOT NULL,
    "cuerpoTexto" TEXT,
    "cuerpoHtml" TEXT,
    "canal" "CanalEmail" NOT NULL DEFAULT 'Email',
    "prioridad" "PrioridadEmail" NOT NULL DEFAULT 'Media',
    "estado" "EstadoEmail" NOT NULL DEFAULT 'NoLeido',
    "fechaRecibido" TIMESTAMP(3) NOT NULL,
    "fechaSincronizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLeido" TIMESTAMP(3),
    "operadorId" TEXT,
    "consultaId" INTEGER,
    "esSpam" BOOLEAN NOT NULL DEFAULT false,
    "tieneAdjuntos" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emails_adjuntos" (
    "id" SERIAL NOT NULL,
    "emailId" INTEGER NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "rutaLocal" TEXT,
    "urlS3" TEXT,
    "dataBase64" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emails_adjuntos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emails_respuestas" (
    "id" SERIAL NOT NULL,
    "emailId" INTEGER NOT NULL,
    "operadorId" TEXT NOT NULL,
    "asunto" TEXT NOT NULL,
    "cuerpoTexto" TEXT,
    "cuerpoHtml" TEXT,
    "messageIdRespuesta" TEXT,
    "estadoEnvio" TEXT NOT NULL DEFAULT 'Enviado',
    "errorEnvio" TEXT,
    "fechaEnviado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emails_respuestas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "emails_messageId_key" ON "emails"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "emails_gmailId_key" ON "emails"("gmailId");

-- CreateIndex
CREATE UNIQUE INDEX "emails_consultaId_key" ON "emails"("consultaId");

-- CreateIndex
CREATE INDEX "emails_deEmail_idx" ON "emails"("deEmail");

-- CreateIndex
CREATE INDEX "emails_threadId_idx" ON "emails"("threadId");

-- CreateIndex
CREATE INDEX "emails_estado_prioridad_idx" ON "emails"("estado", "prioridad");

-- CreateIndex
CREATE INDEX "emails_fechaRecibido_idx" ON "emails"("fechaRecibido");

-- CreateIndex
CREATE INDEX "emails_adjuntos_emailId_idx" ON "emails_adjuntos"("emailId");

-- CreateIndex
CREATE UNIQUE INDEX "emails_respuestas_messageIdRespuesta_key" ON "emails_respuestas"("messageIdRespuesta");

-- CreateIndex
CREATE INDEX "emails_respuestas_emailId_idx" ON "emails_respuestas"("emailId");

-- CreateIndex
CREATE INDEX "emails_respuestas_operadorId_idx" ON "emails_respuestas"("operadorId");

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "consultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails_adjuntos" ADD CONSTRAINT "emails_adjuntos_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails_respuestas" ADD CONSTRAINT "emails_respuestas_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails_respuestas" ADD CONSTRAINT "emails_respuestas_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
