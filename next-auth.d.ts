import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

// TODO: Extenderlo con el Id del parqueadero al que pertence
export type ExtendedUser = DefaultSession["user"] & {
  name: string | null;
  image: string | null;
  phone: string | null;
};

// declare module "next-auth" {
//   interface Session {
//     user: ExtendedUser
//   }
// }
declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
    drupal?: {
      accessToken?: string;
      user?: {
        uid: string;
        name: string;
        email: string;
      };
      expiresAt?: number;
    };
  }

  interface JWT {
    drupalAccessToken?: string;
    drupalUser?: {
      uid: string;
      name: string;
      email: string;
    };
    drupalTokenExpires?: number;
  }
}
