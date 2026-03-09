import { type PrismaClient } from "../../../generated/prisma";
import bcrypt from "bcrypt";

/**
 * Looks up a user by username and includes role data used by auth callbacks.
 *
 * @param db Prisma client used for the query.
 * @param username Username provided during sign-in.
 * @returns Matching user record with role relation, or `null`.
 */
export const findUserByUsername = (db: PrismaClient, username: string) => {
  return db.user.findUnique({
    where: { username: username },
    include: { role: true },
  });
};

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 *
 * @param password Raw password entered by the user.
 * @param hash Persisted bcrypt hash from the database.
 * @returns `true` when credentials are valid, otherwise `false`.
 */
export const verifyUserPassword = async (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
};