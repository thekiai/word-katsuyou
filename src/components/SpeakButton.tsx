import { Volume2 } from 'lucide-react';

type SpeakButtonProps = {
  onClick: () => void;
  isSpeaking: boolean;
};

export function SpeakButton({ onClick, isSpeaking }: SpeakButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isSpeaking}
      className={`p-2 rounded-md transition-colors flex items-center justify-center ${
        isSpeaking
          ? 'bg-yellow-100 text-yellow-600 cursor-not-allowed'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer'
      }`}
      title="正解を読み上げ"
    >
      <Volume2 className="w-4 h-4" />
    </button>
  );
}
