import { ProgressBar } from "@/components/common/progress-bar";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, User, Star } from "lucide-react";
import Image from "next/image";

export function AchievementCards() {
  const achievements = [
    {
      icon: "/icons/blue-welcome.png",
      title: "Bienvenida",
      description: "Completaste tu registro exitosamente",
      color: "bg-[#d2eeff]",
      bgColor: "bg-white",
    },
    {
      icon: "/icons/perfil-icon.png",
      title: "Perfil",
      description: "Configuraste tu perfil completo",
      color: "bg-[#d4ffe8]",
      bgColor: "bg-white",
    },
    {
      icon: "/icons/start-icon.png",
      title: "Usuario Estrella",
      description: "Alcanzaste 500+ puntos de experiencia",
      color: "bg-[#d5fef6]",
      bgColor: "bg-white",
    },
  ];

  return (
    <div className="mt-20">
      <h2 className="text-xl mb-6 flex items-center gap-2">
        <Image
          src="/icons/blue-insigneas.png"
          alt="Insignias icon"
          width={40}
          height={40}
          priority
          className="size-[23px] mr-2"
        />
        Mis insignias
        <ProgressBar />
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {achievements.map((achievement, index) => {
          const IconComponent = achievement.icon;
          return (
            <Card
              key={index}
              className={`${achievement.bgColor} border border-muted hover:scale-105 transition-transform duration-200 cursor-pointer`}
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`inline-flex p-4 rounded-xl ${achievement.color} mb-4`}
                >
                  <Image
                    src={achievement.icon}
                    alt="Icon"
                    width={40}
                    height={40}
                    priority
                    className="size-[40px] object-cover"
                  />
                </div>
                <h3 className="text-2xl mb-2">{achievement.title}</h3>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
