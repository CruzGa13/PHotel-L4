-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('Masculino', 'Femenino', 'Otro', 'PrefieroNoDecir');

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "fechaNacimiento" TIMESTAMP(3),
ADD COLUMN     "genero" "Genero";
