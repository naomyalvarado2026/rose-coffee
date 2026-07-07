import React from 'react';
import type { CalendarRow } from '../ContentCalendarSection';

interface CalendarYearViewProps {
  currentDate: Date;
  rows: CalendarRow[];
  onMonthClick: (month: number) => void;
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const CalendarYearView: React.FC<CalendarYearViewProps> = ({ currentDate, rows, onMonthClick }) => {
  const year = currentDate.getFullYear();
  
  // Aggregate post counts by month and day
  const postsByDate: Record<string, number> = {};
  rows.forEach(row => {
    if (row.date && row.date.startsWith(`${year}-`)) {
      postsByDate[row.date] = (postsByDate[row.date] || 0) + 1;
    }
  });

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-stone-100 dark:bg-stone-800';
    if (count === 1) return 'bg-primary/20 dark:bg-gold/30';
    if (count === 2) return 'bg-primary/40 dark:bg-gold/60';
    if (count >= 3) return 'bg-primary dark:bg-gold';
    return 'bg-stone-100 dark:bg-stone-800';
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden p-6 md:p-10 min-h-[600px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
        {MONTH_NAMES.map((monthName, monthIndex) => {
          const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
          const firstDay = new Date(year, monthIndex, 1).getDay();
          const startOffset = firstDay === 0 ? 6 : firstDay - 1; // 0 is Monday
          
          let totalMonthPosts = 0;
          for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            if (postsByDate[dateStr]) {
               totalMonthPosts += postsByDate[dateStr];
            }
          }

          return (
            <div 
              key={monthName}
              onClick={() => onMonthClick(monthIndex)}
              className="group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-stone-700 dark:text-stone-300 group-hover:text-primary dark:group-hover:text-gold transition-colors">
                  {monthName}
                </h4>
                {totalMonthPosts > 0 && (
                  <span className="text-[10px] font-bold bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full text-stone-500">
                    {totalMonthPosts} posts
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                  <div key={i} className="text-[8px] font-bold text-stone-400 text-center mb-1">{d}</div>
                ))}
                
                {Array.from({ length: startOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const count = postsByDate[dateStr] || 0;
                  
                  return (
                    <div 
                      key={day} 
                      className={`aspect-square rounded-sm ${getIntensityClass(count)} group-hover:ring-1 ring-primary/20 transition-all`}
                      title={`${dateStr}: ${count} posts`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 pt-6 border-t border-stone-100 dark:border-stone-800 flex items-center justify-center gap-4 text-xs font-medium text-stone-500">
        <span>Menos posts</span>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-stone-100 dark:bg-stone-800" />
          <div className="w-3 h-3 rounded-sm bg-primary/20 dark:bg-gold/30" />
          <div className="w-3 h-3 rounded-sm bg-primary/40 dark:bg-gold/60" />
          <div className="w-3 h-3 rounded-sm bg-primary dark:bg-gold" />
        </div>
        <span>Más posts</span>
      </div>
    </div>
  );
};
