import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle, Clock, FileText } from "lucide-react";
import React from "react";

const mockPQRs = [
  {
    id: "PQR-001",
    tipo: "Petición",
    asunto: "Solicitud de información sobre servicios",
    estado: "En revisión",
    fechaCreacion: "2024-01-15",
    fechaActualizacion: "2024-01-16",
    descripcion:
      "Solicito información detallada sobre los servicios disponibles...",
  },
  {
    id: "PQR-002",
    tipo: "Queja",
    asunto: "Demora en respuesta de soporte técnico",
    estado: "En gestión",
    fechaCreacion: "2024-01-14",
    fechaActualizacion: "2024-01-15",
    descripcion:
      "He estado esperando respuesta del equipo de soporte por más de 48 horas...",
  },
  {
    id: "PQR-003",
    tipo: "Reclamo",
    asunto: "Facturación incorrecta en el último período",
    estado: "Resuelto",
    fechaCreacion: "2024-01-10",
    fechaActualizacion: "2024-01-14",
    descripcion:
      "La factura del mes pasado presenta inconsistencias en los montos...",
  },
  {
    id: "PQR-004",
    tipo: "Petición",
    asunto: "Cambio de datos personales",
    estado: "Radicado",
    fechaCreacion: "2024-01-16",
    fechaActualizacion: "2024-01-16",
    descripcion:
      "Necesito actualizar mi información de contacto en el sistema...",
  },
];

const getStatusIcon = (estado: string) => {
  switch (estado) {
    case "Radicado":
      return <FileText className="h-4 w-4" />;
    case "En revisión":
      return <Clock className="h-4 w-4" />;
    case "En gestión":
      return <AlertCircle className="h-4 w-4" />;
    case "Resuelto":
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getStatusColor = (estado: string) => {
  switch (estado) {
    case "Radicado":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "En revisión":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "En gestión":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Resuelto":
      return "bg-green-50 text-green-700 border-green-200";
    case "Reabierto":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export function PQRList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis PQRs</CardTitle>
        <CardDescription>
          Lista de todas tus peticiones, quejas y reclamos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockPQRs.map((pqr) => (
            <div
              key={pqr.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge
                    variant="outline"
                    className="font-mono border-primary text-primary"
                  >
                    {pqr.id}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-secondary text-secondary-foreground"
                  >
                    {pqr.tipo}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={getStatusColor(pqr.estado)}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(pqr.estado)}
                      {pqr.estado}
                    </div>
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1 text-foreground">
                  {pqr.asunto}
                </h3>
                <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                  {pqr.descripcion}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Creado: {pqr.fechaCreacion}</span>
                  <span>Actualizado: {pqr.fechaActualizacion}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
              >
                Ver Detalles
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
