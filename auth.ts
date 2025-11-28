// import NextAuth from "next-auth";
// import { PrismaAdapter } from "@auth/prisma-adapter";

// import { db } from "@/lib/db";
// import authConfig from "@/auth.config";
// import { getUserById } from "@/actions/auth";
// import axios from "axios";

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   trustHost: true,
//   pages: {
//     signIn: "/auth/login",
//     error: "/error",
//   },
//   callbacks: {
//     async signIn({ user, account }) {
//       // Validar dominios permitidos para todos los proveedores
//       const allowedDomains = [
//         "gmail.com",
//         "factoryai.io",
//         "factoryim.co",
//         "cofrem.com.co",
//       ];

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
//     async session({ session, token }) {
//       if (session.user && token.sub) {
//         session.user.id = token.sub;
//         session.user.name = token.name as string;
//         session.user.image = token.image as string;
//         session.user.phone = token.phone as string;
//       }

//       const drupalAccessToken = (token as any).drupalAccessToken as
//         | string
//         | undefined;
//       const drupalUser = (token as any).drupalUser as
//         | { uid: string; name: string; email: string }
//         | undefined;
//       const drupalTokenExpires = (token as any).drupalTokenExpires as
//         | number
//         | undefined;

//       session.drupal = {
//         accessToken: drupalAccessToken,
//         user: drupalUser,
//         expiresAt: drupalTokenExpires,
//       };

//       return session;
//     },
//     async jwt({ token, user, account }) {

//       // ⚡ Si llega un usuario nuevo (primer login), guardar la imagen SOLO si el token aún no tiene una
//       if (user && !token.image) {
//         token.image = user.image ?? null;
//       }

//       // 🔄 Si ya existe token.image, NO reemplazarla aunque Google envíe una nueva
//       if (token.image && user?.image) {
//         // NO reemplazar la imagen existente
//       }

//       // === Tu lógica original permanece intacta ===
//       if (user) {
//         token.name = user.name ?? token.name;
//         token.email = user.email ?? token.email;
//         // ⚠ Aquí NO seteamos token.image = user.image
//         // porque queremos mantener la foto fija
//       }

//       if (account?.provider === "google" && account.id_token) {
//         try {
//           const { data } = await axios.post(
//             "https://backoffice.cofrem.com.co/api/auth/google",
//             { id_token: account.id_token },
//             { headers: { "Content-Type": "application/json" } }
//           );

//           token.drupalAccessToken = data.access_token;
//           token.drupalUser = data.user;
//           token.drupalTokenExpires =
//             Date.now() + (data.expires_in || 3600) * 1000;
//         } catch (error) {
//           console.error("❌ Error al obtener access_token de Drupal:", error);
//         }
//       }

//       return token;
//     },
//     // async jwt({ token, user, account }) {
//     //   console.log("JWT callback:", { token, user, account });

//     //   if (user) {
//     //     token.name = user.name ?? token.name;
//     //     token.image = user.image ?? token.image;
//     //     token.email = user.email ?? token.email;
//     //   }

//     //   if (account?.provider === "google" && account.id_token) {
//     //     try {
//     //       const { data } = await axios.post(
//     //         "https://backoffice.cofrem.com.co/api/auth/google",
//     //         { id_token: account.id_token },
//     //         { headers: { "Content-Type": "application/json" } }
//     //       );

//     //       console.log("✅ Access token obtenido de Drupal:", data);

//     //       token.drupalAccessToken = data.access_token;
//     //       token.drupalUser = data.user;
//     //       token.drupalTokenExpires =
//     //         Date.now() + (data.expires_in || 3600) * 1000;
//     //     } catch (error: any) {
//     //       console.error("❌ Error al obtener access_token de Drupal:", error);
//     //     }
//     //   }

//     //   return token;
//     // },
//     async redirect({ url, baseUrl }) {
//       return baseUrl;
//     },
//   },
//   adapter: PrismaAdapter(db),
//   session: { strategy: "jwt" },
//   ...authConfig,
// });


// import NextAuth from "next-auth";
// import { PrismaAdapter } from "@auth/prisma-adapter";

// import { db } from "@/lib/db";
// import authConfig from "@/auth.config";
// import { getUserById } from "@/actions/auth";
// import axios from "axios";
// import { getUserProfile } from "./services/profile/get-user-profile";

