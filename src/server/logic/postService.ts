import { type PrismaClient } from "../../../generated/prisma";

export const createPost = (db: PrismaClient, userId: string, name: string) => {
  return db.post.create({
    data: {
      name,
      createdBy: { connect: { id: userId } },
    },
  });
};

export const getLatestPost = (db: PrismaClient, userId: string) => {
  return db.post.findFirst({
    orderBy: { createdAt: "desc" },
    where: { createdBy: { id: userId } },
  });
};
