/**
 * 共通ヘッダーコンポーネント
 * 全画面で統一されたナビゲーションを提供
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type CommonHeaderProps = {
  title?: string;
  rightContent?: React.ReactNode;
  onBack?: () => void;
};

export const CommonHeader = ({ title, rightContent, onBack }: CommonHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="sticky top-0 bg-white shadow-sm border-b border-gray-200 z-20">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                title="戻る"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            {!onBack && !isHome && (
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                title="ホームに戻る"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            {title && (
              <h1 className="text-lg font-bold text-gray-800">{title}</h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            {rightContent}
          </div>
        </div>
      </div>
    </div>
  );
};
