import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Star, Trophy, Gamepad2 } from 'lucide-react';
import OptimizedMedia from '../../components/common/OptimizedMedia';import { GAMES } from '../../config/games';
import { supabase } from '../../config/supabase';


const MiniGames: React.FC = () => {
  const [visibleGames, setVisibleGames] = React.useState<typeof GAMES>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchVisibility = async () => {
      try {
        const { data, error } = await supabase
          .from('page_contents')
          .select('*')
          .eq('id', 'business_settings')
          .maybeSingle();

        if (!error && data && data.content_blocks && data.content_blocks[0]) {
          const cfg = data.content_blocks[0];
          if (cfg.games_visibility) {
            const visible = GAMES.filter(game => cfg.games_visibility[game.id] !== false);
            setVisibleGames(visible);
            return;
          }
        }
        // default: all visible
        setVisibleGames(GAMES);
      } catch (err) {
        console.error('Error fetching game visibility:', err);
        setVisibleGames(GAMES);
      } finally {
        setLoading(false);
      }
    };
    fetchVisibility();
  }, []);

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
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            </div>
          ) : visibleGames.map((game, idx) => (
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
