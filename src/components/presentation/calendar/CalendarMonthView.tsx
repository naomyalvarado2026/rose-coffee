import React from 'react';
import type { CalendarRow } from '../ContentCalendarSection';
import { generateDaysForView, isSameDay, formatDateString } from './calendarDateUtils';

interface CalendarMonthViewProps {
  currentDate: Date;
  rows: CalendarRow[];
  onPostClick?: (post: CalendarRow) => void;
}

const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({ currentDate, rows, onPostClick }) => {
  const days = generateDaysForView(currentDate, 'month');

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden flex flex-col h-[700px]">
      <div className="grid grid-cols-7 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80">
        {WEEK_DAYS.map(day => (
          <div key={day} className="py-3 text-center text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
      
      <div className="flex-1 grid grid-cols-7 grid-rows-6 bg-stone-100 dark:bg-stone-800/50 gap-px">
        {days.map((date, idx) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(date, new Date());
          const dateStr = formatDateString(date);
          const dayEvents = rows.filter(e => e.date === dateStr);

          return (
            <div 
              key={idx}
              className={`
                min-h-[100px] p-1.5 relative transition-colors bg-white dark:bg-stone-900
                ${!isCurrentMonth ? 'bg-stone-50/50 dark:bg-stone-900/30 opacity-60' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-1 px-1">
                <span className={`
                  w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                  ${isToday ? 'bg-primary text-white shadow-sm' : 'text-stone-600 dark:text-stone-400'}
                `}>
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[9px] font-bold text-stone-400 mt-1">{dayEvents.length} posts</span>
                )}
              </div>
              
              <div className="space-y-1.5 overflow-y-auto max-h-[75px] custom-scrollbar px-0.5 mt-2">
                {dayEvents.map(event => (
                  <div 
                    key={event.id}
                    onClick={() => onPostClick && onPostClick(event)}
                    className={`
                      px-2 py-1 text-[9px] rounded font-bold cursor-pointer hover:shadow-sm transition-all truncate border
                      ${event.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/30' : 
                        event.status === 'scheduled' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/30' : 
                        'bg-stone-50 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700'}
                    `}
                  >
                    <span className="opacity-70 mr-1">{event.platform.substring(0,2)}</span>
                    {event.objective}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
