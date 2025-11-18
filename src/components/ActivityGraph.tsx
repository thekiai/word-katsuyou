import { useRef, useEffect } from 'react';
import hanamaruImg from '../assets/hanamaru.png';

type ActivityGraphProps = {
  practiceDates: Set<string>; // YYYY-MM-DD形式の日付
};

export const ActivityGraph = ({ practiceDates }: ActivityGraphProps) => {
  const today = new Date();
  const scrollRef = useRef<HTMLDivElement>(null);

  // 最初の練習日を取得（なければ今週の日曜日から）
  const getStartDate = (): Date => {
    if (practiceDates.size === 0) {
      const thisWeekSunday = new Date(today);
      thisWeekSunday.setDate(today.getDate() - today.getDay());
      return thisWeekSunday;
    }

    const dates = Array.from(practiceDates).map(dateStr => new Date(dateStr));
    dates.sort((a, b) => a.getTime() - b.getTime());
    return dates[0];
  };

  const startDate = getStartDate();

  // 週ごとのデータを生成（最初の練習日から今日まで）
  const generateWeeks = () => {
    const weeks: { month: number; days: Date[] }[] = [];

    // 開始日の週の日曜日から開始
    const current = new Date(startDate);
    current.setDate(current.getDate() - current.getDay());

    // 今日の週の土曜日まで
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay()));

    while (current <= end) {
      const weekDays: Date[] = [];
      const weekMonth = current.getMonth();

      for (let i = 0; i < 7; i++) {
        weekDays.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }

      weeks.push({ month: weekMonth, days: weekDays });
    }

    return weeks;
  };

  const weeks = generateWeeks();

  // 日付が練習日かどうかを判定
  const isPracticeDate = (date: Date): boolean => {
    // ローカルタイムゾーンで日付文字列を生成
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    return practiceDates.has(dateString);
  };

  // 今日かどうか
  const isToday = (date: Date): boolean => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // 未来の日付かどうか
  const isFuture = (date: Date): boolean => {
    // 時刻を無視して日付だけで比較
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dateOnly > todayOnly;
  };

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  // 初回レンダリング時に最新（一番下）にスクロール
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  return (
    <div className="bg-white rounded-lg p-3">
      <h3 className="text-xs text-gray-500 mb-2 text-center">練習の記録</h3>

      <div className="flex justify-center">
        <div>
          {/* 曜日ヘッダー */}
          <div className="flex gap-1 mb-1">
            <div className="w-8 flex-shrink-0"></div>
            {weekDays.map((day) => (
              <div key={day} className="w-7 text-center text-xs text-gray-400 flex-shrink-0">
                {day}
              </div>
            ))}
          </div>

          {/* 週ごとのカレンダー（縦スクロール） */}
          <div ref={scrollRef} className="overflow-y-auto max-h-32 pr-4">
            <div className="flex flex-col gap-1" style={{ minWidth: 'max-content' }}>
          {weeks.map((week, weekIndex) => {
            // 週の最初の日の月を表示
            const showMonth = weekIndex === 0 || week.month !== weeks[weekIndex - 1].month;
            const monthLabel = showMonth ? `${week.month + 1}月` : '';

            return (
              <div key={weekIndex} className="flex gap-1">
                {/* 月ラベル */}
                <div className="w-8 text-xs text-gray-500 flex items-center flex-shrink-0">
                  {monthLabel}
                </div>
                {/* 週の日付 */}
                {week.days.map((date, dayIndex) => {
                  const practiced = isPracticeDate(date);
                  const todayDate = isToday(date);
                  const future = isFuture(date);

                  return (
                    <div
                      key={dayIndex}
                      className={`w-7 h-7 text-center rounded text-xs relative flex items-center justify-center flex-shrink-0 ${
                        future
                          ? 'text-gray-300'
                          : todayDate
                          ? 'text-gray-700 underline decoration-1'
                          : practiced
                          ? 'text-gray-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {practiced && !future && (
                        <img
                          src={hanamaruImg}
                          alt="はなまる"
                          className="absolute inset-0 w-full h-full object-contain opacity-70 z-10"
                        />
                      )}
                      <span className="relative">{date.getDate()}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
