import { createMiddleware } from "hono/factory";
import { verify } from "../lib/jwt.js";
import { userRepository } from "../repositories/userRepository.js";

export const auth = createMiddleware<{
  Variables: {
    user: {
      id: string;
      username: string;
      name: string;
    };
  };
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.json({ message: "Authorization header missing" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  // Ici, vous devriez vérifier le token et extraire les informations de l'utilisateur
  // Pour l'instant, nous allons juste retourner un message fictif

  try {
    const { id } = verify(token); // Remplacez par la vérification réelle du token

    const user = await userRepository.getUserById(id);
    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    c.set("user", {
      id: user.id,
      username: user.username,
      name: user.name,
    });

    await next();
  } catch (error) {
    return c.json({ message: "Invalid token" }, 401);
  }
});
