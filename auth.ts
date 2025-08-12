import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import { getUserById } from "@/actions/auth";
// import { UserRole } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/auth/login",
    error: "/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Validar dominios permitidos para todos los proveedores
      const allowedDomains = ["factoryai.io", "factoryim.co","cofrem.com.co"];
      
      if (user.email) {
        const emailDomain = user.email.split("@")[1];
        if (!allowedDomains.includes(emailDomain)) {
          return false;
        }
      }

      // Para proveedores OAuth (Google, etc.) permitir login directo
      if (account?.provider !== "credentials") return true;

      // Para credentials, verificar que el usuario exista en la base de datos
      const existingUser = await getUserById(user.id);

      if (!existingUser) return false;

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      // if (token.role && session.user) {
      //   session.user.role = token.role as UserRole;
      // }

      if (token.phone && session.user) {
        session.user.phone = token.phone as string;
      }

      if (session.user) {
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      // token.role = existingUser.role;
      token.name = existingUser.name;
      token.image = existingUser.image;
      token.phone = existingUser.phone;

      return token;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl
    }
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});