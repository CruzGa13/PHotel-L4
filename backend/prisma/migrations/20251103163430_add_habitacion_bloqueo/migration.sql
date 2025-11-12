-- CreateEnum
CREATE TYPE "TipoBloqueo" AS ENUM ('Mantenimiento', 'FueraDeServicio', 'BloqueoOperativo');

-- CreateTable
CREATE TABLE "habitaciones_bloqueos" (
    "id" SERIAL NOT NULL,
    "habitacionId" INTEGER NOT NULL,
    "desde" TIMESTAMP(3) NOT NULL,
    "hasta" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "tipo" "TipoBloqueo" NOT NULL DEFAULT 'Mantenimiento',
    "creadoPorId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habitaciones_bloqueos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "habitaciones_bloqueos_habitacionId_desde_idx" ON "habitaciones_bloqueos"("habitacionId", "desde");

-- CreateIndex
CREATE INDEX "habitaciones_bloqueos_habitacionId_desde_hasta_idx" ON "habitaciones_bloqueos"("habitacionId", "desde", "hasta");

-- AddForeignKey
ALTER TABLE "habitaciones_bloqueos" ADD CONSTRAINT "habitaciones_bloqueos_habitacionId_fkey" FOREIGN KEY ("habitacionId") REFERENCES "habitaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habitaciones_bloqueos" ADD CONSTRAINT "habitaciones_bloqueos_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