// // Función auxiliar para obtener el perfil con token explícito
// async function fetchDrupalUserProfile(userId: string, accessToken: string) {
//   try {
//     const { data } = await axios.get(
//       `https://backoffice.cofrem.com.co/user/${userId}?_format=json`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // Retornar solo la URL de la imagen si existe
//     return data.user_picture?.[0]?.url ?? null;
//   } catch (error) {
//     console.error("⚠️ Error al obtener perfil de Drupal:", error);
//     return null;
//   }
// }

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   trustHost: true,
//   pages: {
//     signIn: "/auth/login",
//     error: "/error",
//   },
//   callbacks: {
//     async signIn({ user, account }) {
//       // Validar dominios permitidos para todos los proveedores
//       const allowedDomains = [
//         "gmail.com",
//         "factoryai.io",
//         "factoryim.co",
//         "cofrem.com.co",
//       ];

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
//     async session({ session, token }) {
//       if (session.user && token.sub) {
//         session.user.id = token.sub;
//         session.user.name = token.name as string;
//         session.user.image = token.image as string;
//         session.user.phone = token.phone as string;
//       }

//       const drupalAccessToken = (token as any).drupalAccessToken as
//         | string
//         | undefined;
//       const drupalUser = (token as any).drupalUser as
//         | { uid: string; name: string; email: string }
//         | undefined;
//       const drupalTokenExpires = (token as any).drupalTokenExpires as
//         | number
//         | undefined;

//       session.drupal = {
//         accessToken: drupalAccessToken,
//         user: drupalUser,
//         expiresAt: drupalTokenExpires,
//       };

//       return session;
//     },
//     async jwt({ token, user, account }) {
//       // Actualizar información básica del usuario
//       if (user) {
//         token.name = user.name ?? token.name;
//         token.email = user.email ?? token.email;
//       }

//       // Procesar login con Google
//       if (account?.provider === "google" && account.id_token) {
//         try {
//           const { data } = await axios.post(
//             "https://backoffice.cofrem.com.co/api/auth/google",
//             { id_token: account.id_token },
//             { headers: { "Content-Type": "application/json" } }
//           );

//           console.log("✅ Access token obtenido de Drupal:", data);

//           token.drupalAccessToken = data.access_token;
//           token.drupalUser = data.user;
//           token.drupalTokenExpires =
//             Date.now() + (data.expires_in || 3600) * 1000;

//           // 🎯 LÓGICA MEJORADA: Obtener imagen de Drupal con el token recién obtenido
//           const drupalPicture = await fetchDrupalUserProfile(
//             data.user.uid,
//             data.access_token
//           );

//           // Prioridad de imágenes:
//           // 1. Imagen personalizada de Drupal
//           // 2. Imagen existente en token (preservar entre sesiones)
//           // 3. Imagen de Google (como fallback inicial)
//           if (drupalPicture) {
//             token.image = drupalPicture;
//             console.log("🖼️ Usando imagen de Drupal:", drupalPicture);
//           } else if (!token.image && user?.image) {
//             token.image = user.image;
//             console.log("🖼️ Usando imagen de Google:", user.image);
//           } else {
//             console.log("🖼️ Manteniendo imagen existente:", token.image);
//           }
//         } catch (error) {
//           console.error("❌ Error al obtener access_token de Drupal:", error);
//         }
//       }

//       return token;
//     },
//     // async jwt({ token, user, account }) {
//     //   // Actualizar información básica del usuario
//     //   if (user) {
//     //     token.name = user.name ?? token.name;
//     //     token.email = user.email ?? token.email;
//     //   }

//     //   // Procesar login con Google
//     //   if (account?.provider === "google" && account.id_token) {
//     //     try {
//     //       const { data } = await axios.post(
//     //         "https://backoffice.cofrem.com.co/api/auth/google",
//     //         { id_token: account.id_token },
//     //         { headers: { "Content-Type": "application/json" } }
//     //       );

//     //       console.log({"DATA": data})

//     //       token.drupalAccessToken = data.access_token;
//     //       token.drupalUser = data.user;
//     //       token.drupalTokenExpires =
//     //         Date.now() + (data.expires_in || 3600) * 1000;

//     //       // 🎯 LÓGICA MEJORADA: Solo actualizar imagen si es necesario
//     //       try {
//     //         // Obtener el perfil completo del usuario desde Drupal
//     //         const drupalProfile = await getUserProfile(data.user.uid);
            
//     //         // Si el usuario tiene una imagen personalizada en Drupal, usarla
//     //         if (drupalProfile.picture) {
//     //           token.image = drupalProfile.picture;
//     //         } 
//     //         // Si NO tiene imagen en Drupal pero viene de Google, usar la de Google
//     //         else if (user?.image && !token.image) {
//     //           token.image = user.image;
//     //         }
//     //         // Si ya existe una imagen en el token, mantenerla
//     //         // (esto evita que se sobrescriba en logins posteriores)
            
