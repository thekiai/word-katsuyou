import { Mic } from 'lucide-react';

type MicButtonProps = {
  onClick: () => void;
  isListening: boolean;
};

export function MicButton({ onClick, isListening }: MicButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isListening}
      className={`p-2 rounded-md transition-colors flex items-center justify-center ${
        isListening
          ? 'bg-red-100 text-red-600 cursor-not-allowed'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer'
      }`}
      title="音声入力"
    >
      <Mic className="w-4 h-4" />
    </button>
  );
}
