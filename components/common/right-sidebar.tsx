"use client";

import React from "react";
import { Calendar, Users, Loader2 } from "lucide-react";
import { useCalendarEventsQuery } from "@/queries/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface RightSidebarProps {
  onPlayGames?: () => void;
  onParticipateInSurvey?: () => void;
  userPoints?: number;
  userRanking?: string;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  onPlayGames,
  onParticipateInSurvey,
  userPoints = 1250,
  userRanking = "top 10",
}) => {
  const { data: events, isLoading, isError } = useCalendarEventsQuery();

  const progressPercentage = Math.min((userPoints / 2000) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Próximos eventos */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Próximos Eventos</h3>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center space-x-3 p-2 rounded-lg"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-2 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <p className="text-sm text-red-500">
            Error al cargar los eventos. Intenta nuevamente.
          </p>
        )}

        {!isLoading && events && (
          <div className="space-y-3">
            {events.slice(0, 3).map((event, index) => (
              <div
                key={event.id}
                className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    index % 2 === 0 ? "bg-blue-100" : "bg-green-100"
                  }`}
                >
                  {index % 2 === 0 ? (
                    <Calendar
                      size={16}
                      className={`${
                        index % 2 === 0 ? "text-blue-600" : "text-green-600"
                      }`}
                    />
                  ) : (
                    <Users size={16} className="text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(event.date), "dd MMM - h:mm a", {
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay eventos próximos.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Gamificación */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
        <h3 className="font-semibold text-gray-900 mb-4">🏆 Tu Progreso</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Puntos totales</span>
            <span className="font-bold text-purple-600">
              {userPoints.toLocaleString("es-ES")}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            ¡Estás en el {userRanking} de la semana!
          </p>
          <button
            onClick={onPlayGames}
            className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Jugar Ahora
          </button>
        </div>
      </div>

      {/* Encuesta */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Encuesta Activa</h3>
        <p className="text-sm text-gray-600 mb-4">
          Evaluación de clima laboral 2025
        </p>
        <button
          onClick={onParticipateInSurvey}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Participar
        </button>
      </div>
    </div>
  );
};
