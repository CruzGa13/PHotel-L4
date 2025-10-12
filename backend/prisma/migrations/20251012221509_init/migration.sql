/*
  Warnings:

  - You are about to drop the `Administrador` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cliente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Consulta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Factura` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Habitacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HabitacionEvento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MetodoPago` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reserva` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReservaHabitacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReservaServicio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Servicio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TipoHabitacion` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EstadoHabitacion" AS ENUM ('Disponible', 'Ocupada', 'Mantenimiento');

-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('Pendiente', 'Confirmada', 'CheckIn', 'CheckOut', 'Cancelada');

-- CreateEnum
CREATE TYPE "EstadoFactura" AS ENUM ('Emitida', 'Pagada', 'Anulada');

-- CreateEnum
CREATE TYPE "EstadoConsulta" AS ENUM ('Pendiente', 'Respondida');

-- CreateEnum
CREATE TYPE "TipoEventoHabitacion" AS ENUM ('Apertura', 'Cierre', 'Mantenimiento');

-- DropForeignKey
ALTER TABLE "public"."Consulta" DROP CONSTRAINT "Consulta_operadorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Factura" DROP CONSTRAINT "Factura_metodoPagoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Factura" DROP CONSTRAINT "Factura_reservaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Habitacion" DROP CONSTRAINT "Habitacion_tipoHabitacionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HabitacionEvento" DROP CONSTRAINT "HabitacionEvento_adminId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HabitacionEvento" DROP CONSTRAINT "HabitacionEvento_habitacionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reserva" DROP CONSTRAINT "Reserva_administradorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reserva" DROP CONSTRAINT "Reserva_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ReservaHabitacion" DROP CONSTRAINT "ReservaHabitacion_habitacionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ReservaHabitacion" DROP CONSTRAINT "ReservaHabitacion_reservaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ReservaServicio" DROP CONSTRAINT "ReservaServicio_reservaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ReservaServicio" DROP CONSTRAINT "ReservaServicio_servicioId_fkey";

-- DropTable
DROP TABLE "public"."Administrador";

-- DropTable
DROP TABLE "public"."Cliente";

-- DropTable
DROP TABLE "public"."Consulta";

-- DropTable
DROP TABLE "public"."Factura";

-- DropTable
DROP TABLE "public"."Habitacion";

-- DropTable
DROP TABLE "public"."HabitacionEvento";

-- DropTable
DROP TABLE "public"."MetodoPago";

-- DropTable
DROP TABLE "public"."Reserva";

-- DropTable
DROP TABLE "public"."ReservaHabitacion";

-- DropTable
DROP TABLE "public"."ReservaServicio";

-- DropTable
DROP TABLE "public"."Servicio";

-- DropTable
DROP TABLE "public"."TipoHabitacion";

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "provincia" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fechaAlta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rolId" INTEGER NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_habitacion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "capacidad" INTEGER NOT NULL,
    "tarifaBase" DECIMAL(65,30) NOT NULL,
    "superficie" DOUBLE PRECISION,
    "vista" TEXT,
    "politicas" TEXT,

    CONSTRAINT "tipos_habitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenidades" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "icono" TEXT,

    CONSTRAINT "amenidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_habitacion_amenidades" (
    "tipoHabitacionId" INTEGER NOT NULL,
    "amenidadId" INTEGER NOT NULL,

    CONSTRAINT "tipos_habitacion_amenidades_pkey" PRIMARY KEY ("tipoHabitacionId","amenidadId")
);

-- CreateTable
CREATE TABLE "imagenes_habitacion" (
    "id" SERIAL NOT NULL,
    "tipoHabitacionId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "imagenes_habitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habitaciones" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "piso" INTEGER NOT NULL,
    "estado" "EstadoHabitacion" NOT NULL,
    "tipoHabitacionId" INTEGER NOT NULL,

    CONSTRAINT "habitaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" SERIAL NOT NULL,
    "clienteId" TEXT NOT NULL,
    "administradorId" TEXT,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "fechaEgreso" TIMESTAMP(3) NOT NULL,
    "adultos" INTEGER NOT NULL,
    "ninios" INTEGER NOT NULL DEFAULT 0,
    "estado" "EstadoReserva" NOT NULL,
    "totalAlojamiento" DECIMAL(65,30) NOT NULL,
    "totalServicios" DECIMAL(65,30) NOT NULL,
    "totalFinal" DECIMAL(65,30) NOT NULL,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas_habitacion" (
    "id" SERIAL NOT NULL,
    "reservaId" INTEGER NOT NULL,
    "habitacionId" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "observaciones" TEXT,

    CONSTRAINT "reservas_habitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precioBase" DECIMAL(65,30) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas_servicios" (
    "id" SERIAL NOT NULL,
    "reservaId" INTEGER NOT NULL,
    "servicioId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservas_servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" SERIAL NOT NULL,
    "reservaId" INTEGER NOT NULL,
    "metodoPagoId" INTEGER NOT NULL,
    "numeroFactura" TEXT NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "impuestos" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "estado" "EstadoFactura" NOT NULL,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metodos_pago" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "notas" TEXT,

    CONSTRAINT "metodos_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "asunto" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "estado" "EstadoConsulta" NOT NULL DEFAULT 'Pendiente',
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondidaEn" TIMESTAMP(3),
    "respuesta" TEXT,
    "operadorId" TEXT,

    CONSTRAINT "consultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habitaciones_eventos" (
    "id" SERIAL NOT NULL,
    "habitacionId" INTEGER NOT NULL,
    "adminId" TEXT NOT NULL,
    "tipo" "TipoEventoHabitacion" NOT NULL,
    "detalle" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habitaciones_eventos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "habitaciones_numero_key" ON "habitaciones"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "reservas_habitacion_reservaId_habitacionId_key" ON "reservas_habitacion"("reservaId", "habitacionId");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_reservaId_key" ON "facturas"("reservaId");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_numeroFactura_key" ON "facturas"("numeroFactura");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipos_habitacion_amenidades" ADD CONSTRAINT "tipos_habitacion_amenidades_tipoHabitacionId_fkey" FOREIGN KEY ("tipoHabitacionId") REFERENCES "tipos_habitacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipos_habitacion_amenidades" ADD CONSTRAINT "tipos_habitacion_amenidades_amenidadId_fkey" FOREIGN KEY ("amenidadId") REFERENCES "amenidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes_habitacion" ADD CONSTRAINT "imagenes_habitacion_tipoHabitacionId_fkey" FOREIGN KEY ("tipoHabitacionId") REFERENCES "tipos_habitacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habitaciones" ADD CONSTRAINT "habitaciones_tipoHabitacionId_fkey" FOREIGN KEY ("tipoHabitacionId") REFERENCES "tipos_habitacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_habitacion" ADD CONSTRAINT "reservas_habitacion_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_habitacion" ADD CONSTRAINT "reservas_habitacion_habitacionId_fkey" FOREIGN KEY ("habitacionId") REFERENCES "habitaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_servicios" ADD CONSTRAINT "reservas_servicios_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_servicios" ADD CONSTRAINT "reservas_servicios_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_metodoPagoId_fkey" FOREIGN KEY ("metodoPagoId") REFERENCES "metodos_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habitaciones_eventos" ADD CONSTRAINT "habitaciones_eventos_habitacionId_fkey" FOREIGN KEY ("habitacionId") REFERENCES "habitaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habitaciones_eventos" ADD CONSTRAINT "habitaciones_eventos_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
