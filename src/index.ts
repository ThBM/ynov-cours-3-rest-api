import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { terrainsRouter } from "./routers/terrains.js";
import { authRouter } from "./routers/auth.js";
import { usersRouter } from "./routers/users.js";
import { logger } from "./middlewares/logger.js";

const app = new Hono();

app.use("*", logger);

app.route("/auth", authRouter);
app.route("/terrains", terrainsRouter);
app.route("/users", usersRouter);

const { PORT } = process.env;

serve(
  {
    fetch: app.fetch,
    port: PORT ? Number(PORT) : 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
