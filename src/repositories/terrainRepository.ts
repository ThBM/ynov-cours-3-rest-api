import { prisma } from "../lib/prisma.js";

export const terrainRepository = {
  async getAllTerrains(options: { page?: number; itemsPerPage?: number }) {
    // Paginate results
    const { page = 1, itemsPerPage = 10 } = options;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const res = await prisma.terrain.findMany({
      skip: startIndex,
      take: itemsPerPage,
    });

    return res;
  },

  async getTerrainById(id: string) {
    const res = await prisma.terrain.findUnique({
      where: { id },
    });

    return res;
  },

  async createTerrain(terrainData: Omit<Terrain, "id">) {
    const res = await prisma.terrain.create({
      data: {
        nom: terrainData.nom,
        latitude: terrainData.latitude,
        longitude: terrainData.longitude,
        surface: terrainData.surface,
        surfaceConstructible: terrainData.surfaceConstructible,
        prix: terrainData.prix,
        longueurFacade: terrainData.longueurFacade,
        orientationFacade: terrainData.orientationFacade,
      },
    });

    return res;
  },

  async updateTerrain(id: string, terrainData: Partial<Omit<Terrain, "id">>) {
    const updatedTerrain = await prisma.terrain.update({
      where: { id },
      data: terrainData,
    });

    return updatedTerrain;
  },

  async deleteTerrain(id: string) {
    await prisma.terrain.delete({
      where: { id },
    });

    return true;
  },
};

type Terrain = {
  id: string;
  nom: string;
  latitude: number;
  longitude: number;
  surface: number;
  surfaceConstructible: number;
  prix: number;
  longueurFacade: number;
  orientationFacade: "NORD" | "SUD" | "EST" | "OUEST";
};
