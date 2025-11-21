import { randomUUID } from "crypto";

const terrains: Terrain[] = [];

export const terrainRepository = {
  async getAllTerrains(options: { page?: number; itemsPerPage?: number }) {
    // Paginate results
    const { page = 1, itemsPerPage = 10 } = options;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return terrains.slice(startIndex, endIndex);
  },

  async getTerrainById(id: string) {
    return terrains.find((terrain) => terrain.id === id) || null;
  },

  async createTerrain(terrainData: Omit<Terrain, "id">) {
    const newTerrain: Terrain = {
      ...terrainData,
      id: randomUUID(),
    };

    terrains.push(newTerrain);
    return newTerrain;
  },

  async updateTerrain(id: string, terrainData: Partial<Omit<Terrain, "id">>) {
    const terrainIndex = terrains.findIndex((terrain) => terrain.id === id);
    if (terrainIndex === -1) {
      return null;
    }

    const updatedTerrain = {
      ...terrainData,
      id,
    };

    return updatedTerrain;
  },

  async deleteTerrain(id: string) {
    const terrainIndex = terrains.findIndex((terrain) => terrain.id === id);
    if (terrainIndex === -1) {
      return false;
    }

    terrains.splice(terrainIndex, 1);
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
  orientationFacade: "Nord" | "Sud" | "Est" | "Ouest";
};
