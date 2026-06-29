import { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Users, Store, Layers, FileText, LayoutDashboard, ClipboardList, Package, Percent, ChefHat, LineChart, Settings
} from 'lucide-react';

// Custom inline CSS for cmdk to avoid imports issues
const cmdkStyles = `
  [cmdk-root] {
    max-width: 640px;
    width: 100%;
    background: #021a54;
    border-radius: 20px;
    padding: 10px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-family: inherit;
    overflow: hidden;
  }
  [cmdk-input] {
    font-family: inherit;
    width: 100%;
    font-size: 14px;
    padding: 12px;
    outline: none;
    border: none;
    background: transparent;
    color: #faf2e7;
  }
  [cmdk-input]::placeholder {
    color: #94a3b8;
  }
  [cmdk-item] {
    content-visibility: auto;
    cursor: pointer;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    color: #94a3b8;
    user-select: none;
    transition: all 150ms ease;
    font-size: 13px;
    font-weight: 500;
  }
  [cmdk-item][data-selected='true'] {
    background: rgba(255, 255, 255, 0.08);
    color: #faf2e7;
  }
  [cmdk-group-heading] {
    user-select: none;
    font-size: 10px;
    font-weight: 800;
    color: #475569;
    padding: 8px 12px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  [cmdk-empty] {
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 64px;
    color: #64748b;
  }
`;

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      <style>{cmdkStyles}</style>

      {/* COMMAND PALETTE POPUP */}
      {open && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn"
          onClick={() => setOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="w-full max-w-2xl animate-scaleIn"
          >
            <Command label="Menú de comandos de administración">
              <div className="flex items-center border-b border-white/10 px-3">
                <Search size={18} className="text-stone-400 shrink-0" />
                <Command.Input 
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Escribe un comando para navegar..." 
                />
                <button
                  onClick={() => setOpen(false)}
                  className="text-stone-400 hover:text-white p-1 rounded-lg text-xs font-semibold font-mono border border-white/10 bg-white dark:bg-stone-800/5 cursor-pointer select-none"
                >
                  ESC
                </button>
              </div>

              <Command.List className="max-h-[350px] overflow-y-auto p-2 custom-scrollbar-dark">
                <Command.Empty>No se encontraron resultados.</Command.Empty>

                <Command.Group heading="Navegación del Panel">
                  <Command.Item onSelect={() => handleNavigation('/admin')}>
                    <LayoutDashboard size={16} className="text-stone-400" />
                    <span>Ir al Inicio (Dashboard)</span>
                  </Command.Item>
                  <Command.Item onSelect={() => handleNavigation('/admin/pedidos')}>
                    <ClipboardList size={16} className="text-amber-400" />
                    <span>Pedidos (Ventas)</span>
                  </Command.Item>
                  <Command.Item onSelect={() => handleNavigation('/admin/productos')}>
                    <Store size={16} className="text-amber-400" />
                    <span>Productos (Catálogo)</span>
                  </Command.Item>
                  <Command.Item onSelect={() => handleNavigation('/admin/inventario')}>
                    <Package size={16} className="text-amber-400" />
                    <span>Inventario & Existencias</span>
                  </Command.Item>
                  <Command.Item onSelect={() => handleNavigation('/admin/clientes')}>
                    <Users size={16} className="text-blue-400" />
                    <span>Clientes (CRM)</span>
                  </Command.Item>
                  <Command.Item onSelect={() => handleNavigation('/admin/marketing')}>
                    <Percent size={16} className="text-emerald-400" />
                    <span>Marketing & Cupones</span>
                  </Command.Item>
                  <Command.Item onSelect={() => handleNavigation('/admin/produccion')}>
                    <ChefHat size={16} className="text-emerald-400" />
                    <span>Producción & Horno</span>
                  </Command.Item>
                  <Command.Item onSelect={() => handleNavigation('/admin/paginas')}>
                    <FileText size={16} className="text-cyan-400" />
                    <span>Editor Web (Páginas)</span>
                  </Command.Item>
                  <Command.Item onSelect={() => handleNavigation('/admin/ar')}>
                    <Layers size={16} className="text-emerald-450 text-emerald-400" />
                    <span>Gestor AR (Realidad Aumentada)</span>
                  </Command.Item>
                  <Command.Item onSelect={() => handleNavigation('/admin/analitica')}>
                    <LineChart size={16} className="text-indigo-400" />
                    <span>Analítica de Rendimiento</span>
                  </Command.Item>
                  <Command.Item onSelect={() => handleNavigation('/admin/configuracion')}>
                    <Settings size={16} className="text-stone-400" />
                    <span>Configuración de Tienda</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}

