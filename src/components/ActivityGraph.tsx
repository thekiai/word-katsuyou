type ActivityGraphProps = {
  practiceDates: Set<string>; // YYYY-MM-DD形式の日付
};

export const ActivityGraph = ({ practiceDates }: ActivityGraphProps) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // 月の最初の日と最後の日
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 月の最初の日が何曜日か（0: 日曜日, 1: 月曜日, ...）
  const firstDayOfWeek = firstDay.getDay();

  // 月の日数
  const daysInMonth = lastDay.getDate();

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
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();
      const isPractice = isPracticeDate(day);

      days.push(
        <div
          key={day}
          className={`text-center py-1 rounded text-xs relative ${
            isToday
              ? 'bg-gray-200 text-gray-700'
              : isPractice
              ? 'text-gray-700'
              : 'text-gray-500'
          }`}
        >
          {isPractice && (
            <img
              src="/hanamaru.png"
              alt="はなまる"
              className="absolute inset-0 w-full h-full object-contain opacity-70"
            />
          )}
          <span className="relative z-10">{day}</span>
        </div>
      );
    }

    return days;
  };

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="bg-white rounded-lg p-3">
      <h3 className="text-xs text-gray-500 mb-2 text-center">
        {month + 1}月
      </h3>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-gray-400"
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
