/**
 * 共通ヘッダーコンポーネント
 * 全画面で統一されたナビゲーションを提供
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

type CommonHeaderProps = {
  subtitle?: string;
  rightContent?: React.ReactNode;
};

export const CommonHeader = ({ subtitle, rightContent }: CommonHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="sticky top-0 bg-white shadow-sm border-b border-gray-200 z-20">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-left hover:opacity-70 transition-opacity"
          >
            <h1 className="text-lg font-bold text-gray-800">韓国語トレーニング</h1>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </button>
          <div className="flex items-center gap-2">
            {rightContent}
            {!isHome && (
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                title="ホームに戻る"
              >
                <Home className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
