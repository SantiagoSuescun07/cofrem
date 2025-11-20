interface GameInstructionsProps {
  text: string | null | undefined;
}

export default function GameInstructions({ text }: GameInstructionsProps) {
  // No mostrar nada si no hay texto
  if (!text || text.trim() === "") {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-l-4 border-[#306393] rounded-lg p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-[#306393] rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-md">
            ℹ️
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 mb-1.5">
              Instrucciones
            </h3>
            <p className="text-gray-700 leading-relaxed text-sm">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
