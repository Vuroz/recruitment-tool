import { type PrismaClient } from "../../../generated/prisma";

export const findUserByUsername = (db: PrismaClient, username: string) => {
  return db.user.findUnique({
    where: { username: username }
  });
};

export const verifyUserPassword = async (password: string, hash: string) => {
    return password == hash;
    //   return bcrypt.compare(password, hash);
};