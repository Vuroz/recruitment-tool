import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

// TODO: Move this to authService
export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};
