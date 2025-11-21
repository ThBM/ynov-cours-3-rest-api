import { id } from "zod/locales";
import { prisma } from "../lib/prisma.js";
import { hash } from "argon2";

export const userRepository = {
  async getUserByUsername(username: string) {
    const res = await prisma.user.findUnique({
      where: { username },
    });

    return res;
  },

  async getUserById(id: string) {
    const res = await prisma.user.findUnique({
      where: { id },
    });

    return res;
  },

  async createUser(userData: {
    username: string;
    password: string;
    name: string;
  }) {
    const encryptedPassword = await hash(userData.password);

    const res = await prisma.user.create({
      data: {
        username: userData.username,
        password: encryptedPassword,
        name: userData.name,
      },
    });

    return {
      id: res.id,
      username: res.username,
      name: res.name,
    };
  },
};
