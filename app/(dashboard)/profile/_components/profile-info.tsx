"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, Phone, Smartphone, MapPin, Briefcase, Users, User, Edit } from "lucide-react"
import { useCurrentUser } from "@/hooks/user-current-user"
import { useUserProfile } from "@/queries/profile"
import { useEffect, useState } from "react"
import { EditProfileDialog } from "./edit-profile-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

// Hook personalizado para obtener el userId de forma segura
function useUserId() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("cofrem.user")
        if (stored) {
          const parsed = JSON.parse(stored)
          setUserId(parsed?.uid || null)
        }
      } catch (error) {
        console.error("Error al leer localStorage:", error)
      }
    }
  }, [])

  return userId
}

// Componente de skeleton para la card de perfil
function ProfileSkeleton() {
  return (
    <Card className="bg-white overflow-hidden w-full">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <Skeleton className="size-24 sm:size-28 md:size-32 rounded-2xl" />
              {/* <Skeleton className="absolute -bottom-2 -right-2 h-10 w-16 rounded-full" /> */}
            </div>
            <div className="flex-1 text-center sm:text-left space-y-3 w-full">
              <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
              <Skeleton className="h-6 w-36 mx-auto sm:mx-0" />
              <Skeleton className="h-6 w-48 mx-auto sm:mx-0" />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-4 w-full max-w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProfileInfo() {
  const userId = useUserId()
  const user = useCurrentUser()
  const queryClient = useQueryClient()
  const { data: profile, isLoading } = useUserProfile(userId!)

  // Mostrar skeleton mientras carga el userId o el perfil
  if (!userId || isLoading) {
    return <ProfileSkeleton />
  }

  const initials =
    profile?.name || user?.name
      ? (profile?.name || user?.name || "")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
      : "U"

  return (
    <Card className="bg-white overflow-hidden w-full shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col gap-6">
          {/* Header Section - Avatar y nombre */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <Avatar className="size-24 sm:size-28 md:size-32 rounded-2xl shadow-lg ring-4 ring-background">
                <AvatarImage src={profile?.picture || user?.image || ""} className="object-cover" />
                <AvatarFallback className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="relative flex-1 text-center sm:text-left space-y-1 min-w-0">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl text-foreground leading-tight">
                  {profile?.name || user?.name || "Usuario"}
                </h1>
                {/* <Badge className="rounded-full bg-gradient-to-r from-emerald-400 to-emerald-100 text-emerald-950 px-3 py-2 text-sm font-bold shadow-lg border-2 border-background">
                  +550
                </Badge> */}
                <EditProfileDialog
                  className="max-sm:hidden"
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent hover:bg-muted"
                    >
                      <Edit className="h-4 w-4" />
                      Editar perfil
                    </Button>
                  }
                  userId={userId}
                  defaultValues={{
                    gender: profile?.genderId || "",
                    phone: profile?.phone || "",
                    mobile: profile?.mobile || "",
                    profileImageUrl: profile?.picture || "",
                  }}
                  onSuccess={() => {
                    queryClient.invalidateQueries({
                      queryKey: ["user-profile", userId],
                      exact: false
                    });
                    toast.success("Datos actualizados.")
                  }}
                />
              </div>
              <p className="text-base md:text-lg text-muted-foreground font-medium">
                {profile?.position || "Sin cargo"}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground uppercase tracking-wide px-1">
                  Tus puntos: 
                </span>
                <Badge className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 px-6 py-1.5 text-sm font-bold shadow-lg border-2 border-background">
                  +550
                </Badge>
              </div>
              <EditProfileDialog
                className="mt-4 sm:hidden"
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent hover:bg-muted"
                  >
                    <Edit className="h-4 w-4" />
                    Editar perfil
                  </Button>
                }
                userId={userId}
                defaultValues={{
                  gender: profile?.genderId || "",
                  phone: profile?.phone || "",
                  mobile: profile?.mobile || "",
                  profileImageUrl: profile?.picture || "",
                }}
                onSuccess={() => {
                  queryClient.invalidateQueries({
                    queryKey: ["user-profile", userId],
                    exact: false
                  });
                  toast.success("Datos actualizados.")
                }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Info Grid - Información de contacto y detalles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <InfoItem icon={<Briefcase className="h-5 w-5" />} label="Cargo" value={profile?.position || "Sin cargo"} />

            <InfoItem icon={<Users className="h-5 w-5" />} label="Área" value={profile?.area || "Sin área"} />

            <InfoItem
              icon={<User className="h-5 w-5" />}
              label="Género"
              value={profile?.genderName || "Sin especificar"}
            />

            <InfoItem icon={<MapPin className="h-5 w-5" />} label="Sede" value={profile?.location || "Sin sede"} />

            <InfoItem icon={<Phone className="h-5 w-5" />} label="Teléfono" value={profile?.phone || "Sin teléfono"} />

            <InfoItem
              icon={<Smartphone className="h-5 w-5" />}
              label="Celular"
              value={profile?.mobile || "Sin celular"}
            />

            <InfoItem
              icon={<Mail className="h-5 w-5" />}
              label="Correo electrónico"
              value={profile?.email || user?.email || "Sin correo"}
              className="sm:col-span-2 lg:col-span-3"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: string
  className?: string
}

function InfoItem({ icon, label, value, className = "" }: InfoItemProps) {
  return (
    <div className={`flex items-start gap-3 group ${className}`}>
      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0 transition-colors group-hover:bg-primary/20">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
        <p className="text-sm md:text-base text-foreground font-medium truncate">{value}</p>
      </div>
    </div>
  )
}
