import type { TerrainWhereInput } from "../generated/prisma/models.js";
import { prisma } from "../lib/prisma.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { getS3Client } from "../lib/s3Client.js";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
      include: { photos: true },
      skip: startIndex,
      take: itemsPerPage,
      where,
    });

    const formattedRes = await Promise.all(
      res.map(async (terrain) => {
        const photos: { id: string; url: string }[] = [];
        for (const photo of terrain.photos) {
          const url = await generateSignedUrl(terrain.id, photo.id);
          photos.push({ id: photo.id, url });
        }

        return { ...terrain, photos };
      })
    );

    return formattedRes;
  },

  async getTerrainById(id: string) {
    const res = await prisma.terrain.findUnique({
      include: { photos: true },
      where: { id },
    });

    if (!res) {
      return null;
    }

    const photos: { id: string; url: string }[] = [];
    for (const photo of res.photos) {
      const url = await generateSignedUrl(res.id, photo.id);
      photos.push({ id: photo.id, url });
    }

    return { ...res, photos };
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

  async addPhotoToTerrain(terrainId: string, file: Buffer, mimetype: string) {
    // Create Photo record in the database
    const photo = await prisma.photo.create({
      data: {
        terrain: { connect: { id: terrainId } },
      },
    });
    // Upload file to S3 with the id as the key
    const s3Client = getS3Client();

    await s3Client.send(
      new PutObjectCommand({
        Bucket: "photos",
        Key: `${terrainId}/${photo.id}`,
        Body: file,
        ContentType: mimetype,
      })
    );
  },

  async deletePhotoFromTerrain(terrainId: string, photoId: string) {
    // Delete Photo record from the database
    await prisma.photo.delete({
      where: { id: photoId },
    });

    // Delete file from S3
    const s3Client = getS3Client();

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: "photos",
        Key: `${terrainId}/${photoId}`,
      })
    );
  },
};

async function generateSignedUrl(terrainId: string, photoId: string) {
  const s3Client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: "photos",
    Key: `${terrainId}/${photoId}`,
  });

  // Générer l'URL signée (valide pendant 1 heure)
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
