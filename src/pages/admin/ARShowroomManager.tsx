import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { 
  Plus, Edit2, Trash2, QrCode, Eye, AlertCircle, Sparkles, Check, X,
  ShoppingBag, MousePointer, BarChart3, Settings, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import type { ARExperience, Product } from '../../types';

export default function ARShowroomManager() {
  const [experiences, setExperiences] = useState<ARExperience[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [showForm, setShowForm] = useState(false);
  const [editingExp, setEditingExp] = useState<ARExperience | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'MODEL_3D' as ARExperience['type'],
    category: 'PRODUCT' as ARExperience['category'],
    preview_image: '',
    model_url: '',
    video_url: '',
    scale_x: 1,
    scale_y: 1,
    scale_z: 1,
    pos_x: 0,
    pos_y: 0,
    pos_z: 0,
    rotation: '0deg 0deg 0deg',
    enabled: true,
    product_id: ''
  });

  // QR Modal States
  const [qrModalExp, setQrModalExp] = useState<ARExperience | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Experiences
      const { data: expData, error: expError } = await supabase
        .from('ar_experiences')
        .select('*')
        .order('created_at', { ascending: false });

      if (expError) throw expError;

      // Fetch Active Products (for linking)
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .is('deleted_at', null)
        .order('name', { ascending: true });

      if (prodError) throw prodError;

      setExperiences(expData || []);
      setProducts(prodData || []);
    } catch (err: any) {
      console.error('Error fetching admin AR data:', err);
      toast.error('Error al cargar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingExp(null);
    setFormData({
      name: '',
      type: 'MODEL_3D',
      category: 'PRODUCT',
      preview_image: '',
      model_url: '',
      video_url: '',
      scale_x: 1,
      scale_y: 1,
      scale_z: 1,
      pos_x: 0,
      pos_y: 0,
      pos_z: 0,
      rotation: '0deg 0deg 0deg',
      enabled: true,
      product_id: ''
    });
    setShowForm(true);
  };

  const handleOpenEdit = (exp: ARExperience) => {
    setEditingExp(exp);
    setFormData({
      name: exp.name,
      type: exp.type,
      category: exp.category,
      preview_image: exp.preview_image || '',
      model_url: exp.model_url || '',
      video_url: exp.video_url || '',
      scale_x: exp.scale?.x ?? 1,
      scale_y: exp.scale?.y ?? 1,
      scale_z: exp.scale?.z ?? 1,
      pos_x: exp.position?.x ?? 0,
      pos_y: exp.position?.y ?? 0,
      pos_z: exp.position?.z ?? 0,
      rotation: exp.rotation || '0deg 0deg 0deg',
      enabled: exp.enabled ?? true,
      product_id: exp.product_id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta experiencia AR?')) return;
    try {
      const { error } = await supabase
        .from('ar_experiences')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Experiencia eliminada con éxito.');
      fetchData();
    } catch (err: any) {
      toast.error('No se pudo eliminar: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('El nombre es obligatorio.');
      return;
    }

    const payload = {
      name: formData.name,
      type: formData.type,
      category: formData.category,
      preview_image: formData.preview_image || null,
      model_url: formData.model_url || null,
      video_url: formData.video_url || null,
      scale: { x: Number(formData.scale_x), y: Number(formData.scale_y), z: Number(formData.scale_z) },
      position: { x: Number(formData.pos_x), y: Number(formData.pos_y), z: Number(formData.pos_z) },
      rotation: formData.rotation,
      enabled: formData.enabled,
      product_id: formData.product_id || null
    };

    try {
      if (editingExp) {
        // Update
        const { error } = await supabase
          .from('ar_experiences')
          .update(payload)
          .eq('id', editingExp.id);

        if (error) throw error;
        toast.success('Experiencia actualizada con éxito.');
      } else {
        // Insert
        const { error } = await supabase
          .from('ar_experiences')
          .insert([payload]);

        if (error) throw error;
        toast.success('Nueva experiencia creada con éxito.');
      }
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      toast.error('Error al guardar: ' + err.message);
    }
  };

  // QR Code URL helper
  const getQRValue = (expId: string) => {
    return `${window.location.origin}${import.meta.env.BASE_URL}ar/showroom?exp=${expId}`;
  };

  // Aggregate Metrics
  const totalViews = experiences.reduce((acc, curr) => acc + (curr.views_count || 0), 0);
  const totalInteractions = experiences.reduce((acc, curr) => acc + (curr.interaction_count || 0), 0);
  const totalPurchases = experiences.reduce((acc, curr) => acc + (curr.purchase_clicks_count || 0), 0);

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-gold" />
            Gestor de Showroom AR
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Administra los modelos 3D, videos holográficos transparentes y revisa las métricas de interacción espacial.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-blue-900 text-white font-semibold py-2.5 px-5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4.5 h-4.5" />
          Crear Experiencia AR
        </button>
      </div>

      {/* Analytics Aggregate Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Aperturas Totales</span>
            <span className="text-2xl font-extrabold text-gray-800">{totalViews}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <MousePointer className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Interacciones WebXR</span>
            <span className="text-2xl font-extrabold text-gray-800">{totalInteractions}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Clics de Compra In-AR</span>
            <span className="text-2xl font-extrabold text-gray-800">{totalPurchases}</span>
          </div>
        </div>
      </div>

      {/* Editor/Creation Form Overlay */}
      {showForm && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-150 shadow-md">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              {editingExp ? 'Editar Experiencia AR' : 'Nueva Experiencia AR'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-650 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    placeholder="Ej. Café Loja Especialidad"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tipo de AR</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                    >
                      <option value="MODEL_3D">3D Model Only (GLB)</option>
                      <option value="VIDEO_AR">Holograma Video Only</option>
                      <option value="MIXED_EXPERIENCE">Mixed (3D + Video Overlay)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Categoría</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                    >
                      <option value="PRODUCT">Producto</option>
                      <option value="VIDEO">Video</option>
                      <option value="ANIMATION">Animación</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Producto Asociado (E-commerce)</label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="">-- No vincular a catálogo (Solo demo) --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${Number(p.price).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">URL Portada / Vista Previa</label>
                  <input
                    type="url"
                    value={formData.preview_image}
                    onChange={(e) => setFormData({ ...formData, preview_image: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    placeholder="https://cloudinary.com/portada.jpg"
                  />
                </div>
              </div>

              {/* Right Column Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">URL Modelo 3D (.glb)</label>
                  <input
                    type="url"
                    value={formData.model_url}
                    onChange={(e) => setFormData({ ...formData, model_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    placeholder="https://supabase.co/models/product.glb"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">URL Video de Textura (.mp4 o WebM Alpha)</label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    placeholder="https://supabase.co/videos/steam_alpha.webm"
                  />
                </div>

                {/* Vectors Section */}
                <div className="border border-gray-150 p-4 rounded-2xl bg-stone-50/50 space-y-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Parámetros Espaciales</span>
                  
                  {/* Scale vector */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Escala X</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.scale_x}
                        onChange={(e) => setFormData({ ...formData, scale_x: Number(e.target.value) })}
                        className="w-full px-3 py-1 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Escala Y</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.scale_y}
                        onChange={(e) => setFormData({ ...formData, scale_y: Number(e.target.value) })}
                        className="w-full px-3 py-1 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Escala Z</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.scale_z}
                        onChange={(e) => setFormData({ ...formData, scale_z: Number(e.target.value) })}
                        className="w-full px-3 py-1 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* Position offset */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Posición X</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.pos_x}
                        onChange={(e) => setFormData({ ...formData, pos_x: Number(e.target.value) })}
                        className="w-full px-3 py-1 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Posición Y</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.pos_y}
                        onChange={(e) => setFormData({ ...formData, pos_y: Number(e.target.value) })}
                        className="w-full px-3 py-1 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Posición Z</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.pos_z}
                        onChange={(e) => setFormData({ ...formData, pos_z: Number(e.target.value) })}
                        className="w-full px-3 py-1 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Rotación de Orientación</label>
                    <input
                      type="text"
                      value={formData.rotation}
                      onChange={(e) => setFormData({ ...formData, rotation: e.target.value })}
                      className="w-full px-3 py-1 border border-gray-200 rounded-lg text-xs"
                      placeholder="Ej. 0deg 90deg 0deg"
                    />
                  </div>
                </div>

                {/* Enabled Toggle */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded-sm focus:ring-primary/20"
                  />
                  <label htmlFor="enabled" className="text-sm font-semibold text-gray-600">Habilitar esta experiencia en el Showroom público</label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 mt-6">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-750 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary hover:bg-blue-900 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                {editingExp ? 'Guardar Cambios' : 'Crear Experiencia'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main List Table */}
      <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-stone-50/50">
          <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            Catálogo de Experiencias AR & Métricas
          </h2>
          <span className="text-xs text-gray-400 font-bold">{experiences.length} elementos registrados</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
          </div>
        ) : experiences.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold">No se han registrado experiencias en la base de datos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/40 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-3">Nombre / Tipo</th>
                  <th className="px-6 py-3">Escala / Posición</th>
                  <th className="px-6 py-3 text-center">👁️ Vistas</th>
                  <th className="px-6 py-3 text-center">🖱️ Interacciones</th>
                  <th className="px-6 py-3 text-center">🛒 Compras</th>
                  <th className="px-6 py-3 text-center">Estado</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {experiences.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {exp.preview_image ? (
                          <img
                            src={exp.preview_image}
                            alt={exp.name}
                            className="w-10 h-10 rounded-xl object-cover border border-gray-150"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xs">
                            🕶️
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-800 leading-tight">{exp.name}</p>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                            {exp.type} • {exp.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500 space-y-0.5">
                      <p>Scl: x{exp.scale?.x}, y{exp.scale?.y}, z{exp.scale?.z}</p>
                      <p>Pos: x{exp.position?.x}, y{exp.position?.y}, z{exp.position?.z}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-700">
                      {exp.views_count ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-700">
                      {exp.interaction_count ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-emerald-650">
                      {exp.purchase_clicks_count ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {exp.enabled ? (
                        <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                          <Check className="w-3 h-3" /> Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                          <X className="w-3 h-3" /> Inactiva
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* QR Code */}
                        <button
                          onClick={() => setQrModalExp(exp)}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-primary hover:bg-gray-50 cursor-pointer transition-colors"
                          title="Generar Código QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-[#6b3a0e] hover:bg-gray-50 cursor-pointer transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-650 hover:bg-red-50 cursor-pointer transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Generator Modal */}
      {qrModalExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setQrModalExp(null)}
            className="absolute inset-0 bg-[#021a54]/45 backdrop-blur-xs"
          />
          <div className="bg-[#faf2e7] p-8 rounded-3xl max-w-sm w-full relative z-10 text-center shadow-2xl border border-stone-200/50 space-y-6">
            <button
              onClick={() => setQrModalExp(null)}
              className="absolute top-4 right-4 text-stone-500 hover:text-stone-850 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="font-extrabold text-[#021a54] text-lg">Código QR de Showroom</h3>
              <p className="text-stone-500 text-xs">{qrModalExp.name}</p>
            </div>

            {/* QR Render Area */}
            <div id="qr-code-svg-container" className="w-48 h-48 bg-white border border-stone-200 rounded-2xl mx-auto flex items-center justify-center shadow-md p-3">
              <QRCodeSVG
                value={getQRValue(qrModalExp.id)}
                size={170}
                bgColor="#ffffff"
                fgColor="#021a54"
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="text-[11px] text-[#6b3a0e] bg-gold/10 p-3.5 rounded-2xl border border-gold/20 leading-relaxed font-medium">
              URL QR: <br/>
              <span className="font-mono break-all font-light text-stone-600 block mt-1">
                {getQRValue(qrModalExp.id)}
              </span>
            </div>

            <p className="text-gray-500 text-xs">
              Apunta con tu celular para cargar la experiencia espacial directamente en esa mesa de restaurante.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
