import { Card, CardContent } from "@/components/ui/card"
import { ThumbsUp, User, Star } from "lucide-react"

export function AchievementCards() {
  const achievements = [
    {
      icon: ThumbsUp,
      title: "Bienvenida",
      description: "Completaste tu registro exitosamente",
      color: "bg-success text-success-foreground",
      bgColor: "bg-success/10",
    },
    {
      icon: User,
      title: "Perfil",
      description: "Configuraste tu perfil completo",
      color: "bg-primary text-primary-foreground",
      bgColor: "bg-primary/10",
    },
    {
      icon: Star,
      title: "Usuario Estrella",
      description: "Alcanzaste 500+ puntos de experiencia",
      color: "bg-gold text-gold-foreground",
      bgColor: "bg-gold/10",
    },
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Star className="h-5 w-5 text-gold" />
        Logros Destacados
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {achievements.map((achievement, index) => {
          const IconComponent = achievement.icon
          return (
            <Card
              key={index}
              className={`${achievement.bgColor} border-2 hover:scale-105 transition-transform duration-200 cursor-pointer`}
            >
              <CardContent className="p-6 text-center">
                <div className={`inline-flex p-4 rounded-full ${achievement.color} mb-4`}>
                  <IconComponent className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{achievement.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
