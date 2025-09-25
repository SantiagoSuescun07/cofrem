"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  tipo: z.string().min(1, "Selecciona el tipo de PQR"),
  asunto: z.string().min(5, "El asunto debe tener al menos 5 caracteres"),
  descripcion: z
    .string()
    .min(20, "La descripción debe tener al menos 20 caracteres"),
  estado: z.string().min(1, "Selecciona el estado"),
  respuesta: z.string().optional(),
  observacionesInternas: z.string().optional(),
  evidencia: z.any().optional(),
});

interface PQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PQRModal({ isOpen, onClose }: PQRModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: "",
      asunto: "",
      descripcion: "",
      estado: "",
      respuesta: "",
      observacionesInternas: "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById("evidencia") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast.success("PQR creada exitosamente", {
      description: "Tu solicitud ha sido registrada y será procesada pronto.",
    });
    form.reset();
    setSelectedFile(null);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">Nueva PQR</DialogTitle>
          <DialogDescription>
            Completa el formulario para crear una nueva Petición, Queja o
            Reclamo
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">
                      Tipo de PQR
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-input focus:ring-primary">
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="peticion">Petición</SelectItem>
                        <SelectItem value="queja">Queja</SelectItem>
                        <SelectItem value="reclamo">Reclamo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">
                      Cambiar Estado *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-input focus:ring-primary">
                          <SelectValue placeholder="Selecciona el estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="radicado">Radicado</SelectItem>
                        <SelectItem value="en-revision">En revisión</SelectItem>
                        <SelectItem value="en-gestion">En gestión</SelectItem>
                        <SelectItem value="resuelto">Resuelto</SelectItem>
                        <SelectItem value="reabierto">Reabierto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-muted-foreground">
                      Opciones: Radicado, En revisión, En gestión, Resuelto,
                      Reabierto. Campo para escribir la respuesta que será
                      visible para el empleado.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="asunto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asunto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Describe brevemente el asunto"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe detalladamente tu petición, queja o reclamo"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="respuesta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">
                    Respuesta (Parcial/Final) - Opcional
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Campo para escribir la respuesta que será visible para el empleado"
                      className="min-h-[100px] border-input focus:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground">
                    Campo para escribir la respuesta que será visible para el
                    empleado.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacionesInternas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">
                    Observaciones Internas - Opcional
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Campo para notas del gestor que no serán visibles para el empleado"
                      className="min-h-[80px] border-input focus:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground">
                    Campo para notas del gestor que no serán visibles para el
                    empleado.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="evidencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">
                    Adjuntar Evidencia - Opcional
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="evidencia"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-primary" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold text-primary">
                                Haz clic para subir
                              </span>{" "}
                              o arrastra y suelta
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG, PDF (MAX. 10MB)
                            </p>
                          </div>
                          <input
                            id="evidencia"
                            type="file"
                            className="hidden"
                            accept=".png,.jpg,.jpeg,.pdf"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      {selectedFile && (
                        <div className="flex items-center justify-between p-3 bg-accent rounded-lg border border-accent-foreground/20">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm">
                              <p className="font-medium text-accent-foreground">
                                {selectedFile.name}
                              </p>
                              <p className="text-muted-foreground">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="text-muted-foreground">
                    Permite subir un archivo como evidencia de la gestión o
                    respuesta.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-rose-400 text-rose-500 hover:bg-rose-400 hover:text-primary-foreground bg-transparent"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Crear PQR
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
