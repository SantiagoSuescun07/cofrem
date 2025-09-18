import React from "react";

export default function GamesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        Centro de Entretenimiento
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          "Trivia COFREM",
          "Sopa de Letras",
          "Memoria",
          "Encuentra las Diferencias",
        ].map((game, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">🎮</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{game}</h3>
              <p className="text-sm text-gray-600 mb-4">
                Jugadores: {Math.floor(Math.random() * 50) + 10}
              </p>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Jugar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
