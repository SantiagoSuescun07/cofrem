import * as React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { fetchTaxonomyTerms } from "@/services/taxonomies";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const editProfileSchema = z.object({
  gender: z.string().optional(),
  phone: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),
  profileImage: z.any().optional(),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export interface EditProfileDialogProps {
  trigger: React.ReactNode;
  userId: string;
  defaultValues?: {
    gender?: string;
    phone?: string | null;
    mobile?: string | null;
    profileImageUrl?: string;
  };
  onClose?: () => void;
  onSuccess?: () => void;
}

export function EditProfileDialog({
  trigger,
  userId,
  defaultValues,
  onClose,
  onSuccess,
}: EditProfileDialogProps) {
  const { data: genders } = useQuery({
    queryKey: ["taxonomy", "gender"],
    queryFn: () => fetchTaxonomyTerms("/jsonapi/taxonomy_term/gender"),
  });

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      gender: defaultValues?.gender ?? "",
      phone: defaultValues?.phone ?? "",
      mobile: defaultValues?.mobile ?? "",
      profileImage: undefined,
    },
  });

  const { isValid, isSubmitting } = form.formState

  const [profileImageUrl, setProfileImageUrl] = React.useState<string>(
    defaultValues?.profileImageUrl || ""
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileImageUrl(url);
      form.setValue("profileImage", file);
    }
  };


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  React.useEffect(() => {
    if (defaultValues) {
      form.reset({
        gender: defaultValues.gender ?? "",
        phone: defaultValues.phone ?? "",
        mobile: defaultValues.mobile ?? "",
        profileImage: undefined,
      });

      setProfileImageUrl(defaultValues.profileImageUrl || "");
    }
  }, [defaultValues, form]);


  const onSubmit = async (values: EditProfileFormValues) => {
    try {
      let payload: Record<string, any> = {};

      if (values.gender) {
        payload.field_gender = [
          {
            target_id: values.gender,
            target_type: "taxonomy_term",
          },
        ];
      }

      if (values.phone) {
        payload.field_phone = [{ value: values.phone }];
      }

      if (values.mobile) {
        payload.field_cell_phone = [{ value: values.mobile }];
      }

      if (values.profileImage instanceof File) {
        const file = values.profileImage;
        // Cargar la imagen a Drupal para obtener fid y uuid. Utilizamos el endpoint
        // estándar de archivos de Drupal para subir la foto de usuario.
        const uploadResponse = await api.post(
          `/file/upload/user/user/user_picture?_format=json`,
          file,
          {
            headers: {
              "Content-Type": "application/octet-stream",
              Accept: "application/json",
              "Content-Disposition": `form-data; filename="${file.name}"`,
            },
          }
        );

        if (uploadResponse.status === 201) {
          const imageData = uploadResponse.data;
          payload.user_picture = [
            {
              target_id: imageData.fid[0],
              target_type: "file",
              target_uuid: imageData.uuid[0].value,
              url: imageData.uri[0].url,
            },
          ];
        }
      }

      console.log("Payload: ", payload)

      // Si el payload no contiene cambios, no hacemos el PATCH.
      if (Object.keys(payload).length > 0) {
        const res = await api.patch(`/user/${userId}?_format=json`, payload);
        if (res.status === 200) {
          // Notificar éxito al padre.
          onSuccess?.();
        }
      }
    } catch (error) {
      toast.error("Error al actualizar el perfil");
    }
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose?.();
        }
      }}
    >
      {/* Utilizar el trigger pasado como prop para abrir el diálogo */}
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-normal">Editar perfil</DialogTitle>
          <DialogDescription>
            Modifica tu género, teléfonos de contacto y tu foto de perfil.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Sección de la foto de perfil */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-20 w-20 rounded-full">
                <AvatarImage src={profileImageUrl || ""} className="object-contain" />
                <AvatarFallback>IMG</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUploadClick}
                >
                  Subir foto
                </Button>
                {/* Input file oculto */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                />
                <p className="text-xs text-muted-foreground">
                  JPG, GIF o PNG. Máx 1&nbsp;MB.
                </p>
              </div>
            </div>

            {/* Selector de género */}
            <Controller
              name="gender"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Género</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="min-w-full w-full" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Selecciona tu género" />
                      </SelectTrigger>
                      <SelectContent>
                        {genders?.map((gender) => (
                          <SelectItem key={gender.id} value={String(gender.tid)}>
                            {gender.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de teléfono fijo */}
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Número de teléfono fijo"
                      aria-invalid={fieldState.invalid}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de celular */}
            <Controller
              name="mobile"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Celular</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Número de celular"
                      aria-invalid={fieldState.invalid}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-5 animate-spin" />}
                Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}