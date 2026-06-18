import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { supabase } from '../../config/supabase';

export default function WhatsAppFAB() {
  const [phone, setPhone] = useState('593980372113');

  useEffect(() => {
    const cachedPhone = localStorage.getItem('rose_coffee_business_phone');
    if (cachedPhone) {
      setPhone(cachedPhone.replace('+', ''));
    }

    const loadPhoneFromSupabase = async () => {
      try {
        const { data } = await supabase
          .from('page_contents')
          .select('*')
          .eq('id', 'business_settings')
          .maybeSingle();
        if (data?.content_blocks?.[0]?.phone) {
          const rawPhone = data.content_blocks[0].phone.replace('+', '');
          setPhone(rawPhone);
          localStorage.setItem('rose_coffee_business_phone', data.content_blocks[0].phone);
        }
      } catch (e) {
        console.warn('Could not sync FAB WhatsApp phone:', e);
      }
    };
    loadPhoneFromSupabase();
  }, []);

  const whatsappUrl = `https://wa.me/${phone}?text=Hola%20Rose%20Coffee,%20me%20gustar%C3%ADa%20realizar%20una%20consulta%20sobre%20sus%20caf%C3%A9s%20y%20panader%C3%ADa.`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed bottom-6 right-6 z-40 hidden md:block"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-emerald-500 hover:bg-emerald-450 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group cursor-pointer border border-emerald-400/25"
        aria-label="Chatear por WhatsApp con Rose Coffee"
      >
        <MessageCircle size={26} className="fill-current" />
        
        {/* Tooltip text on hover */}
        <span className="absolute right-16 bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-md">
          ¿En qué podemos ayudarte?
        </span>
        
        {/* Decorative Notification pulse */}
        <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-600 border-2 border-white"></span>
        </span>
      </a>
    </motion.div>
  );
}
