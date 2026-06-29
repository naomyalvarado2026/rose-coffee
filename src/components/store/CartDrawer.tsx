import { useCartStore } from '../../store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OptimizedMedia from '../common/OptimizedMedia';

const CartDrawer = () => {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeDrawer();
    navigate('/cart');
  };

  const slideInRight: Variants = {
    initial: { x: '100%' },
    animate: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } },
    exit: { x: '100%', transition: { type: 'spring', damping: 25, stiffness: 200 } }
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            variants={slideInRight}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[101] bg-brand-base dark:bg-stone-900 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-700/60 bg-white dark:bg-stone-800">
              <div className="flex items-center gap-2 text-primary dark:text-gold">
                <ShoppingBag size={20} />
                <h2 className="font-sans font-extrabold text-xl">Tu Carrito</h2>
                <span className="bg-coffee text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                  {items.length}
                </span>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 dark:text-stone-200 hover:bg-stone-100 rounded-full transition-colors focus-visible:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-transparent">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-400 space-y-4">
                  <ShoppingBag size={48} className="opacity-20" />
                  <p className="font-medium text-stone-500 dark:text-stone-400">Tu carrito está vacío</p>
                  <button
                    onClick={closeDrawer}
                    className="text-coffee dark:text-gold font-bold text-sm hover:underline cursor-pointer"
                  >
                    Seguir comprando
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const basePrice = Number(item.product.price) || 0;
                  const adjustment = item.variant?.price_adjustment ? Number(item.variant.price_adjustment) : 0;
                  const price = basePrice + adjustment;
                  const image = item.variant?.cloudinary_image_url || item.product.cover_image_url || item.product.image_url || '';

                  return (
                    <motion.div
                      layout
                      key={`${item.product.id}-${item.variant?.id || 'base'}`}
                      className="flex gap-4 bg-white dark:bg-stone-800 p-3 rounded-2xl border border-stone-100 dark:border-stone-700 shadow-sm relative group"
                    >
                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.product.id, item.variant?.id)}
                        className="absolute -top-2 -right-2 bg-white dark:bg-stone-800 text-stone-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full shadow-sm border border-stone-100 dark:border-stone-700 opacity-0 group-hover:opacity-100 transition-all focus-visible:outline-none cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-50 dark:bg-stone-800 shrink-0 border border-stone-100 dark:border-stone-700">
                        <OptimizedMedia
                          src={image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex flex-col justify-between flex-1 py-1 pr-2 text-left">
                        <div>
                          <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 line-clamp-1">{item.product.name}</h3>
                          {item.variant && (
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                              {item.variant.color_name} {item.variant.size ? `| ${item.variant.size}` : ''}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-extrabold text-coffee dark:text-gold text-sm">${price.toFixed(2)}</span>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-800">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity - 1)}
                              className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 dark:text-stone-200 focus-visible:outline-none cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-[10px] font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.variant?.id, Math.min(99, item.quantity + 1))}
                              className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 dark:text-stone-200 focus-visible:outline-none cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700/60 space-y-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-stone-400 font-medium text-sm">Subtotal</span>
                  <span className="text-xl font-extrabold text-primary dark:text-gold">${getTotalPrice().toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-coffee hover:bg-coffee-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors focus-visible:outline-none shadow-md cursor-pointer"
                >
                  Ir a Pagar
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
