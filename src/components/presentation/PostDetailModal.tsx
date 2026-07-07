import React, { useEffect, useState } from 'react';
import type { CalendarRow } from './ContentCalendarSection';
import { AdaptivePostImage } from './AdaptivePostImage';
import { X, Calendar, Target, LayoutTemplate, MessageCircle, Hash, MousePointerClick, AlignLeft, ChevronLeft, ChevronRight, PanelRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PostDetailModalProps {
  post: CalendarRow | null;
  allPosts: CalendarRow[];
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (post: CalendarRow) => void;
}

interface ModalContentProps {
  post: CalendarRow;
  allPosts: CalendarRow[];
  currentIndex: number;
  isSidebar: boolean;
  handlePrev: () => void;
  handleNext: () => void;
  onClose: () => void;
  setIsSidebar: (value: boolean) => void;
}

const ModalContent: React.FC<ModalContentProps> = ({
  post,
  allPosts,
  currentIndex,
  isSidebar,
  handlePrev,
  handleNext,
  onClose,
  setIsSidebar
}) => (
  <div className="flex flex-col h-full bg-white dark:bg-stone-900 overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b border-stone-100 dark:border-stone-800 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button onClick={handlePrev} disabled={currentIndex === 0} className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded disabled:opacity-30">
            <ChevronLeft size={16} />
          </button>
          <button onClick={handleNext} disabled={currentIndex === allPosts.length - 1} className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded disabled:opacity-30">
            <ChevronRight size={16} />
          </button>
        </div>
        <span className="text-xs font-bold text-stone-400">
          Post {currentIndex + 1} de {allPosts.length}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setIsSidebar(!isSidebar)}
          className={`p-1.5 rounded transition-colors ${isSidebar ? 'bg-primary/10 text-primary' : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500'}`}
          title="Alternar vista Modal / Panel Lateral"
        >
          <PanelRight size={16} />
        </button>
        <button onClick={onClose} className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded text-stone-500">
          <X size={16} />
        </button>
      </div>
    </div>

    {/* Scrollable Body */}
    <div className={`flex-1 overflow-y-auto custom-scrollbar flex ${isSidebar ? 'flex-col' : 'flex-col md:flex-row'}`}>
      
      {/* Left/Top side: Image */}
      <div className={`${isSidebar ? 'w-full' : 'md:w-5/12'} bg-stone-50 dark:bg-stone-950 border-r border-stone-100 dark:border-stone-800 p-6 flex flex-col items-center justify-start shrink-0`}>
        <div className="w-full max-w-[320px] rounded-2xl overflow-hidden shadow-lg border border-stone-200 dark:border-stone-700 bg-white">
          <AdaptivePostImage 
            src={post.imageUrl} 
            ratio={post.imageAspectRatio || '4:5'} 
            showBadge={true} 
          />
        </div>
        
        <div className="w-full max-w-[320px] mt-6 flex justify-between items-center">
          {post.status && (
            <span className={`px-2.5 py-1 rounded font-bold text-[10px] uppercase tracking-wider ${
              post.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
              post.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
              'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300'
            }`}>
              {post.status === 'published' ? 'Publicado' : post.status === 'scheduled' ? 'Programado' : 'Borrador'}
            </span>
          )}
          <span className="text-[10px] font-bold text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded">
            {post.format}
          </span>
        </div>
      </div>

      {/* Right/Bottom side: Details */}
      <div className="flex-1 p-6 md:p-8 space-y-8">
        
        {/* Section: General */}
        <div>
          <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-stone-100 dark:border-stone-800 pb-2">
            <Calendar size={12} /> Información General
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase">Día / Fecha</p>
              <p className="font-semibold text-primary dark:text-stone-100 mt-1">{post.day}</p>
              {post.date && <p className="text-xs text-stone-500 font-medium">{post.date}</p>}
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-1"><LayoutTemplate size={10} /> Plataforma</p>
              <p className="font-semibold text-stone-700 dark:text-stone-300 mt-1">{post.platform}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-1"><Target size={10} /> Objetivo</p>
              <p className="font-semibold text-stone-700 dark:text-stone-300 mt-1">{post.objective}</p>
            </div>
          </div>
        </div>

        {/* Section: Content */}
        <div>
          <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-stone-100 dark:border-stone-800 pb-2">
            <AlignLeft size={12} /> Contenido
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-1 mb-1.5"><MessageCircle size={10} /> Copy In (Visual)</p>
              <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl text-sm font-medium italic text-stone-600 dark:text-stone-300 border border-stone-100 dark:border-stone-700/50">
                {post.copyIn || <span className="opacity-50">Sin texto visual</span>}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-1 mb-1.5"><Hash size={10} /> Copy Out (Caption)</p>
              <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl text-sm font-medium whitespace-pre-wrap text-stone-600 dark:text-stone-300 border border-stone-100 dark:border-stone-700/50">
                {post.copyOut || <span className="opacity-50">Sin descripción</span>}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-1 mb-1.5">Descripción de la Imagen</p>
              <p className="text-sm text-stone-600 dark:text-stone-400">{post.description || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-1 mb-1.5"><MousePointerClick size={10} /> Llamado a la Acción (CTA)</p>
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary dark:text-gold dark:bg-gold/10 rounded-lg font-bold text-xs">
                {post.cta || 'Sin CTA'}
              </span>
            </div>
          </div>
        </div>

        {/* Section: Strategy */}
        <div>
          <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-stone-100 dark:border-stone-800 pb-2">
            <Target size={12} /> Justificación Estratégica
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed bg-stone-50 dark:bg-stone-800/20 p-4 rounded-xl border border-stone-100 dark:border-stone-800">
            {post.justification || 'Sin justificación detallada.'}
          </p>
        </div>

      </div>
    </div>
  </div>
);

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, allPosts, isOpen, onClose, onNavigate }) => {
  // Read preference from localStorage, default to modal (false)
  const [isSidebar, setIsSidebar] = useState(() => {
    return localStorage.getItem('rose_coffee_calendar_view_mode') === 'sidebar';
  });

  useEffect(() => {
    localStorage.setItem('rose_coffee_calendar_view_mode', isSidebar ? 'sidebar' : 'modal');
  }, [isSidebar]);

  if (!isOpen || !post) return null;

  const currentIndex = allPosts.findIndex(p => p.id === post.id);
  const handlePrev = () => {
    if (currentIndex > 0 && onNavigate) onNavigate(allPosts[currentIndex - 1]);
  };
  const handleNext = () => {
    if (currentIndex < allPosts.length - 1 && onNavigate) onNavigate(allPosts[currentIndex + 1]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Container based on mode */}
          {isSidebar ? (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md shadow-2xl border-l border-white/10 z-10"
            >
              <ModalContent 
                post={post}
                allPosts={allPosts}
                currentIndex={currentIndex}
                isSidebar={isSidebar}
                handlePrev={handlePrev}
                handleNext={handleNext}
                onClose={onClose}
                setIsSidebar={setIsSidebar}
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6 z-10 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl pointer-events-auto overflow-hidden border border-white/20"
              >
                <ModalContent 
                  post={post}
                  allPosts={allPosts}
                  currentIndex={currentIndex}
                  isSidebar={isSidebar}
                  handlePrev={handlePrev}
                  handleNext={handleNext}
                  onClose={onClose}
                  setIsSidebar={setIsSidebar}
                />
              </motion.div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};
