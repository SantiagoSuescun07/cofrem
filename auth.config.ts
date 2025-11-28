import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";

import { LoginFormSchema } from "@/schemas/auth";
import { getUserByEmail } from "@/actions/auth";

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      authorize: async (credentials) => {
        const result = LoginFormSchema.safeParse(credentials);

        if (result.success) {
          const { email, password } = result.data;

          const allowedDomains = ["gmail.com", "factoryai.io", "factoryim.co","cofrem.com.co"];
          const emailDomain = email.split("@")[1];
          if (!allowedDomains.includes(emailDomain)) {
            return null;
          }

          const user = await getUserByEmail(email);

          if (!user || !user.password) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(password, user.password);

          if (passwordMatch) return user;
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
