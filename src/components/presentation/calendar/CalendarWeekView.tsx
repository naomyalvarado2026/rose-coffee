import React from 'react';
import type { CalendarRow } from '../ContentCalendarSection';
import { generateDaysForView, isSameDay, formatDateString } from './calendarDateUtils';
import { AdaptivePostImage } from '../AdaptivePostImage';

interface CalendarWeekViewProps {
  currentDate: Date;
  rows: CalendarRow[];
  onPostClick?: (post: CalendarRow) => void;
}

const WEEK_DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({ currentDate, rows, onPostClick }) => {
  const days = generateDaysForView(currentDate, 'week');
  
  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
      {/* Header */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80">
        <div className={`flex-1 grid grid-cols-7 divide-x divide-stone-200 dark:divide-stone-800`}>
          {days.map(date => {
            const isToday = isSameDay(date, new Date());
            return (
              <div key={date.toISOString()} className={`py-4 text-center ${isToday ? 'bg-primary/5 dark:bg-gold/5' : ''}`}>
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">{WEEK_DAYS[date.getDay()]}</div>
                <div className={`
                  inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                  ${isToday ? 'bg-primary text-white shadow-sm' : 'text-stone-700 dark:text-stone-300'}
                `}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Grid */}
      <div className="flex-1 flex overflow-y-auto custom-scrollbar">
        <div className={`flex-1 grid grid-cols-7 divide-x divide-stone-100 dark:divide-stone-800/50 relative`}>
          {days.map(date => {
            const dateStr = formatDateString(date);
            // Posts that have an exact date match OR if no date, try to match by Day name if possible, 
            // but usually we rely on date. For legacy data without date, they won't appear here unless we map them.
            // Let's rely primarily on `date`, if missing, we don't render it in the precise calendar.
            const dayEvents = rows.filter(e => e.date === dateStr);

            return (
              <div key={dateStr} className="relative min-h-[400px] p-2 space-y-3 hover:bg-stone-50/50 dark:hover:bg-stone-800/20 transition-colors">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={() => onPostClick && onPostClick(event)}
                    className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-2 shadow-sm cursor-pointer hover:shadow-md transition-all group overflow-hidden"
                  >
                    {event.imageUrl && (
                      <div className="w-full rounded-lg overflow-hidden mb-2">
                         <AdaptivePostImage src={event.imageUrl} ratio={event.imageAspectRatio} showBadge={false} />
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mb-1">
                       <span className={`w-2 h-2 rounded-full ${event.status === 'published' ? 'bg-emerald-500' : event.status === 'scheduled' ? 'bg-amber-500' : 'bg-stone-400'}`} />
                       <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider truncate">{event.platform}</span>
                    </div>
                    <div className="text-[11px] font-bold text-primary dark:text-stone-100 leading-tight line-clamp-2 mb-1">
                      {event.objective}
                    </div>
                    <div className="text-[9px] text-stone-500 dark:text-stone-400 font-medium line-clamp-1 italic">
                      {event.format}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
