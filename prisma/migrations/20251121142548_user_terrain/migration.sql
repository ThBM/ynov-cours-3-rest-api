DELETE FROM "Terrain";

-- AlterTable
ALTER TABLE "Terrain" ADD COLUMN     "userId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "Terrain" ADD CONSTRAINT "Terrain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
