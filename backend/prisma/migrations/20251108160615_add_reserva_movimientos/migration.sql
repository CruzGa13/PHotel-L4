-- CreateTable
CREATE TABLE "reservas_movimientos" (
    "id" SERIAL NOT NULL,
    "reservaId" INTEGER NOT NULL,
    "estadoAnt" "EstadoReserva" NOT NULL,
    "estadoNuevo" "EstadoReserva" NOT NULL,
    "cambiadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operadorId" TEXT,

    CONSTRAINT "reservas_movimientos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reservas_movimientos_reservaId_idx" ON "reservas_movimientos"("reservaId");

-- AddForeignKey
ALTER TABLE "reservas_movimientos" ADD CONSTRAINT "reservas_movimientos_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
