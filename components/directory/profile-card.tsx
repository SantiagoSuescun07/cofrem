import { Card, CardContent } from "@/components/ui/card"
import { Building2, User, Phone, Mail } from "lucide-react"
import Image from "next/image"

interface ProfileCardProps {
  name: string
  position: string
  division: string
  jobTitle: string
  phone: string
  email: string
  imageUrl: string
}

export function ProfileCard({ name, position, division, jobTitle, phone, email, imageUrl }: ProfileCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-64 bg-gradient-to-b from-gray-100 to-gray-200">
        <Image src={imageUrl || "/placeholder.svg"} alt={name} fill className="object-cover" />
        <div className="absolute bottom-3 left-3 flex gap-2">
          <div className="bg-white px-3 py-1.5 rounded shadow-sm">
            <Image src="/cofrem-logo.jpg" alt="Cofrem" width={60} height={20} className="h-5 w-auto" />
          </div>
          <div className="bg-white px-3 py-1.5 rounded shadow-sm">
            <Image src="/generic-company-logo.png" alt="Company" width={60} height={20} className="h-5 w-auto" />
          </div>
        </div>
      </div>
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{name}</h3>
          <p className="text-base text-foreground">{position}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground leading-relaxed">{division}</p>
          </div>

          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground leading-relaxed">{jobTitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary flex-shrink-0" />
            <p className="text-sm text-foreground">{phone}</p>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary flex-shrink-0" />
            <p className="text-sm text-foreground break-all">{email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
