import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { terrainRepository } from "../repositories/terrainRepository.js";
import { auth } from "../middlewares/auth.js";

export const terrainsRouter = new Hono();

terrainsRouter.get(
  "/",
  auth,
  zValidator(
    "query",
    z.object({
      page: z.coerce.number().default(1),
      itemsPerPage: z.coerce.number().default(10),
      nom: z.string().optional(),
      prix: z.string().optional(),
    })
  ),
  async (c) => {
    const { page, itemsPerPage, nom, prix } = c.req.valid("query");

    const terrains = await terrainRepository.getAllTerrains({
      page,
      itemsPerPage,
      nom,
      prix,
    });

    return c.json(terrains);
  }
);

terrainsRouter.get(
  "/:id",
  auth,
  zValidator(
    "param",
    z.object({
      id: z.uuid(),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param");

    const terrain = await terrainRepository.getTerrainById(id);

    if (!terrain) {
      return c.json({ message: "Terrain not found" }, 404);
    }

    return c.json(terrain);
  }
);

terrainsRouter.post(
  "/",
  auth,
  zValidator(
    "json",
    z.object({
      nom: z.string().min(1),
      latitude: z.number(),
      longitude: z.number(),
      surface: z.number().min(0),
      surfaceConstructible: z.number().min(0),
      prix: z.number().min(0),
      longueurFacade: z.number().min(0),
      orientationFacade: z.enum(["NORD", "SUD", "EST", "OUEST"]),
    })
  ),
  async (c) => {
    const terrainData = c.req.valid("json");

    const { id: userId } = c.get("user");

    const terrain = await terrainRepository.createTerrain({
      ...terrainData,
      userId,
    });

    return c.json(terrain, 201);
  }
);

terrainsRouter.put(
  "/:id",
  auth,
  zValidator(
    "param",
    z.object({
      id: z.uuid(),
    })
  ),
  zValidator(
    "json",
    z.object({
      nom: z.string().min(1),
      latitude: z.number(),
      longitude: z.number(),
      surface: z.number().min(0),
      surfaceConstructible: z.number().min(0),
      prix: z.number().min(0),
      longueurFacade: z.number().min(0),
      orientationFacade: z.enum(["NORD", "SUD", "EST", "OUEST"]),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const terrainData = c.req.valid("json");

    const { id: userId } = c.get("user");

    const theTerrain = await terrainRepository.getTerrainById(id);
    if (!theTerrain || theTerrain.userId !== userId) {
      return c.json({ message: "Forbidden" }, 403);
    }

    const updatedTerrain = await terrainRepository.updateTerrain(
      id,
      terrainData
    );

    if (!updatedTerrain) {
      return c.json({ message: "Terrain not found" }, 404);
    }

    return c.json(updatedTerrain);
  }
);

terrainsRouter.delete(
  "/:id",
  auth,
  zValidator(
    "param",
    z.object({
      id: z.uuid(),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param");

    const { id: userId } = c.get("user");

    const theTerrain = await terrainRepository.getTerrainById(id);
    if (!theTerrain || theTerrain.userId !== userId) {
      return c.json({ message: "Forbidden" }, 403);
    }

    const res = await terrainRepository.deleteTerrain(id);

    if (!res) {
      return c.json({ message: "Terrain not found" }, 404);
    }

    return c.json({ success: true }, 202);
  }
);

terrainsRouter.post(
  "/:id/photos",
  auth,
  zValidator("param", z.object({ id: z.uuid() })),
  zValidator(
    "form",
    z.object({
      file: z
        .instanceof(File)
        .refine((file) => file.type.startsWith("image/"), {
          message: "File must be an image",
        }),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const { id: userId } = c.get("user");

    // Authorization check
    const theTerrain = await terrainRepository.getTerrainById(id);
    if (!theTerrain || theTerrain.userId !== userId) {
      return c.json({ message: "Forbidden" }, 403);
    }

    const { file } = c.req.valid("form");
    const fileBuffer = await file.arrayBuffer();
    await terrainRepository.addPhotoToTerrain(
      id,
      Buffer.from(fileBuffer),
      file.type
    );

    return c.json({ success: true }, 201);
  }
);

terrainsRouter.delete(
  "/:id/photos/:photoId",
  auth,
  zValidator("param", z.object({ id: z.uuid(), photoId: z.uuid() })),
  async (c) => {
    const { id, photoId } = c.req.valid("param");
    const { id: userId } = c.get("user");

    // Authorization check
    const theTerrain = await terrainRepository.getTerrainById(id);
    if (!theTerrain || theTerrain.userId !== userId) {
      return c.json({ message: "Forbidden" }, 403);
    }

    await terrainRepository.deletePhotoFromTerrain(id, photoId);

    return c.json({ success: true }, 202);
  }
);
