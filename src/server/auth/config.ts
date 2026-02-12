import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "@/server/db";
import { verifyUserPassword, findUserByUsername } from "@/server/logic/authService";
import { USER_ROLES, type UserRole } from "@/server/auth/roles";

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const username = credentials?.username;
        const password = credentials?.password;

        if (typeof username !== "string" || typeof password !== "string") {
          console.error("Missing credentials");
          return null;
        }

        const user = await findUserByUsername(db, username);

        if (!user) {
          console.error("No user for", username);
          return null;
        }

        if (!user.password) {
          console.error("User has no password");
          return null;
        }

        const passwordValid = await verifyUserPassword(password, user.password);

        if (!passwordValid) {
          console.error("Bad password");
          return null;
        }

        const roleName = user.role?.name;
        const role =
          roleName === USER_ROLES.RECRUITER || roleName === USER_ROLES.APPLICANT
            ? roleName
            : undefined;

        return {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email ?? undefined,
          username: user.username ?? undefined,
          role: role,
        };
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string | undefined;
        session.user.role = token.role as UserRole | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
