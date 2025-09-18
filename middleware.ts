import authConfig from "./auth.config";
import NextAuth from "next-auth";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // const { nextUrl } = req;
  // const isLoggedIn = !!req.auth;

  // console.log("Auth:", req.auth)

  // console.log('Middleware ejecutándose:', {
  //   pathname: nextUrl.pathname,
  //   isLoggedIn,
  //   isPublicRoute: publicRoutes.includes(nextUrl.pathname),
  //   isAuthRoute: authRoutes.includes(nextUrl.pathname)
  // });

  // const isApiRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  // const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  // const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // // Permitir todas las rutas de API de auth
  // if (isApiRoute) {
  //   return null;
  // }

  // // Si está en ruta de auth y ya está logueado, redirigir al dashboard
  // if (isAuthRoute) {
  //   if (isLoggedIn) {
  //     return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  //   }
  //   return null; // Permitir acceso a rutas de auth si no está logueado
  // }

  // // Si no está logueado y la ruta no es pública, redirigir a login
  // if (!isLoggedIn && !isPublicRoute) {
  //   let callbackUrl = nextUrl.pathname;
  //   if (nextUrl.search) {
  //     callbackUrl += nextUrl.search;
  //   }
    
  //   const encodedCallbackUrl = encodeURIComponent(callbackUrl);
  //   return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  // }

  // return null;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};