//     //       } catch (profileError) {
//     //         console.error("⚠️ Error al obtener perfil de Drupal:", profileError);
//     //         // Si falla la consulta a Drupal, mantener la imagen existente o usar la de Google
//     //         if (!token.image && user?.image) {
//     //           token.image = user.image;
//     //         }
//     //       }
//     //     } catch (error) {
//     //       console.error("❌ Error al obtener access_token de Drupal:", error);
//     //     }
//     //   }

//     //   return token;
//     // },
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

// Función auxiliar para obtener el perfil con token explícito
async function fetchDrupalUserProfile(userId: string, accessToken: string) {
  try {
    const { data } = await axios.get(
      `https://backoffice.cofrem.com.co/user/${userId}?_format=json`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Retornar imagen y cargo del usuario
    return {
      picture: data.user_picture?.[0]?.url ?? null,
      position: data.field_charge?.[0]?.value ?? null,
    };
  } catch (error) {
    console.error("⚠️ Error al obtener perfil de Drupal:", error);
    return { picture: null, position: null };
  }
}

// Función para refrescar el token de Google
async function refreshGoogleToken(refreshToken: string) {
  try {
    const params = new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID || "",
      client_secret: process.env.AUTH_GOOGLE_SECRET || "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    const { data } = await axios.post(
      "https://oauth2.googleapis.com/token",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return {
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
      refreshToken: data.refresh_token || refreshToken, // Mantener el refresh token si no viene uno nuevo
    };
  } catch (error) {
    console.error("❌ Error al refrescar token de Google:", error);
    return null;
  }
}

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
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.phone = token.phone as string;
        session.user.position = token.position as string; // 👈 CARGO DEL USUARIO
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
      // Actualizar información básica del usuario
      if (user) {
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
      }

      // 🔄 REFRESH TOKEN: Si el token de Google está próximo a expirar, refrescarlo
      const googleAccessToken = (token as any).googleAccessToken as
        | string
        | undefined;
      const googleRefreshToken = (token as any).googleRefreshToken as
        | string
        | undefined;
      const googleTokenExpires = (token as any).googleTokenExpires as
        | number
        | undefined;

      // Si tenemos un refresh token y el access token está próximo a expirar (menos de 5 minutos)
      if (
        googleRefreshToken &&
        googleTokenExpires &&
        Date.now() >= googleTokenExpires - 5 * 60 * 1000
      ) {
        console.log("🔄 Refrescando token de Google...");
        const refreshed = await refreshGoogleToken(googleRefreshToken);
        if (refreshed) {
          (token as any).googleAccessToken = refreshed.accessToken;
          (token as any).googleTokenExpires = refreshed.expiresAt;
          (token as any).googleRefreshToken = refreshed.refreshToken;
          console.log("✅ Token de Google refrescado exitosamente");
        }
      }

      // Procesar login inicial con Google
      if (account?.provider === "google") {
        // Guardar tokens de Google (access_token, refresh_token, expires_at)
        if (account.access_token) {
          (token as any).googleAccessToken = account.access_token;
          (token as any).googleTokenExpires =
            account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000;
        }
        if (account.refresh_token) {
          (token as any).googleRefreshToken = account.refresh_token;
          console.log("💾 Refresh token de Google guardado");
        }

        // Procesar autenticación con Drupal usando id_token
        if (account.id_token) {
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

            // 🎯 LÓGICA MEJORADA: Obtener imagen y cargo de Drupal
            const drupalProfile = await fetchDrupalUserProfile(
              data.user.uid,
              data.access_token
            );

            // Guardar cargo en el token
            if (drupalProfile.position) {
              token.position = drupalProfile.position;
              console.log("💼 Cargo obtenido:", drupalProfile.position);
            }

            // Prioridad de imágenes:
            // 1. Imagen personalizada de Drupal
            // 2. Imagen existente en token (preservar entre sesiones)
            // 3. Imagen de Google (como fallback inicial)
            if (drupalProfile.picture) {
              token.image = drupalProfile.picture;
              console.log("🖼️ Usando imagen de Drupal:", drupalProfile.picture);
            } else if (!token.image && user?.image) {
              token.image = user.image;
              console.log("🖼️ Usando imagen de Google:", user.image);
            } else {
              console.log("🖼️ Manteniendo imagen existente:", token.image);
            }
          } catch (error) {
            console.error("❌ Error al obtener access_token de Drupal:", error);
          }
        }
      }

      return token;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});