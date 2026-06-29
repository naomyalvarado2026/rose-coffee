import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { fadeInUp, staggerContainer } from '../../utils/animations';

// Import local videos
import arGatito from '../../assets/Videos AR/ar_gatito.mp4';
import arCafe from '../../assets/Videos AR/ar_cafe.mp4';
import arProducto from '../../assets/Videos AR/ar_producto.mp4';

const VIDEOS = [
  {
    id: 'gatito',
    src: arGatito,
    title: 'Mascota 3D Interactiva',
    description: 'Nuestra gata mascota en AR.'
  },
  {
    id: 'cafe',
    src: arCafe,
    title: 'Taza de Café Rose',
    description: 'Visualiza el café en tu propia mesa.'
  },
  {
    id: 'producto',
    src: arProducto,
    title: 'Empaque de Café',
    description: 'Explora nuestros empaques a detalle.'
  }
];

const VideoCard = ({ video }: { video: typeof VIDEOS[0] }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Auto-play via Intersection Observer for better UX (starts muted)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {});
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <motion.div 
      variants={fadeInUp}
      className="relative rounded-3xl overflow-hidden bg-slate-900 group shadow-lg border border-primary/10"
      style={{ aspectRatio: '9/16' }}
    >
      <video
        ref={videoRef}
        src={video.src}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlay}
      />
      
      {/* Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />
      
      {/* Title & Description */}
      <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-none">
        <h3 className="text-white font-bold text-lg leading-tight mb-1 drop-shadow-md">
          {video.title}
        </h3>
        <p className="text-white/80 text-xs font-medium drop-shadow-md">
          {video.description}
        </p>
      </div>

      {/* Controls Container */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-20">
        <button
          onClick={toggleMute}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10"
          title={isMuted ? "Activar sonido" : "Silenciar"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Center Play/Pause Button - shows on hover or when paused */}
      <div 
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${!isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      >
        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center text-white border border-white/20 shadow-xl pointer-events-auto transition-transform hover:scale-110"
        >
          {isPlaying ? <Pause size={24} className="fill-white" /> : <Play size={24} className="fill-white translate-x-0.5" />}
        </button>
      </div>
    </motion.div>
  );
};

export default function ARVideoGallery() {
  return (
    <section className="py-16 md:py-24 relative z-10 w-full max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 text-xs font-bold uppercase tracking-wider select-none mb-4">
          <Maximize className="w-4 h-4" />
          Experiencias en Acción
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-primary dark:text-white font-sans tracking-tight">
          Nuestros Clientes usándolo
        </h2>
        <p className="max-w-xl mx-auto mt-3 text-slate-500 text-sm font-medium">
          Descubre cómo se ven nuestros productos en la vida real usando la tecnología de Realidad Aumentada desde cualquier smartphone.
        </p>
      </div>

      <motion.div 
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 justify-center"
      >
        {VIDEOS.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </motion.div>
    </section>
  );
}
