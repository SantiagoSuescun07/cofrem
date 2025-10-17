// import NextAuth from "next-auth";
// import { PrismaAdapter } from "@auth/prisma-adapter";

// import { db } from "@/lib/db";
// import authConfig from "@/auth.config";
// import { getUserById } from "@/actions/auth";
// // import { UserRole } from "@prisma/client";

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   trustHost: true,
//   pages: {
//     signIn: "/auth/login",
//     error: "/error",
//   },
//   callbacks: {
//     async signIn({ user, account }) {
//       console.log("Google SignIn user:", user);
//       console.log("Google SignIn account:", account);

//       // Validar dominios permitidos para todos los proveedores
//       const allowedDomains = ["gmail.com", "factoryai.io", "factoryim.co", "cofrem.com.co"];

//       if (user.email) {
//         const emailDomain = user.email.split("@")[1];
//         if (!allowedDomains.includes(emailDomain)) {
//           return false;
//         }
//       }

//       // Para proveedores OAuth (Google, etc.) permitir login directo
//       if (account?.provider !== "credentials") return true;

//       // Para credentials, verificar que el usuario exista en la base de datos
//       const existingUser = await getUserById(user.id);

//       if (!existingUser) return false;

//       return true;
//     },
//     async session({ token, session }) {
//       console.log("Session before return:", session);

//       if (token.sub && session.user) {
//         session.user.id = token.sub;
//       }

//       // if (token.role && session.user) {
//       //   session.user.role = token.role as UserRole;
//       // }

//       if (token.phone && session.user) {
//         session.user.phone = token.phone as string;
//       }

//       if (session.user) {
//         session.user.name = token.name as string;
//         session.user.image = token.image as string;
//       }

//       return session;
//     },
//     async jwt({ token, user, account }) {
//       console.log("JWT callback:", { token, user, account });

//       if (!token.sub) return token;

//       const existingUser = await getUserById(token.sub);

//       if (!existingUser) return token;

//       // token.role = existingUser.role;
//       token.name = existingUser.name;
//       token.image = existingUser.image;
//       token.phone = existingUser.phone;

