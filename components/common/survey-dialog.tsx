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

  // Verificar si ya respondió la encuesta (no hay encuesta activa)
  // Puede venir como mensaje en la respuesta o como error 404
  const hasNoActivePoll = 
    (poll && (poll as any).message === "No active poll found.") ||
    (isError && !poll); // Si hay error y no hay datos, probablemente ya respondió
  
  const isDisabled = hasNoActivePoll || isSuccess;

  const handleVote = () => {
    if (!selectedChoice || isDisabled) return;
    vote(selectedChoice);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-medium">Encuesta Activa</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <p className="text-sm text-gray-500">Cargando encuesta...</p>
        )}
        {isError && (
          <p className="text-sm text-red-500">Error al cargar la encuesta.</p>
        )}

        {hasNoActivePoll && (
          <div className="py-4">
            <p className="text-sm text-gray-600 text-center">
              Ya has respondido esta encuesta. Gracias por tu participación.
            </p>
          </div>
        )}

        {!isLoading && !hasNoActivePoll && poll && (
          <div className="space-y-3">
            <p className="text-gray-700 font-medium">{poll.title}</p>

            {Array.isArray(poll.options) &&
              poll.options.map((option: any) => (
                <label
                  key={option.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isDisabled
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:bg-[#e4fef1]"
                  } ${
                    selectedChoice === String(option.id)
                      ? "bg-[#e4fef1]"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="choice"
                    value={option.id}
                    checked={selectedChoice === String(option.id)}
                    onChange={() => !isDisabled && setSelectedChoice(String(option.id))}
                    disabled={isDisabled}
                    className="w-4 h-4 text-[#2deb79] border-gray-300 focus:ring-[#2deb79] focus:ring-2 cursor-pointer disabled:cursor-not-allowed"
                    style={{
                      accentColor: "#2deb79",
                    }}
                  />
                  <span className="font-medium text-gray-700">{option.label}</span>
                </label>
              ))}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {hasNoActivePoll ? "Cerrar" : "Cancelar"}
          </Button>
          {!hasNoActivePoll && (
            <Button
              onClick={handleVote}
              disabled={!selectedChoice || isPending || isSuccess || isDisabled}
              className="bg-[#2deb79] hover:bg-[#2deb79]/90"
            >
              {isPending
                ? "Enviando..."
                : isSuccess
                ? "¡Enviado!"
                : "Enviar respuesta"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
