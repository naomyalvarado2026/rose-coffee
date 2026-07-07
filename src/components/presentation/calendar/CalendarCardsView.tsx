import React from 'react';
import { CalendarRow } from '../ContentCalendarSection';
import { AdaptivePostImage } from '../AdaptivePostImage';
import { motion } from 'framer-motion';

interface CalendarCardsViewProps {
  rows: CalendarRow[];
  onPostClick?: (post: CalendarRow) => void;
}

export const CalendarCardsView: React.FC<CalendarCardsViewProps> = ({ rows, onPostClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {rows.map((row, idx) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.05 }}
          key={row.id}
          onClick={() => onPostClick && onPostClick(row)}
          className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col"
        >
          {/* Image Header with Overlay */}
          <div className="relative">
            <AdaptivePostImage src={row.imageUrl} ratio={row.imageAspectRatio} showBadge={false} />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 pointer-events-none">
              <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded mb-2 w-max uppercase tracking-wider">
                {row.platform}
              </span>
              <h4 className="text-white font-bold text-lg leading-tight line-clamp-2">
                {row.objective}
              </h4>
            </div>
            
            {row.status && (
              <div className="absolute top-3 right-3">
                <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                  row.status === 'published' ? 'bg-emerald-500' :
                  row.status === 'scheduled' ? 'bg-amber-500' :
                  'bg-stone-400'
                }`} />
              </div>
            )}
          </div>
          
          {/* Content Body */}
          <div className="p-5 flex flex-col flex-1">
            <div className="flex justify-between items-center mb-3">
              <span className="text-primary dark:text-gold font-bold text-sm">
                {row.day}
              </span>
              {row.date && <span className="text-stone-400 text-[10px] font-bold">{row.date}</span>}
            </div>
            
            <div className="mb-4 flex-1">
              <p className="text-stone-500 dark:text-stone-400 text-xs line-clamp-3 italic bg-stone-50 dark:bg-stone-800/50 p-2 rounded-lg border-l-2 border-primary/20">
                "{row.copyOut}"
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                {row.format}
              </span>
              <span className="bg-primary/5 dark:bg-gold/10 text-primary dark:text-gold px-2.5 py-1 rounded text-[10px] font-bold max-w-[120px] truncate">
                {row.cta}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
