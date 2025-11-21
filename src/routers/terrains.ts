import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { terrainRepository } from "../repositories/terrainRepository.js";

export const terrainsRouter = new Hono();

terrainsRouter.get(
  "/",
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

    const terrain = await terrainRepository.createTerrain(terrainData);

    return c.json(terrain, 201);
  }
);

terrainsRouter.put(
  "/:id",
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
  zValidator(
    "param",
    z.object({
      id: z.uuid(),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const res = await terrainRepository.deleteTerrain(id);

    if (!res) {
      return c.json({ message: "Terrain not found" }, 404);
    }

    return c.status(204);
  }
);
