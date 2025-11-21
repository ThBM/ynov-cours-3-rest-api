import jwt from "jsonwebtoken";
import z from "zod";

const { JWT_SECRET } = process.env;

type JWTPayload = {
  id: string;
  username: string;
};

export const sign = (payload: JWTPayload): string => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "1h",
  });
};

export const verify = (token: string): JWTPayload => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const payload = jwt.verify(token, JWT_SECRET);

  const { id, username } = z
    .object({
      id: z.uuid(),
      username: z.string(),
    })
    .parse(payload);

  return { id, username };
};
