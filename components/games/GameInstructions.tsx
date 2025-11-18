interface GameInstructionsProps {
  text: string;
}

export default function GameInstructions({ text }: GameInstructionsProps) {
  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl">ℹ️</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            Instrucciones
          </h3>
          <p className="text-blue-800">{text}</p>
        </div>
      </div>
    </div>
  );
}

