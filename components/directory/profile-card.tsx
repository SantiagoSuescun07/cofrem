import { Card, CardContent } from "@/components/ui/card";
import { Building2, User, Phone, Mail } from "lucide-react";
import Image from "next/image";

interface ProfileCardProps {
  name: string;
  position: string;
  division: string;
  jobTitle: string;
  phone: string;
  email: string;
  imageUrl: string;
}

export function ProfileCard({
  name,
  position,
  division,
  jobTitle,
  phone,
  email,
  imageUrl,
}: ProfileCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow py-0">
      <div className="relative h-64 ">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{name}</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-sm text-foreground leading-relaxed">
              {position}
            </p>
          </div>

          {/* <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-sm text-foreground leading-relaxed">
              {jobTitle}
            </p>
          </div> */}

          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary " />
            <p className="text-sm text-foreground">{phone}</p>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary " />
            <p className="text-sm text-foreground break-all">{email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