//       return token;
//     },
//     async redirect({ url, baseUrl }) {
//       return baseUrl;
//     },
//   },
//   adapter: PrismaAdapter(db),
//   session: { strategy: "jwt" },
//   ...authConfig,
// });
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import { getUserById } from "@/actions/auth";
import axios from "axios";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/auth/login",
    error: "/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Validar dominios permitidos para todos los proveedores
      const allowedDomains = [
        "gmail.com",
        "factoryai.io",
        "factoryim.co",
        "cofrem.com.co",
      ];

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
    // async session({ token, session }) {
    //   if (token.sub && session.user) {
    //     session.user.id = token.sub;
    //   }

    //   // if (token.role && session.user) {
    //   //   session.user.role = token.role as UserRole;
    //   // }

    //   if (token.phone && session.user) {
    //     session.user.phone = token.phone as string;
    //   }

    //   if (session.user) {
    //     session.user.name = token.name as string;
    //     session.user.image = token.image as string;
    //   }

    //   return session;
    // },
    // async session({ session, token }) {
    //   if (token.sub && session.user) {
    //     session.user.id = token.sub;
    //   }

    //   if (token.phone && session.user) {
    //     session.user.phone = token.phone as string;
    //   }

    //   if (session.user) {
    //     session.user.name = token.name as string;
    //     session.user.image = token.image as string;
    //   }

    //   if (session.user && token.sub) {
    //     session.user.id = token.sub;
    //     session.user.name = token.name as string;
    //     session.user.image = token.image as string;
    //     session.user.phone = token.phone as string;
    //   }

    //   // 🧠 Type assertion para evitar 'unknown'
    //   const drupalAccessToken = (token as any).drupalAccessToken as
    //     | string
    //     | undefined;
    //   const drupalUser = (token as any).drupalUser as
    //     | {
    //         uid: string;
    //         name: string;
    //         email: string;
    //       }
    //     | undefined;
    //   const drupalTokenExpires = (token as any).drupalTokenExpires as
    //     | number
    //     | undefined;

    //   // 🔹 Añadimos los datos de Drupal
    //   session.drupal = {
    //     accessToken: drupalAccessToken,
    //     user: drupalUser,
    //     expiresAt: drupalTokenExpires,
    //   };

    //   return session;
    // },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.name = token.name as string;
        session.user.image = token.image as string; // 👈 esta es clave
        session.user.phone = token.phone as string;
      }

      const drupalAccessToken = (token as any).drupalAccessToken as
        | string
        | undefined;
      const drupalUser = (token as any).drupalUser as
        | { uid: string; name: string; email: string }
        | undefined;
      const drupalTokenExpires = (token as any).drupalTokenExpires as
        | number
        | undefined;

      session.drupal = {
        accessToken: drupalAccessToken,
        user: drupalUser,
        expiresAt: drupalTokenExpires,
      };

      return session;
    },
    async jwt({ token, user, account }) {
      console.log("JWT callback:", { token, user, account });

      if (user) {
        token.name = user.name ?? token.name;
        token.image = user.image ?? token.image;
        token.email = user.email ?? token.email;
      }

      if (account?.provider === "google" && account.id_token) {
        try {
          const { data } = await axios.post(
            "https://backoffice.cofrem.com.co/api/auth/google",
            { id_token: account.id_token },
            { headers: { "Content-Type": "application/json" } }
          );

          console.log("✅ Access token obtenido de Drupal:", data);

          token.drupalAccessToken = data.access_token;
          token.drupalUser = data.user;
          token.drupalTokenExpires =
            Date.now() + (data.expires_in || 3600) * 1000;
        } catch (error: any) {
          console.error("❌ Error al obtener access_token de Drupal:", error);
        }
      }

      return token;
    },
    // async jwt({ token, user, account }) {
    //   console.log("JWT callback:", { token, user, account });

    //   if (account?.provider === "google" && account.id_token) {
    //     try {
    //       const { data } = await axios.post(
    //         "https://backoffice.cofrem.com.co/api/auth/google",
    //         { id_token: account.id_token },
    //         { headers: { "Content-Type": "application/json" } }
    //       );

    //       console.log("✅ Access token obtenido de Drupal:", data);

    //       // Guardar la información en el JWT
    //       token.drupalAccessToken = data.access_token;
    //       token.drupalUser = data.user;
    //       token.drupalTokenExpires =
    //         Date.now() + (data.expires_in || 3600) * 1000;
    //     } catch (error: any) {
    //       console.error("❌ Error al obtener access_token de Drupal:", error);
    //     }
    //   }

    //   return token;
    // },
    // async jwt({ token, user, account }) {
    //   console.log("JWT callback:", { token, user, account });

    //   // 🔹 Cuando el usuario inicia sesión con Google
    //   if (account?.provider === "google" && account.id_token) {
    //     try {
    //       // ✅ Solicitamos el access_token de Drupal con Axios
    //       console.log("ACCOUNT ID TOKEN: ", account.id_token)
    //       const { data } = await axios.post(
    //         "https://backoffice.cofrem.com.co/api/auth/google",
    //         { id_token: account.id_token },
    //         { headers: { "Content-Type": "application/json" } }
    //       );

    //       console.log("✅ Access token obtenido de Drupal:", data);

    //       // ✅ Guardamos el token y expiración en localStorage (solo si estamos en cliente)
    //       // if (typeof window !== "undefined" && data.access_token) {
    //       //   localStorage.setItem("cofrem.access_token", data.access_token);
    //       //   localStorage.setItem(
    //       //     "cofrem.expires_at",
    //       //     String(Date.now() + (data.expires_in || 3600) * 1000)
    //       //   );
    //       // }

    //       // Guardamos también en el JWT (útil si usas SSR o middleware)
    //       // token.accessToken = data.access_token;
    //       // token.expires_at = Date.now() + (data.expires_in || 3600) * 1000;
    //     } catch (error: any) {
    //       if (axios.isAxiosError(error)) {
    //         console.error(
    //           "❌ Error de Axios:",
    //           error.response
    //         );
    //       } else {
    //         console.error("❌ Error al obtener access_token de Drupal:", error);
    //       }
    //     }
    //   }

    //   if (!token.sub) return token;

    //   const existingUser = await getUserById(token.sub);

    //   if (!existingUser) return token;

    //   // token.role = existingUser.role;
    //   token.name = existingUser.name;
    //   token.image = existingUser.image;
    //   token.phone = existingUser.phone;

    //   return token;
    // },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
