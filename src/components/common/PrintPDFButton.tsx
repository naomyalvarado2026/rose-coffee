import React, { useState } from 'react';
import { FileDown, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import html2pdf from 'html2pdf.js';

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

    // Dismiss ALL visible toasts BEFORE printing so none appear in the PDF
    toast.dismiss();

    // Notificamos al Typewriter que debe mostrar el texto completo
    window.dispatchEvent(new Event('pdf-export-start'));

    // Small delay to let toasts fully disappear and states to update
    setTimeout(async () => {
      const element = document.getElementById('brand-presentation-content');
      
      if (!element) {
        setIsPrinting(false);
        toast.error('Error: Contenido no encontrado.');
        window.dispatchEvent(new Event('pdf-export-end'));
        return;
      }

      // Add a class to body for extra print CSS control
      document.body.classList.add('printing-pdf');

      const opt = {
        margin:       0,
        filename:     `${title.replace(/ /g, '-')}.pdf`,
        image:        { type: 'jpeg' as 'jpeg', quality: 1 },
        html2canvas:  { scale: 2, useCORS: true, logging: false, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
      };

      try {
        await html2pdf().from(element).set(opt as any).save();
        toast.success('¡Listo! Exportación PDF finalizada.');
      } catch (error) {
        console.error('Error al generar PDF:', error);
        toast.error('Ocurrió un error al generar el documento.');
      } finally {
        document.body.classList.remove('printing-pdf');
        setIsPrinting(false);
        window.dispatchEvent(new Event('pdf-export-end'));
      }
    }, 600);
  };

  return (
    <div className={`fixed bottom-24 right-6 md:bottom-28 md:right-8 z-50 print:hidden ${className}`}>
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
          {isPrinting ? 'Procesando documento...' : 'Guardar como PDF'}
          <Sparkles size={12} className="text-gold group-hover:text-[#0c0a09] animate-pulse ml-0.5" />
        </span>
      </motion.button>
    </div>
  );
};

export default PrintPDFButton;
