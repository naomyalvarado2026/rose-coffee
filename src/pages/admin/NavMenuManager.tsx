import { useState, useEffect } from 'react';
import { Menu, Save, Eye, EyeOff, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import { toast } from 'sonner';
import { useNavConfig } from '../../hooks/useNavConfig';
import type { NavItem } from '../../config/navConfig';
import { getIconByName } from '../../config/navConfig';

export default function NavMenuManager() {
  const { navItems, updateNavItems, loading: configLoading } = useNavConfig();
  const [items, setItems] = useState<NavItem[]>([]);
  const [saving, setSaving] = useState(false);

  // Set initial items when loaded
  useEffect(() => {
    if (navItems.length > 0 && items.length === 0) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setItems([...navItems].sort((a, b) => a.order - b.order));
    }
  }, [navItems]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Normalize orders before saving
      const updated = items.map((it, idx) => ({ ...it, order: idx + 1 }));
      await updateNavItems(updated);
      setItems(updated);
      toast.success('Menú guardado exitosamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar el menú');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isVisible: !item.isVisible } : item
    ));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    
    setItems(newItems);
  };

  if (configLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-3">
        <Loader2 className="animate-spin text-coffee dark:text-gold" size={30} />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <AdminHeader 
        title="Gestor de Menú de Navegación" 
        description="Organiza las secciones del menú principal de Rose Coffee. Puedes ocultar elementos o cambiar su orden."
      />

      <div className="bg-white dark:bg-stone-800 border border-coffee/10 rounded-3xl p-6 shadow-2xs space-y-6 max-w-3xl">
        <div className="space-y-1 border-b border-stone-100 dark:border-stone-700 pb-3">
          <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-200 flex items-center gap-1.5">
            <Menu size={16} className="text-gold" />
            Estructura del Menú
          </h3>
          <p className="text-[10px] text-stone-400 font-medium">Usa las flechas para ordenar. El ojo oculta o muestra la sección.</p>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const Icon = getIconByName(item.iconName);
            return (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-3 rounded-xl border ${item.isVisible ? 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700' : 'bg-stone-100/50 dark:bg-stone-900/50 border-stone-100 dark:border-stone-800 opacity-75'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1 mr-2">
                    <button 
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="text-stone-400 hover:text-coffee disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button 
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === items.length - 1}
                      className="text-stone-400 hover:text-coffee disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                  
                  <div className={`p-2 rounded-lg ${item.isVisible ? 'bg-coffee/10 text-coffee dark:text-gold' : 'bg-stone-200 text-stone-400 dark:bg-stone-800'}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">{item.label}</h4>
                    <span className="text-[10px] font-mono text-stone-400">{item.path}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleVisibility(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    item.isVisible 
                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200' 
                      : 'bg-stone-100 text-stone-500 hover:bg-stone-200 border border-stone-200 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400'
                  }`}
                >
                  {item.isVisible ? (
                    <><Eye size={14} /> Visible</>
                  ) : (
                    <><EyeOff size={14} /> Oculto</>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-stone-100 dark:border-stone-700">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-coffee hover:bg-coffee-dark disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer ml-auto"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Guardando...' : 'Guardar Menú'}
          </button>
        </div>
      </div>
    </div>
  );
}
