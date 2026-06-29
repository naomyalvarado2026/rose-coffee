import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import KittenGame from '../../components/game/KittenGame';

const KittenGamePage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-8 flex flex-col font-sans">
      <div className="max-w-6xl mx-auto w-full px-4 flex-1 flex flex-col">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link to="/juegos" className="inline-flex items-center text-primary/60 hover:text-primary transition-colors font-semibold">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a Juegos
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-5xl font-extrabold text-primary dark:text-stone-100 tracking-tight">Gatito Runner</h1>
          <p className="text-primary/70 dark:text-stone-400 mt-2 text-lg">Salta sobre los panes de masa madre y alcanza la mayor puntuación.</p>
        </motion.div>

        <div className="flex-1 w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-primary/10 relative">
          {/* Game Canvas Container */}
          <div className="absolute inset-0 bg-stone-900">
             <KittenGame />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KittenGamePage;
