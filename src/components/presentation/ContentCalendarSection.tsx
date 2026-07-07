import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarTableView } from './calendar/CalendarTableView';
import { CalendarKanbanView } from './calendar/CalendarKanbanView';
import { CalendarCardsView } from './calendar/CalendarCardsView';
import { CalendarWeekView } from './calendar/CalendarWeekView';
import { CalendarMonthView } from './calendar/CalendarMonthView';
import { CalendarYearView } from './calendar/CalendarYearView';
import { PostDetailModal } from './PostDetailModal';
import { LayoutList, Columns, Grid, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays } from './calendar/calendarDateUtils';

export interface CalendarRow {
  id: string;
  day: string;
  date?: string;
  platform: string;
  format: string;
  objective: string;
  description: string;
  copyIn: string;
  copyOut: string;
  cta: string;
  justification: string;
  imageUrl?: string;
  imageAspectRatio?: '1:1' | '4:5' | '3:4' | '9:16' | '4:3' | '16:9' | string;
  status?: 'draft' | 'scheduled' | 'published';
  tags?: string[];
  color?: string;
}

interface ContentCalendarSectionProps {
  rows?: CalendarRow[];
}

const defaultRows: CalendarRow[] = [
  {
    id: '1',
    day: 'Lunes',
    platform: 'Instagram / Facebook',
    format: 'Reel',
    objective: 'Alcance / Brand Awareness',
    description: 'Proceso de preparación de espresso.',
    copyIn: 'Empieza la semana con energía',
    copyOut: 'El café perfecto sí existe.',
    cta: 'Visítanos',
    justification: 'Los lunes la audiencia busca energía.',
    status: 'published'
  }
];

export type ViewMode = 'table' | 'kanban' | 'cards' | 'calendar';
export type CalendarViewType = 'week' | 'month' | 'year';

export const ContentCalendarSection: React.FC<ContentCalendarSectionProps> = ({ rows = defaultRows }) => {
  const displayRows = rows && rows.length > 0 ? rows : defaultRows;

  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [calendarType, setCalendarType] = useState<CalendarViewType>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [selectedPost, setSelectedPost] = useState<CalendarRow | null>(null);

  const handlePrevDate = () => {
    if (calendarType === 'week') setCurrentDate(addDays(currentDate, -7));
    if (calendarType === 'month') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    if (calendarType === 'year') setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
  };

  const handleNextDate = () => {
    if (calendarType === 'week') setCurrentDate(addDays(currentDate, 7));
    if (calendarType === 'month') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    if (calendarType === 'year') setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  const getCalendarTitle = () => {
    if (calendarType === 'week') {
      const start = new Date(currentDate);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      const end = addDays(start, 6);
      const formatOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      return `${start.toLocaleDateString('es-ES', formatOpts)} - ${end.toLocaleDateString('es-ES', formatOpts)}`;
    }
    if (calendarType === 'month') {
      return currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }
    return currentDate.getFullYear().toString();
  };

  return (
    <section className="py-24 bg-brand-base dark:bg-stone-950 w-full relative">
      <div className="max-w-[95%] xl:max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="mb-12 flex flex-col md:flex-row gap-6 md:items-end justify-between">
          <div className="max-w-2xl">
            <span className="inline-block text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full mb-4">
              Estrategia
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-primary dark:text-stone-100 mb-4">
              Cronograma de Contenidos
            </h2>
            <p className="text-stone-500 dark:text-stone-400 text-lg leading-relaxed">
              Planificación estratégica de publicaciones. {displayRows.length} post{displayRows.length !== 1 ? 's' : ''} en total.
            </p>
          </div>

          <div className="flex flex-col items-end gap-4">
            {/* View Toggle */}
            <div className="flex bg-white dark:bg-stone-900 rounded-xl p-1 shadow-sm border border-stone-200 dark:border-stone-800">
              <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg flex items-center gap-1.5 transition-colors ${viewMode === 'table' ? 'bg-stone-100 dark:bg-stone-800 text-primary dark:text-gold' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`} title="Vista Tabla">
                <LayoutList size={18} />
              </button>
              <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg flex items-center gap-1.5 transition-colors ${viewMode === 'kanban' ? 'bg-stone-100 dark:bg-stone-800 text-primary dark:text-gold' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`} title="Vista Kanban">
                <Columns size={18} />
              </button>
              <button onClick={() => setViewMode('cards')} className={`p-2 rounded-lg flex items-center gap-1.5 transition-colors ${viewMode === 'cards' ? 'bg-stone-100 dark:bg-stone-800 text-primary dark:text-gold' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`} title="Vista Tarjetas">
                <Grid size={18} />
              </button>
              <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-lg flex items-center gap-1.5 transition-colors ${viewMode === 'calendar' ? 'bg-stone-100 dark:bg-stone-800 text-primary dark:text-gold' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`} title="Vista Calendario">
                <CalendarIcon size={18} />
              </button>
            </div>

            {/* Calendar Controls */}
            {viewMode === 'calendar' && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
                <div className="flex bg-white dark:bg-stone-900 rounded-xl p-1 shadow-sm border border-stone-200 dark:border-stone-800">
                  {(['week', 'month', 'year'] as CalendarViewType[]).map(type => (
                    <button key={type} onClick={() => setCalendarType(type)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${calendarType === type ? 'bg-primary text-white' : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'}`}>
                      {type === 'week' ? 'Semana' : type === 'month' ? 'Mes' : 'Año'}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center bg-white dark:bg-stone-900 rounded-xl p-1 shadow-sm border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300">
                  <button onClick={handlePrevDate} className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"><ChevronLeft size={16} /></button>
                  <button onClick={handleToday} className="px-3 py-1.5 text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg">Hoy</button>
                  <button onClick={handleNextDate} className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"><ChevronRight size={16} /></button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {viewMode === 'calendar' && (
          <div className="mb-6 flex justify-center">
            <h3 className="text-xl font-bold text-stone-800 dark:text-stone-200 capitalize">
              {getCalendarTitle()}
            </h3>
          </div>
        )}

        <motion.div
          key={viewMode + calendarType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {viewMode === 'table' && <CalendarTableView rows={displayRows} onPostClick={setSelectedPost} />}
          {viewMode === 'kanban' && <CalendarKanbanView rows={displayRows} onPostClick={setSelectedPost} />}
          {viewMode === 'cards' && <CalendarCardsView rows={displayRows} onPostClick={setSelectedPost} />}
          
          {viewMode === 'calendar' && calendarType === 'week' && <CalendarWeekView currentDate={currentDate} rows={displayRows} onPostClick={setSelectedPost} />}
          {viewMode === 'calendar' && calendarType === 'month' && <CalendarMonthView currentDate={currentDate} rows={displayRows} onPostClick={setSelectedPost} />}
          {viewMode === 'calendar' && calendarType === 'year' && (
             <CalendarYearView 
               currentDate={currentDate} 
               rows={displayRows} 
               onMonthClick={(month) => {
                 setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
                 setCalendarType('month');
               }} 
             />
          )}
        </motion.div>
      </div>

      <PostDetailModal 
        isOpen={!!selectedPost} 
        post={selectedPost} 
        allPosts={displayRows}
        onClose={() => setSelectedPost(null)}
        onNavigate={setSelectedPost}
      />
    </section>
  );
};
