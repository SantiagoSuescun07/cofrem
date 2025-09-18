// "use client";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/form";
// import { Textarea } from "@/components/ui/textarea";
// import { User, Send, Loader } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useCreateComment } from "@/mutation/news";
// import { toast } from "sonner";

// const commentSchema = z.object({
//   text: z
//     .string()
//     .min(1, "El comentario debe tener al menos 10 caracteres")
//     .max(500, "El comentario no puede exceder 500 caracteres"),
// });

// type CommentFormData = z.infer<typeof commentSchema>;

// interface CommentFormProps {
//   nid: number;
// }

// export function CommentForm({ nid }: CommentFormProps) {
//   const form = useForm<CommentFormData>({
//     resolver: zodResolver(commentSchema),
//     defaultValues: {
//       text: "",
//     },
//   });

//   const { isValid, isSubmitting } = form.formState;
//   const createCommentMutation = useCreateComment();

//   const handleSubmit = async (data: CommentFormData) => {
//     try {
//       await createCommentMutation.mutateAsync({
//         newsNid: nid,
//         commentBody: data.text,
//       });
//       form.reset(); // Clear the form after successful submission
//       toast.success("¡Comentario enviado exitosamente!"); // Success toast
//     } catch (error) {
//       console.error("Error al enviar comentario:", error);
//       toast.error(
//         `Error al enviar el comentario: ${
//           createCommentMutation.error?.message || "Intenta de nuevo"
//         }`
//       ); // Error toast
//     }
//   };

//   return (
//     <Card className="mt-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition bg-muted/30">
//       <CardContent className="p-6">
//         {/* Header */}
//         <div className="flex items-center gap-3 mb-4">
//           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
//             <User className="h-5 w-5 text-primary" />
//           </div>
//           <h4 className="font-semibold text-lg">Agregar comentario</h4>
//         </div>

//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(handleSubmit)}
//             className="space-y-4"
//           >
//             {/* Campo comentario */}
//             <FormField
//               control={form.control}
//               name="text"
//               render={({ field }) => {
//                 const length = field.value.length;
//                 const isNearLimit = length > 450 && length <= 500;
//                 const isOverLimit = length > 500;

//                 return (
//                   <FormItem>
//                     <FormControl>
//                       <Textarea
//                         placeholder="Escribe tu comentario..."
//                         className="min-h-[120px] resize-none bg-background rounded-xl border-muted-foreground/20 focus:ring-2 focus:ring-primary transition"
//                         {...field}
//                       />
//                     </FormControl>
//                     <div className="flex justify-between text-xs mt-1">
//                       <FormMessage />
//                       <span
//                         className={`${
//                           isOverLimit
//                             ? "text-red-500"
//                             : isNearLimit
//                             ? "text-yellow-500"
//                             : "text-muted-foreground"
//                         }`}
//                       >
//                         {length}/500
//                       </span>
//                     </div>
//                   </FormItem>
//                 );
//               }}
//             />

//             {/* Botón enviar */}
//             <div className="flex justify-end pt-2">
//               <Button
//                 type="submit"
//                 disabled={
//                   isSubmitting || !isValid || createCommentMutation.isPending
//                 }
//                 className="gap-2 rounded-full px-6 py-2"
//               >
//                 {createCommentMutation.isPending || isSubmitting ? (
//                   <>
//                     <Loader className="animate-spin" />
//                     Publicando...
//                   </>
//                 ) : (
//                   <>
//                     <Send className="h-4 w-4" />
//                     Publicar
//                   </>
//                 )}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </CardContent>
//     </Card>
//   );
// }
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { User, Send, Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateComment } from "@/mutation/news"; // Adjust path as needed
import { toast } from "sonner";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { COMMENTS_QUERY_KEY, NEWS_QUERY_KEY } from "@/constants/query-keys";

const commentSchema = z.object({
  text: z
    .string()
    .min(1, "El comentario debe tener al menos 10 caracteres")
    .max(500, "El comentario no puede exceder 500 caracteres"),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  nid: number;
}

export function CommentForm({ nid }: CommentFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      text: "",
    },
  });

  const { isValid, isSubmitting } = form.formState;
  const createCommentMutation = useCreateComment();

  const handleSubmit = async (data: CommentFormData) => {
    try {
      await createCommentMutation.mutateAsync({
        newsNid: nid,
        commentBody: data.text,
      });
      // Refetch comments for the specific news item
      queryClient.refetchQueries({
        queryKey: [COMMENTS_QUERY_KEY],
        exact: false, // Ensure exact match
      });

      // Optionally refetch news to update comment_count
      queryClient.refetchQueries({
        queryKey: [NEWS_QUERY_KEY],
        exact: false,
      });
      form.reset(); // Clear the form after successful submission
      toast.success("¡Comentario enviado exitosamente!"); // Success toast
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      toast.error(
        `Error al enviar el comentario: ${
          createCommentMutation.error?.message || "Intenta de nuevo"
        }`
      ); // Error toast
    }
  };

  return (
    <Card className="mt-6 p-0 border-none shadow-none">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <h4 className="font-semibold text-lg">Agregar comentario</h4>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Campo comentario */}
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => {
                const length = field.value.length;
                const isNearLimit = length > 450 && length <= 500;
                const isOverLimit = length > 500;

                return (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Escribe tu comentario..."
                        className="min-h-[120px] resize-none bg-background rounded-xl border-muted-foreground/20 focus:ring-2 focus:ring-primary transition"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs mt-1">
                      <FormMessage />
                      <span
                        className={`${
                          isOverLimit
                            ? "text-red-500"
                            : isNearLimit
                            ? "text-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {length}/500
                      </span>
                    </div>
                  </FormItem>
                );
              }}
            />

            {/* Botón enviar */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={
                  isSubmitting || !isValid || createCommentMutation.isPending
                }
                className="gap-2 rounded-full px-6 py-2"
              >
                {createCommentMutation.isPending || isSubmitting ? (
                  <>
                    <Loader className="animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Publicar
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
