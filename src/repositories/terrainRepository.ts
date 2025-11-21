import type { TerrainWhereInput } from "../generated/prisma/models.js";
import { prisma } from "../lib/prisma.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

export const terrainRepository = {
  async getAllTerrains(options: {
    page?: number;
    itemsPerPage?: number;
    nom?: string;
    prix?: string;
    userId?: string;
  }) {
    // Filters
    const where: TerrainWhereInput = {};
    if (options.nom) {
      where.nom = { contains: options.nom, mode: "insensitive" };
    }
    if (options.prix) {
      const [operator, ...values] = options.prix.split(".");
      const val = Number(values.join("."));

      if (operator === "lte") {
        where.prix = { lte: val };
      } else if (operator === "gte") {
        where.prix = { gte: val };
      }
    }
    if (options.userId) {
      where.userId = options.userId;
    }

    // Paginate results
    const { page = 1, itemsPerPage = 10 } = options;
    const startIndex = (page - 1) * itemsPerPage;

    const res = await prisma.terrain.findMany({
      skip: startIndex,
      take: itemsPerPage,
      where,
    });

    return res;
  },

  async getTerrainById(id: string) {
    const res = await prisma.terrain.findUnique({
      where: { id },
    });

    return res;
  },

  async createTerrain(terrainData: {
    nom: string;
    latitude: number;
    longitude: number;
    surface: number;
    surfaceConstructible: number;
    prix: number;
    longueurFacade: number;
    orientationFacade: "NORD" | "SUD" | "EST" | "OUEST";
    userId: string;
  }) {
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
        user: { connect: { id: terrainData.userId } },
      },
    });

    return res;
  },

  async updateTerrain(
    id: string,
    terrainData: {
      nom: string;
      latitude: number;
      longitude: number;
      surface: number;
      surfaceConstructible: number;
      prix: number;
      longueurFacade: number;
      orientationFacade: "NORD" | "SUD" | "EST" | "OUEST";
    }
  ) {
    try {
      const updatedTerrain = await prisma.terrain.update({
        where: { id },
        data: terrainData,
      });

      return updatedTerrain;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return null;
        }
      }
      throw error;
    }
  },

  async deleteTerrain(id: string) {
    try {
      await prisma.terrain.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return false;
        }
      }
      throw error;
    }
  },
};
