import React, { useState } from 'react';
import { FileDown, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface PrintPDFButtonProps {
  title?: string;
  className?: string;
}

export const PrintPDFButton: React.FC<PrintPDFButtonProps> = ({
  title = 'Presentación Oficial Rose Coffee',
  className = '',
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    toast.info('Preparando documento optimizado para PDF...', {
      description: 'En la ventana que se abrirá, selecciona el destino "Guardar como PDF".',
      duration: 3500,
    });

    // Pequeño retardo para dar tiempo al toast de renderizarse o a las animaciones de asentarse
    setTimeout(() => {
      const originalTitle = document.title;
      if (title) {
        document.title = title;
      }

      window.print();

      // Restaurar el título después de imprimir
      setTimeout(() => {
        document.title = originalTitle;
        setIsPrinting(false);
        toast.success('¡Listo! Exportación PDF finalizada.');
      }, 1000);
    }, 400);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 print:hidden ${className}`}>
      <motion.button
        onClick={handlePrint}
        disabled={isPrinting}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="group relative flex items-center gap-2.5 px-6 py-3.5 bg-[#0c0a09]/90 hover:bg-gradient-to-r hover:from-gold hover:to-amber-500 text-white hover:text-[#0c0a09] border border-gold/40 hover:border-transparent rounded-full shadow-2xl shadow-gold/20 backdrop-blur-md transition-all duration-300 cursor-pointer overflow-hidden font-sans font-bold text-xs tracking-wide"
        aria-label="Guardar como PDF"
      >
        {/* Resplandor decorativo de fondo en hover */}
        <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

        <div className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full bg-gold/20 group-hover:bg-[#0c0a09]/15 transition-colors">
          {isPrinting ? (
            <Check size={14} className="text-green-400 group-hover:text-green-700 animate-bounce" />
          ) : (
            <FileDown size={14} className="text-gold group-hover:text-[#0c0a09] transition-colors" />
          )}
        </div>

        <span className="relative z-10 flex items-center gap-1">
          {isPrinting ? 'Generando PDF...' : 'Guardar como PDF'}
          <Sparkles size={12} className="text-gold group-hover:text-[#0c0a09] animate-pulse ml-0.5" />
        </span>
      </motion.button>
    </div>
  );
};

export default PrintPDFButton;
