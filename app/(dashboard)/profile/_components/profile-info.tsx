"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  Smartphone,
  MapPin,
  Briefcase,
  Users,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/user-current-user";

export function ProfileInfo() {
  const user = useCurrentUser();

  const profileData = {
    name: "María González Rodríguez",
    position: "Gerente de Desarrollo",
    area: "Tecnología e Innovación",
    gender: "Femenino",
    location: "Madrid, España",
    email: "maria.gonzalez@empresa.com",
    phone: "+34 91 123 4567",
    mobile: "+34 678 901 234",
    points: 550,
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="size-32 md:size-56 rounded-xl">
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary to-accent text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        <Badge className="bg-gold text-gold-foreground px-4 py-2 text-lg font-bold shadow-lg">
          +{profileData.points}
        </Badge>
      </div>
      <Card className="bg-white overflow-hidden w-full py-6">
        <CardContent className="px-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Información personal */}
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-3xl text-foreground mb-2">{user?.name}</h1>
                <p className="text-xl text-muted-foreground">
                  {profileData.position}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Cargo</p>
                    <p className="text-sm">{profileData.position}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Área</p>
                    <p className="text-sm">{profileData.area}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Género
                    </p>
                    <p className="text-sm">{profileData.gender}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Sede</p>
                    <p className="text-sm">{profileData.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Correo electrónico
                    </p>
                    <p className="text-sm">{profileData.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Teléfono
                    </p>
                    <p className="text-sm">{profileData.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground md:col-span-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Celular
                    </p>
                    <p className="text-sm">{profileData.mobile}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
