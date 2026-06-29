import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Star, Trophy, Gamepad2 } from 'lucide-react';
import OptimizedMedia from '../../components/common/OptimizedMedia';

const GAMES = [
  {
    id: 'coffee-clicker',
    title: 'Coffee Clicker',
    description: 'Haz clic para ganar granos de café y comprar mejoras para tu cafetería.',
    path: '/juegos/coffee-clicker',
    image: '/games-covers/clicker-cover.png',
    tags: ['Idle', 'Clicker', 'Casual']
  },
  {
    id: 'gatito-runner',
    title: 'Gatito Runner',
    description: 'Salta y esquiva obstáculos con nuestro lindo gatito en la cafetería.',
    path: '/juegos/gatito-runner',
    image: '/games-covers/runner-cover.png',
    tags: ['Arcade', 'Reflejos', '1 Jugador']
  },
  {
    id: 'wordle',
    title: 'La Palabra del Día',
    description: 'Adivina la palabra relacionada con el café en 6 intentos.',
    path: '/juegos/palabra-del-dia',
    image: '/games-covers/wordle-cover.png',
    tags: ['Palabras', 'Mental', 'Casual']
  },
  {
    id: 'flappy-taza',
    title: 'Flappy Taza',
    description: 'Vuela con una taza de café esquivando obstáculos.',
    path: '/juegos/flappy-taza',
    image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Arcade', 'Reflejos', 'Retro']
  },
  {
    id: 'fast-barista',
    title: 'Barista Veloz',
    description: 'Prepara los pedidos de café combinando ingredientes antes de que acabe el tiempo.',
    path: '/juegos/barista-veloz',
    image: '/games-covers/barista-cover.png',
    tags: ['Acción', 'Tiempo', 'Casual']
  },
  {
    id: 'lucky-wheel',
    title: 'Ruleta de Granos',
    description: 'Prueba tu suerte y gana premios increíbles girando la ruleta.',
    path: '/juegos/ruleta',
    image: '/games-covers/wheel-cover.png',
    tags: ['Suerte', 'Apuestas', 'Casual']
  },
  {
    id: 'bricks-breaker',
    title: 'Coffee Bricks Breaker',
    description: 'Rebota el grano de café para romper los bloques y atrapar power-ups.',
    path: '/juegos/bricks-breaker',
    image: '/games-covers/bricks-cover.png',
    tags: ['Arcade', 'Retro', 'Físicas']
  },
  {
    id: 'latte-art-puzzle',
    title: 'Latte Art Puzzle',
    description: 'Acomoda las piezas, completa líneas horizontales y gana granos de café.',
    path: '/juegos/latte-art-puzzle',
    image: '/games-covers/tetris-cover.png',
    tags: ['Puzzle', 'Mental', 'Casual']
  },
  {
    id: 'coffee-invaders',
    title: 'Coffee Invaders',
    description: 'Defiende tu cafetería de las tazas alienígenas en este frenético arcade retro.',
    path: '/juegos/coffee-invaders',
    image: '/games-covers/invaders-cover.png',
    tags: ['Arcade', 'Shooter', 'Retro']
  }
];


const MiniGames: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-16 px-6 lg:px-24 font-sans text-primary dark:text-stone-100">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gold/10 rounded-full">
              <Gamepad2 className="w-10 h-10 text-gold" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Mini Juegos Rose Coffee
          </h1>
          <p className="text-lg md:text-xl text-primary/70 dark:text-stone-300 max-w-2xl mx-auto">
            Tómate un respiro. Disfruta de nuestra colección de juegos arcade mientras degustas tu café favorito.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {GAMES.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white dark:bg-gradient-to-b dark:from-stone-900 dark:to-stone-950 rounded-3xl overflow-hidden shadow-lg border border-primary/5 dark:border-white/5 flex flex-col h-full hover:shadow-2xl dark:hover:border-gold/40 dark:hover:shadow-[0_0_25px_rgba(212,175,55,0.2)] transition-all duration-300 relative z-10"
            >
              <div className="relative h-48 overflow-hidden bg-coffee-dark">
                <OptimizedMedia 
                  src={game.image} 
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <h3 className="text-2xl font-bold text-white">{game.title}</h3>
                  <div className="flex gap-1">
                    <Star className="w-5 h-5 text-gold fill-gold" />
                    <Star className="w-5 h-5 text-gold fill-gold" />
                    <Star className="w-5 h-5 text-gold fill-gold" />
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-2 mb-4">
                  {game.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-150 dark:bg-stone-800/60 text-xs font-semibold rounded-full text-primary/80 dark:text-stone-300 uppercase tracking-wider border border-transparent dark:border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-primary/70 dark:text-stone-300 leading-relaxed mb-8 flex-1">
                  {game.description}
                </p>
                
                <Link 
                  to={game.path}
                  className="w-full py-4 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 group-hover:bg-coffee transition-colors"
                >
                  <Play className="w-5 h-5 fill-current" />
                  JUGAR AHORA
                </Link>
              </div>
            </motion.div>
          ))}
          
          {/* Próximamente Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border-2 border-dashed border-primary/20 dark:border-white/10 dark:bg-stone-900/30 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-8 text-center min-h-[400px] transition-all hover:border-primary/40 dark:hover:border-gold/30"
          >
            <Trophy className="w-16 h-16 text-primary/20 dark:text-stone-500 mb-4" />
            <h3 className="text-xl font-bold text-primary/40 dark:text-stone-400 mb-2">Más juegos próximamente</h3>
            <p className="text-primary/30 dark:text-stone-500">Estamos horneando nuevas ideas. ¡Vuelve pronto!</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MiniGames;
