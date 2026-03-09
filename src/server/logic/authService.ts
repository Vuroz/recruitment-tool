import { type PrismaClient } from "../../../generated/prisma";
import bcrypt from "bcrypt";

export const findUserByUsername = (db: PrismaClient, username: string) => {
  return db.user.findUnique({
    where: { username: username },
    include: { role: true },
  });
};

export const verifyUserPassword = async (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
};