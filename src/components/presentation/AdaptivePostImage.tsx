import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

export type AspectRatio = '1:1' | '4:5' | '3:4' | '9:16' | '4:3' | '16:9';

interface AdaptivePostImageProps {
  src?: string;
  alt?: string;
  ratio?: AspectRatio | string;
  className?: string;
  showBadge?: boolean;
  onClick?: () => void;
}

const getRatioClass = (ratio: string) => {
  switch (ratio) {
    case '1:1': return 'aspect-square';
    case '4:5': return 'aspect-[4/5]';
    case '3:4': return 'aspect-[3/4]';
    case '9:16': return 'aspect-[9/16]';
    case '4:3': return 'aspect-[4/3]';
    case '16:9': return 'aspect-[16/9]';
    default: return 'aspect-[4/5]'; // Default to Instagram portrait
  }
};

export const AdaptivePostImage: React.FC<AdaptivePostImageProps> = ({
  src,
  alt = 'Post Image',
  ratio = '4:5',
  className = '',
  showBadge = true,
  onClick
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  const ratioClass = getRatioClass(ratio);

  return (
    <div 
      className={`relative w-full overflow-hidden bg-stone-100 dark:bg-stone-800 ${ratioClass} ${className} ${onClick ? 'cursor-pointer group' : ''}`}
      onClick={onClick}
    >
      <AnimatePresence>
        {!loaded && !error && src && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-stone-100 dark:bg-stone-800 animate-pulse"
          >
            <ImageIcon className="text-stone-300 dark:text-stone-600 w-8 h-8 opacity-50" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {src && !error ? (
        <img 
          src={src} 
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-all duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${onClick ? 'group-hover:scale-105' : ''}`}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100 dark:bg-stone-800/50 border-2 border-dashed border-stone-200 dark:border-stone-700 m-2 rounded-xl">
          <ImageIcon className="text-stone-300 dark:text-stone-600 w-8 h-8 mb-2" />
          <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Sin Imagen</span>
        </div>
      )}
      
      {/* Aspect Ratio Badge */}
      {showBadge && (
        <div className="absolute top-2 left-2 z-10">
          <span className="inline-flex items-center px-1.5 py-0.5 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold rounded uppercase tracking-wider">
            {ratio}
          </span>
        </div>
      )}
      
      {/* Hover Overlay */}
      {onClick && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/30 transition-colors pointer-events-none" />
      )}
    </div>
  );
};
