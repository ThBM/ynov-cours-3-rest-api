import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { terrainsRouter } from "./routers/terrains.js";

const app = new Hono();

app.route("/terrains", terrainsRouter);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
