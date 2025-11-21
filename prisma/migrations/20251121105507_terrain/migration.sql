-- CreateEnum
CREATE TYPE "OrientationFacade" AS ENUM ('NORD', 'SUD', 'EST', 'OUEST');

-- CreateTable
CREATE TABLE "Terrain" (
    "id" UUID NOT NULL,
    "nom" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "surface" DOUBLE PRECISION NOT NULL,
    "surfaceConstructible" DOUBLE PRECISION NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL,
    "longueurFacade" DOUBLE PRECISION NOT NULL,
    "orientationFacade" "OrientationFacade" NOT NULL,

    CONSTRAINT "Terrain_pkey" PRIMARY KEY ("id")
);
