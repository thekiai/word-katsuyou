import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CalendarProps = {
  practiceDates: Set<string>; // YYYY-MM-DD形式の日付
};

export const Calendar = ({ practiceDates }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 月の最初の日と最後の日
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 月の最初の日が何曜日か（0: 日曜日, 1: 月曜日, ...）
  const firstDayOfWeek = firstDay.getDay();

  // 月の日数
  const daysInMonth = lastDay.getDate();

  // 前月に戻る
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // 次月に進む
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // 日付が練習日かどうかを判定
  const isPracticeDate = (day: number): boolean => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return practiceDates.has(dateString);
  };

  // カレンダーの日付を生成
  const renderDays = () => {
    const days: JSX.Element[] = [];

    // 最初の週の空白セルを追加
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="text-center py-2"></div>);
    }

    // 各日付を追加
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === new Date().getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear();
      const isPractice = isPracticeDate(day);

      days.push(
        <div
          key={day}
          className={`text-center py-2 rounded-lg ${
            isPractice
              ? 'bg-green-500 text-white font-semibold'
              : isToday
              ? 'bg-gray-200 text-gray-700'
              : 'text-gray-600'
          }`}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-w-md mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-700">
          {year}年{month + 1}月
        </h2>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center text-sm font-medium ${
              index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  );
};
