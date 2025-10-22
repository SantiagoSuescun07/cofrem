"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  usePollQuery,
  useVoteMutation,
} from "@/queries/encuentas/usepoll-query";

interface SurveyDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SurveyDialog: React.FC<SurveyDialogProps> = ({
  open,
  onClose,
}) => {
  const { data: poll, isLoading, isError } = usePollQuery();
  const { mutate: vote, isPending, isSuccess } = useVoteMutation();
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const handleVote = () => {
    if (!selectedChoice) return;
    vote(selectedChoice);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Encuesta Activa</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <p className="text-sm text-gray-500">Cargando encuesta...</p>
        )}
        {isError && (
          <p className="text-sm text-red-500">Error al cargar la encuesta.</p>
        )}

        {!isLoading && poll && (
          <div className="space-y-3">
            <p className="text-gray-700 font-medium">{poll.title}</p>

            {Array.isArray(poll.options) &&
              poll.options.map((option: any) => (
                <label
                  key={option.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="choice"
                    value={option.id}
                    checked={selectedChoice === String(option.id)}
                    onChange={() => setSelectedChoice(String(option.id))}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleVote}
            disabled={!selectedChoice || isPending || isSuccess}
          >
            {isPending
              ? "Enviando..."
              : isSuccess
              ? "¡Enviado!"
              : "Enviar respuesta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
