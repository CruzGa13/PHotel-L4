/*
  Warnings:

  - You are about to drop the column `capacidad` on the `tipos_habitacion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[categoriaId,ocupacionId,nombre]` on the table `tipos_habitacion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoriaId` to the `tipos_habitacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ocupacionId` to the `tipos_habitacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tipos_habitacion" DROP COLUMN "capacidad",
ADD COLUMN     "categoriaId" INTEGER NOT NULL,
ADD COLUMN     "ocupacionId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocupaciones" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "descripcionCamas" TEXT,

    CONSTRAINT "ocupaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ocupaciones_nombre_key" ON "ocupaciones"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_habitacion_categoriaId_ocupacionId_nombre_key" ON "tipos_habitacion"("categoriaId", "ocupacionId", "nombre");

-- AddForeignKey
ALTER TABLE "tipos_habitacion" ADD CONSTRAINT "tipos_habitacion_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipos_habitacion" ADD CONSTRAINT "tipos_habitacion_ocupacionId_fkey" FOREIGN KEY ("ocupacionId") REFERENCES "ocupaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
