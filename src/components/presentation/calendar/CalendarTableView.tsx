import React from 'react';
import type { CalendarRow } from '../ContentCalendarSection';
import { LayoutTemplate, Target, AlignLeft, MessageCircle, Hash, MousePointerClick } from 'lucide-react';
import { AdaptivePostImage } from '../AdaptivePostImage';

interface CalendarTableViewProps {
  rows: CalendarRow[];
  onPostClick?: (post: CalendarRow) => void;
}

const statusColors = {
  draft: 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300',
  scheduled: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
};

const statusLabels = {
  draft: 'Borrador',
  scheduled: 'Programado',
  published: 'Publicado'
};

export const CalendarTableView: React.FC<CalendarTableViewProps> = ({ rows, onPostClick }) => {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-[32px] border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar pb-2">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-primary text-white text-[11px] uppercase tracking-wider">
              <th className="p-4 font-bold border-r border-primary/20 rounded-tl-[32px] w-24">Imagen</th>
              <th className="p-4 font-bold border-r border-primary/20 w-32">Día / Fecha</th>
              <th className="p-4 font-bold border-r border-primary/20"><div className="flex items-center gap-1.5"><LayoutTemplate size={14} />Plataforma</div></th>
              <th className="p-4 font-bold border-r border-primary/20">Formato / Estado</th>
              <th className="p-4 font-bold border-r border-primary/20"><div className="flex items-center gap-1.5"><Target size={14} />Objetivo</div></th>
              <th className="p-4 font-bold border-r border-primary/20 w-64"><div className="flex items-center gap-1.5"><AlignLeft size={14} />Descripción</div></th>
              <th className="p-4 font-bold border-r border-primary/20 w-64"><div className="flex items-center gap-1.5"><MessageCircle size={14} />Copy In</div></th>
              <th className="p-4 font-bold border-r border-primary/20 w-48"><div className="flex items-center gap-1.5"><Hash size={14} />Copy Out</div></th>
              <th className="p-4 font-bold border-r border-primary/20"><div className="flex items-center gap-1.5"><MousePointerClick size={14} />CTA</div></th>
              <th className="p-4 font-bold rounded-tr-[32px] w-56">Justificación Estratégica</th>
            </tr>
          </thead>
          <tbody className="text-xs text-stone-600 dark:text-stone-300">
            {rows.map((row, index) => {
              const statusClass = statusColors[row.status || 'draft'];
              
              return (
                <tr 
                  key={row.id} 
                  onClick={() => onPostClick && onPostClick(row)}
                  className={`
                    border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer group
                    ${index % 2 === 0 ? 'bg-white dark:bg-stone-900' : 'bg-stone-50/50 dark:bg-stone-900/50'}
                  `}
                >
                  <td className="p-4 border-r border-stone-100 dark:border-stone-800 align-top">
                    <div className="w-16 rounded-lg overflow-hidden shrink-0 shadow-sm">
                      <AdaptivePostImage 
                        src={row.imageUrl} 
                        ratio={row.imageAspectRatio || '4:5'} 
                        showBadge={false}
                      />
                    </div>
                  </td>
                  <td className="p-4 border-r border-stone-100 dark:border-stone-800 align-top">
                    <div className="font-bold text-primary dark:text-gold mb-1">{row.day}</div>
                    {row.date && <div className="text-[10px] text-stone-400 font-medium">{row.date}</div>}
                    
                    <button className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-primary/10 text-primary dark:text-gold px-2 py-1 rounded font-bold uppercase tracking-wide">
                      Ver Detalle
                    </button>
                  </td>
                  <td className="p-4 font-medium border-r border-stone-100 dark:border-stone-800 align-top">{row.platform}</td>
                  <td className="p-4 border-r border-stone-100 dark:border-stone-800 align-top">
                    <div className="space-y-2 flex flex-col items-start">
                      <span className="bg-slate-100 dark:bg-stone-800 px-2 py-1 rounded text-[10px] font-bold">{row.format}</span>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${statusClass}`}>
                        {statusLabels[row.status || 'draft']}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 border-r border-stone-100 dark:border-stone-800 font-semibold align-top">{row.objective}</td>
                  <td className="p-4 border-r border-stone-100 dark:border-stone-800 text-stone-500 dark:text-stone-400 align-top line-clamp-4">{row.description}</td>
                  <td className="p-4 border-r border-stone-100 dark:border-stone-800 italic text-stone-500 dark:text-stone-400 align-top">"{row.copyIn}"</td>
                  <td className="p-4 border-r border-stone-100 dark:border-stone-800 text-[10px] align-top">{row.copyOut}</td>
                  <td className="p-4 border-r border-stone-100 dark:border-stone-800 align-top">
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary dark:text-gold dark:bg-gold/10 rounded font-bold text-[10px] whitespace-nowrap">
                      {row.cta}
                    </span>
                  </td>
                  <td className="p-4 text-stone-500 dark:text-stone-400 text-[11px] leading-relaxed bg-stone-50 dark:bg-stone-800/20 align-top">{row.justification}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
