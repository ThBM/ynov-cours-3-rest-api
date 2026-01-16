-- CreateTable
CREATE TABLE "Photo" (
    "id" UUID NOT NULL,
    "terrainId" UUID NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_terrainId_fkey" FOREIGN KEY ("terrainId") REFERENCES "Terrain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
