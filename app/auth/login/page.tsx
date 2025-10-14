"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner"; 

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/ui/icons";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

// Validación con Zod
const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [callbackUrl, setCallbackUrl] = useState("/");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const rawCallbackUrl = searchParams?.get("callbackUrl");

    if (rawCallbackUrl) {
      const decoded = decodeURIComponent(rawCallbackUrl); // /error?error=AccessDenied
      const errorMatch = new URLSearchParams(decoded.split("?")[1]).get(
        "error"
      );

      if (errorMatch === "AccessDenied") {
        toast.error("No tienes permisos para acceder a esta sección.");
      }
    }
  }, [searchParams]);

  const onSubmit = async (values: LoginFormValues) => {
    // Aquí va tu lógica de login si decides implementarla con signIn("credentials")
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsGoogleLoading(true);

    try {
      signIn("google", {
        callbackUrl: DEFAULT_LOGIN_REDIRECT,
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Error al iniciar sesión con Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
        <Card className="max-w-md w-full mx-auto md:border-0 md:shadow-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-semibold">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-center">
              Ingresa tu email y contraseña para acceder a tu cuenta
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="nombre@ejemplo.com"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Tu contraseña"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full mt-4 bg-blue-500 hover:bg-blue-600"
                  disabled={isPending || isGoogleLoading}
                >
                  {isPending ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O continúa con
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full hover:bg-gray-100"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isPending}
            >
              {isGoogleLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.google className="mr-2 h-4 w-4" />
              )}
              Continuar con Google
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-muted-foreground">
              ¿Olvidaste tu contraseña?{" "}
              <Link href="#" className="text-primary hover:underline">
                Recupérala aquí
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="relative hidden md:flex items-end bg-gray-100 overflow-hidden">
        <Image
          src="/images/banner2.jpg"
          alt="Mujer con gafas"
          layout="fill"
          objectFit="cover"
          className="z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
        <div className="relative z-20 text-white px-8 py-24 text-start space-y-6"></div>
      </div>
    </div>
  );
}
