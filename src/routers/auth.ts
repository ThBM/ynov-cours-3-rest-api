import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { userRepository } from "../repositories/userRepository.js";
import { verify } from "argon2";
import { sign } from "../lib/jwt.js";

export const authRouter = new Hono();

authRouter.post(
  "/register",
  zValidator(
    "json",
    z.object({
      username: z.string().min(3),
      password: z.string().min(6),
      name: z.string().min(1),
    })
  ),
  async (c) => {
    const { username, password, name } = c.req.valid("json");

    // Vérfier si l'utilisateur existe déjà
    const existingUser = await userRepository.getUserByUsername(username);
    if (existingUser) {
      return c.json({ message: "Username already taken" }, 409);
    }

    // Créer un nouvel utilisateur

    const newUser = await userRepository.createUser({
      username,
      password,
      name,
    });

    return c.json(newUser, 201);
  }
);

authRouter.post(
  "/login",
  zValidator(
    "json",
    z.object({
      username: z.string(),
      password: z.string(),
    })
  ),
  async (c) => {
    const { username, password } = c.req.valid("json");

    const user = await userRepository.getUserByUsername(username);

    if (!user) {
      return c.json({ message: "Invalid username or password" }, 401);
    }

    const passwordMatches = await verify(user.password, password);
    if (!passwordMatches) {
      return c.json({ message: "Invalid username or password" }, 401);
    }

    // Ici, vous pouvez générer un token JWT
    const token = sign({ id: user.id, username: user.username });

    return c.json({ token });
  }
);
