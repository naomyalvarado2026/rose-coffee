import React from 'react';
import { CalendarRow } from '../ContentCalendarSection';
import { AdaptivePostImage } from '../AdaptivePostImage';
import { Target, MousePointerClick, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface CalendarKanbanViewProps {
  rows: CalendarRow[];
  onPostClick?: (post: CalendarRow) => void;
}

export const CalendarKanbanView: React.FC<CalendarKanbanViewProps> = ({ rows, onPostClick }) => {
  // Group rows by platform
  const platforms = Array.from(new Set(rows.map(r => r.platform)));

  return (
    <div className="flex gap-6 overflow-x-auto custom-scrollbar pb-6 snap-x min-h-[500px]">
      {platforms.map(platform => {
        const platformRows = rows.filter(r => r.platform === platform);
        
        return (
          <div key={platform} className="flex-shrink-0 w-80 flex flex-col bg-stone-50/50 dark:bg-stone-900/30 rounded-[32px] border border-stone-200/50 dark:border-stone-800/50 p-4 snap-start">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-bold text-primary dark:text-stone-100 flex items-center gap-2">
                {platform}
              </h3>
              <span className="bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                {platformRows.length}
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {platformRows.map((row, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={row.id}
                  onClick={() => onPostClick && onPostClick(row)}
                  className="bg-white dark:bg-stone-800 rounded-2xl p-3 border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md cursor-pointer group transition-all"
                >
                  <div className="flex gap-3 mb-3">
                    <div className="w-20 shrink-0 rounded-xl overflow-hidden">
                      <AdaptivePostImage src={row.imageUrl} ratio={row.imageAspectRatio} showBadge={false} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                        <Calendar size={12} />
                        <span className="truncate">{row.day}</span>
                      </div>
                      <p className="text-sm font-bold text-primary dark:text-stone-100 leading-tight line-clamp-2">
                        {row.objective}
                      </p>
                      <div className="mt-2 inline-flex items-center px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-700 text-[9px] font-bold text-stone-500 dark:text-stone-300">
                        {row.format}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 dark:border-stone-700 flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-1 text-stone-500">
                      <MousePointerClick size={12} />
                      <span className="font-medium truncate max-w-[120px]">{row.cta}</span>
                    </div>
                    {row.status && (
                      <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        row.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                        row.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                        'bg-stone-100 text-stone-500'
                      }`}>
                        {row.status === 'published' ? 'Pub' : row.status === 'scheduled' ? 'Prog' : 'Borrador'}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
