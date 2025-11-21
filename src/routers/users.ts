import { Hono } from "hono";
import { auth } from "../middlewares/auth.js";

export const usersRouter = new Hono();

usersRouter.get("/me", auth, async (c) => {
  const user = c.get("user");

  return c.json({ user });
});
