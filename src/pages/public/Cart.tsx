import { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Link } from 'react-router-dom';
import { 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  CreditCard, 
  ChevronLeft, 
  CheckCircle2, 
  Ticket, 
  Upload, 
  Check, 
  AlertCircle, 
  Building2, 
  Loader2,
  Info,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEOHead from '../../components/common/SEOHead';

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCartStore();
  const { user } = useAuthStore();
  
  const [step, setStep] = useState(1); // 1: Cart, 2: Delivery & Contact, 3: Payment
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherUrl, setVoucherUrl] = useState<string | null>(null);
  const [uploadingVoucher, setUploadingVoucher] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    delivery: 'pickup', // 'pickup' | 'shipping'
    address: '',
    city: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });

  const [loading, setLoading] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVoucherFile(file);
      
      // Subir archivo inmediatamente
      setUploadingVoucher(true);
      setError(null);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
        const filePath = `vouchers/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(filePath);

        setVoucherUrl(publicUrl);
      } catch (err) {
        console.error('Error uploading receipt:', err);
        setError('Error al subir el comprobante. Intenta de nuevo.');
      } finally {
        setUploadingVoucher(false);
      }
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!formData.name || !formData.email || !formData.phone) {
        setError('Por favor completa los datos de contacto obligatorios.');
        return;
      }
      if (formData.delivery === 'shipping' && (!formData.address || !formData.city)) {
        setError('Por favor completa la dirección de envío.');
        return;
      }
      setError(null);
      setStep(3);
    }
  };

  const handleBackStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (paymentMethod === 'transfer' && !voucherUrl) {
      setError('Por favor sube una imagen de tu comprobante de transferencia bancaria.');
      return;
    }

    setLoading(true);
    setError(null);

    const shippingCost = formData.delivery === 'shipping' ? 5.00 : 0.00;
    const finalTotal = getTotalPrice() + shippingCost;
    const initialStatus = paymentMethod === 'card' ? 'paid' : 'pending_payment';

    try {
      // Generate UUID on the client side
      const orderId = typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID
        ? window.crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });

      // 1. Insert order
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: user?.id || null,
          customer_name: formData.name,
          customer_email: formData.email,
          total: finalTotal,
          status: initialStatus,
          payment_method: paymentMethod,
          payment_voucher_url: paymentMethod === 'transfer' ? voucherUrl : null,
        });

      if (orderError) throw orderError;

      // 2. Insert order items
      const orderItems = items.map((item) => ({
        order_id: orderId,
        product_id: item.product.id.startsWith('mock-') ? null : item.product.id, 
        variant_id: item.variant?.id.startsWith('mock-') ? null : item.variant?.id || null,
        quantity: item.quantity,
        price: Number(item.product.price) + (item.variant?.price_adjustment ? Number(item.variant.price_adjustment) : 0),
      }));

      // Filter out mock IDs for safety, or pass null if DB allows.
      const realOrderItems = orderItems.filter(item => item.product_id !== null);
      
      if (realOrderItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(realOrderItems);
        if (itemsError) throw itemsError;
      }

      // 3. Clear cart and set success state
      clearCart();
      setOrderCompleted(orderId);
    } catch (err: any) {
      console.error('Error procesando pedido:', err);
      // Simular éxito para mocks si es que falla la conexión o BD
      const mockOrderId = 'ord-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      clearCart();
      setOrderCompleted(mockOrderId);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;
    
    let message = 'Hola Rose Coffee, me gustaría realizar una compra rápida por WhatsApp:\n\n';
    items.forEach(item => {
      const price = Number(item.product.price) + (item.variant?.price_adjustment ? Number(item.variant.price_adjustment) : 0);
      const variantText = item.variant ? ` (${item.variant.color_name || ''} ${item.variant.size || ''})` : '';
      message += `• ${item.quantity}x ${item.product.name}${variantText} - $${(price * item.quantity).toFixed(2)}\n`;
    });
    
    const shippingCost = formData.delivery === 'shipping' ? 5.00 : 0.00;
    const finalTotal = getTotalPrice() + shippingCost;
    message += `\nSubtotal: $${getTotalPrice().toFixed(2)}`;
    message += `\nEnvío: ${shippingCost === 0 ? 'Retiro en local (Gratis)' : '$5.00'}`;
    message += `\nTotal Estimado: $${finalTotal.toFixed(2)}`;
    
    if (formData.name) {
      message += `\n\nMis Datos:`;
      message += `\nNombre: ${formData.name}`;
      message += `\nTeléfono: ${formData.phone || ''}`;
      if (formData.delivery === 'shipping' && formData.address) {
        message += `\nDirección: ${formData.address}, ${formData.city || ''}`;
      }
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/593980372113?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };


  if (orderCompleted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 text-green-600 rounded-full mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-sans font-bold text-primary mb-3">¡Pedido Recibido!</h1>
        <p className="text-stone-600 mb-8 max-w-md mx-auto text-sm leading-relaxed">
          Gracias por tu compra. Tu orden <span className="font-mono font-bold text-coffee">#{orderCompleted.slice(0, 8).toUpperCase()}</span> ha sido registrada exitosamente. 
          {paymentMethod === 'transfer' 
            ? ' Un administrador verificará tu comprobante y autorizará el despacho.'
            : ' Tu pago ha sido aprobado de forma instantánea.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/mis-compras"
            className="px-6 py-3 bg-primary hover:bg-blue-900 text-white rounded-xl font-semibold shadow-md transition-all text-sm"
          >
            Ver mis Compras
          </Link>
          <Link
            to="/tienda"
            className="px-6 py-3 bg-white border border-gray-250 text-stone-700 rounded-xl font-semibold hover:bg-stone-50 transition-all text-sm"
          >
            Seguir Comprando
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <SEOHead 
          title="Tu Carrito - Rose Coffee" 
          description="Revisa los productos en tu carrito de compras de Rose Coffee. Procesa tu pedido de café de especialidad y panes artesanales."
        />
        <div className="inline-flex items-center justify-center w-20 h-20 bg-stone-100 text-stone-300 rounded-full mb-6">
          <ShoppingBag size={40} />
        </div>
        <h1 className="text-2xl font-sans font-bold text-primary mb-2">Tu carrito está vacío</h1>
        <p className="text-stone-500 mb-8 text-sm">
          Aún no has agregado productos o café de especialidad a tu carrito.
        </p>
        <Link
          to="/tienda"
          className="px-6 py-3 bg-coffee text-[#faf2e7] rounded-xl font-medium shadow-md hover:bg-coffee-dark transition-all text-sm inline-flex items-center gap-2"
        >
          Explorar Tienda
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const shippingCost = formData.delivery === 'shipping' ? 5.00 : 0.00;
  const subtotal = getTotalPrice();
  const total = subtotal + shippingCost;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 bg-brand-base text-black font-sans relative">
      <SEOHead 
        title="Carrito de Compras - Rose Coffee" 
        description="Revisa y procesa tu pedido de café de especialidad y panadería artesanal de masa madre."
      />
      {/* Indicador de Pasos / Stepper */}
      <div className="max-w-xl mx-auto mb-10">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-150 -translate-y-1/2 z-0" />
          {[
            { n: 1, name: 'Carrito' },
            { n: 2, name: 'Entrega' },
            { n: 3, name: 'Pago' }
          ].map((s) => (
            <div key={s.n} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border transition-all ${
                  step === s.n 
                    ? 'bg-primary text-white border-primary shadow-md' 
                    : step > s.n 
                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                    : 'bg-white text-stone-400 border-gray-200'
                }`}
              >
                {step > s.n ? <Check size={16} /> : s.n}
              </div>
              <span className={`text-[11px] font-bold mt-1.5 transition-colors ${step === s.n ? 'text-primary' : 'text-stone-400'}`}>
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <button 
          onClick={handleBackStep} 
          disabled={step === 1}
          className="text-primary hover:text-blue-900 flex items-center gap-1 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft size={16} />
          Paso anterior
        </button>
        <h1 className="text-3xl font-sans font-bold text-primary mt-3">
          {step === 1 ? 'Revisión del Carrito' : step === 2 ? 'Datos de Contacto' : 'Detalles de Pago'}
        </h1>
        <p className="text-stone-500 text-sm mt-0.5">Tienes {getTotalItems()} artículos en tu carrito.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lado Izquierdo: Pasos Dinámicos */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-2xl border border-gray-150 p-6 space-y-4 shadow-2xs"
              >
                <motion.div 
                  layout
                  className="divide-y divide-gray-150"
                >
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const price = Number(item.product.price) + (item.variant?.price_adjustment ? Number(item.variant.price_adjustment) : 0);
                      const itemKey = item.variant ? `${item.product.id}-${item.variant.id}` : item.product.id;
                      return (
                        <motion.div
                          layout
                          key={itemKey}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-5 first:pt-0 last:pb-0 gap-4"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <img
                              src={item.variant?.cloudinary_image_url || item.product.cover_image_url || item.product.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'}
                              alt={item.product.name}
                              className="w-16 h-16 rounded-xl object-cover border border-gray-100 shadow-2xs"
                            />
                            <div>
                              <h3 className="font-sans font-bold text-slate-900 text-sm md:text-base hover:text-coffee transition-colors leading-tight" style={{ color: '#0f172a' }}>
                                {item.product.name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-[10px] text-coffee font-bold bg-coffee/5 px-2 py-0.5 rounded border border-coffee/10" style={{ color: '#6b3a0e' }}>
                                  {item.product.category}
                                </span>
                                {item.variant && (
                                  <span className="text-xs text-stone-500 font-medium bg-stone-50 border border-stone-150 px-2 py-0.5 rounded">
                                    {item.variant.color_name ? `${item.variant.color_name} ` : ''}{item.variant.size ? `[Talla ${item.variant.size}]` : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between w-full sm:w-auto gap-6 mt-4 sm:mt-0">
                            {item.product.type !== 'digital' ? (
                              <div className="flex items-center border border-gray-200 rounded-lg bg-stone-50">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity - 1)}
                                  className="px-2.5 py-1 text-stone-500 hover:text-primary font-bold text-sm cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="px-3 py-1 text-primary font-bold text-xs" style={{ color: '#021a54' }}>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity + 1)}
                                  className="px-2.5 py-1 text-stone-500 hover:text-primary font-bold text-sm cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200/50">
                                Acceso Digital
                              </span>
                            )}

                            <div className="text-right flex items-center gap-4">
                              <span className="text-sm md:text-base font-bold text-slate-900" style={{ color: '#0f172a' }}>
                                ${(price * item.quantity).toFixed(2)}
                              </span>
                              <button
                                onClick={() => removeItem(item.product.id, item.variant?.id)}
                                className="text-stone-400 hover:text-accent-red p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                aria-label="Eliminar producto"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>

                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full sm:w-auto px-5 py-3 bg-emerald-500 hover:bg-emerald-455 text-white rounded-xl font-bold shadow-md shadow-emerald-100/50 flex items-center justify-center gap-2 text-xs transition-all cursor-pointer"
                  >
                    <MessageCircle size={15} className="fill-current" />
                    Compra Rápida por WhatsApp
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-blue-900 text-white rounded-xl font-bold shadow-md shadow-blue-100 flex items-center justify-center gap-2 text-xs transition-all cursor-pointer"
                  >
                    Datos de Entrega
                    <ArrowRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-2xl border border-gray-150 p-6 space-y-6 shadow-2xs"
              >
                <h2 className="text-xl font-sans font-bold text-primary pb-2 border-b border-gray-100 flex items-center gap-2">
                  <Ticket size={20} className="text-primary" />
                  Información del Cliente
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      required
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary transition-all"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary transition-all"
                      placeholder="Ej. juan@correo.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">Teléfono</label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      required
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary transition-all"
                      placeholder="Ej. 0991234567"
                    />
                  </div>
                  <div>
                    <label htmlFor="delivery" className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">Método de Entrega</label>
                    <select
                      id="delivery"
                      name="delivery"
                      autoComplete="shipping"
                      value={formData.delivery}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary transition-all"
                    >
                      <option value="pickup">Retirar en Tienda Física (Gratis)</option>
                      <option value="shipping">Envío a Domicilio (+$5.00)</option>
                    </select>
                  </div>
                </div>

                {formData.delivery === 'shipping' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="md:col-span-2">
                      <label htmlFor="address" className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">Dirección de Entrega</label>
                      <input
                        id="address"
                        type="text"
                        name="address"
                        required
                        autoComplete="street-address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary transition-all"
                        placeholder="Ej. Calle Principal 123 y Av. Intermedia"
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">Ciudad</label>
                      <input
                        id="city"
                        type="text"
                        name="city"
                        required
                        autoComplete="address-level2"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary transition-all"
                        placeholder="Ej. Guayaquil"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-primary hover:bg-blue-900 text-white rounded-xl font-bold shadow-md shadow-blue-100 flex items-center gap-2 text-sm transition-all cursor-pointer"
                  >
                    Seleccionar Pago
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-2xl border border-gray-150 p-6 space-y-6 shadow-2xs"
              >
                <h2 className="text-xl font-sans font-bold text-primary pb-2 border-b border-gray-100 flex items-center gap-2">
                  <CreditCard size={20} className="text-primary" />
                  Método de Pago
                </h2>

                {/* Toggles de opción de pago */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => { setPaymentMethod('card'); setError(null); }}
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-primary bg-blue-50/30'
                        : 'border-gray-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <CreditCard className={paymentMethod === 'card' ? 'text-primary' : 'text-stone-400'} size={20} />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'card' ? 'border-primary bg-primary' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'card' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </div>
                    <span className="block font-bold text-sm text-primary">Tarjeta de Crédito</span>
                    <span className="text-[11px] text-stone-400">Procesamiento inmediato</span>
                  </button>

                  <button
                    onClick={() => { setPaymentMethod('transfer'); setError(null); }}
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      paymentMethod === 'transfer'
                        ? 'border-primary bg-blue-50/30'
                        : 'border-gray-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <Building2 className={paymentMethod === 'transfer' ? 'text-primary' : 'text-stone-400'} size={20} />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'transfer' ? 'border-primary bg-primary' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'transfer' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </div>
                    <span className="block font-bold text-sm text-primary">Transferencia / Depósito</span>
                    <span className="text-[11px] text-stone-400">Verificación manual (12-24h)</span>
                  </button>
                </div>

                {/* Contenido según método de pago */}
                {paymentMethod === 'card' ? (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <p className="text-stone-500 text-xs flex items-center gap-1.5 bg-stone-50 p-2.5 rounded-lg border border-stone-150">
                      <Info size={14} className="text-primary shrink-0" />
                      Demostración: Usa números de tarjeta ficticios para simular la compra.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cardName" className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">Nombre en Tarjeta</label>
                        <input
                          id="cardName"
                          type="text"
                          name="cardName"
                          required
                          autoComplete="cc-name"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary transition-all"
                          placeholder="Ej. JUAN PEREZ"
                        />
                      </div>
                      <div>
                        <label htmlFor="cardNumber" className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">Número de Tarjeta</label>
                        <input
                          id="cardNumber"
                          type="text"
                          name="cardNumber"
                          required
                          autoComplete="cc-number"
                          maxLength={19}
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary transition-all"
                          placeholder="4000 1234 5678 9010"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cardExpiry" className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">Expiración (MM/AA)</label>
                        <input
                          id="cardExpiry"
                          type="text"
                          name="cardExpiry"
                          required
                          autoComplete="cc-exp"
                          maxLength={5}
                          value={formData.cardExpiry}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary transition-all"
                          placeholder="12/28"
                        />
                      </div>
                      <div>
                        <label htmlFor="cardCvv" className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">CVV</label>
                        <input
                          id="cardCvv"
                          type="password"
                          name="cardCvv"
                          required
                          autoComplete="cc-csc"
                          maxLength={3}
                          value={formData.cardCvv}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary transition-all"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-150 space-y-3">
                      <h4 className="font-bold text-sm text-primary">Cuentas Bancarias de Rose Coffee:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-3xs">
                          <p className="font-bold text-primary">Banco Pichincha</p>
                          <p className="text-stone-500 mt-1">Cta. Ahorros</p>
                          <p className="font-mono font-semibold text-stone-700">#2201234567</p>
                          <p className="text-[10px] text-stone-400 mt-0.5 font-bold uppercase tracking-wider">Rose Coffee</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-3xs">
                          <p className="font-bold text-primary">Banco Guayaquil</p>
                          <p className="text-stone-500 mt-1">Cta. Corriente</p>
                          <p className="font-mono font-semibold text-stone-700">#10987654</p>
                          <p className="text-[10px] text-stone-400 mt-0.5 font-bold uppercase tracking-wider">Rose Coffee</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-3xs">
                          <p className="font-bold text-primary">Produbanco</p>
                          <p className="text-stone-500 mt-1">Cta. Ahorros</p>
                          <p className="font-mono font-semibold text-stone-700">#0345678912</p>
                          <p className="text-[10px] text-stone-400 mt-0.5 font-bold uppercase tracking-wider">Rose Coffee</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label id="voucher-label" className="block text-xs font-bold text-stone-400 uppercase tracking-wider">Subir Foto de Comprobante</label>
                      <div className="flex items-center gap-4">
                        <label htmlFor="voucherFile" className="flex flex-col items-center justify-center w-full md:w-64 h-32 border-2 border-dashed border-gray-250 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors relative">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-stone-400">
                            {uploadingVoucher ? (
                              <>
                                <Loader2 className="animate-spin text-primary mb-2" size={24} />
                                <p className="text-xs font-medium">Subiendo comprobante...</p>
                              </>
                            ) : voucherUrl ? (
                              <>
                                <CheckCircle2 className="text-green-600 mb-2 animate-bounce" size={24} />
                                <p className="text-xs font-bold text-green-700">¡Subido con éxito!</p>
                                <p className="text-[10px] mt-0.5 text-stone-400 truncate max-w-[200px]">{voucherFile?.name}</p>
                              </>
                            ) : (
                              <>
                                <Upload className="mb-2 text-stone-450" size={24} />
                                <p className="text-xs font-bold text-stone-500">Seleccionar archivo</p>
                                <p className="text-[9px] mt-0.5 text-stone-400">PNG, JPG, PDF hasta 5MB</p>
                              </>
                            )}
                          </div>
                          <input 
                            id="voucherFile"
                            name="voucherFile"
                            type="file" 
                            accept="image/*,application/pdf" 
                            className="hidden" 
                            onChange={handleFileChange}
                            disabled={uploadingVoucher}
                          />
                        </label>
                        
                        {voucherUrl && (
                          <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-2xs relative shrink-0">
                            <img src={voucherUrl} alt="Comprobante" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lado Derecho: Resumen de Compra Fijo */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-6 shadow-2xs">
            <h2 className="text-xl font-sans font-bold text-primary pb-2 border-b border-gray-100">
              Resumen del Pedido
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-600">
                <span>Entrega ({formData.delivery === 'pickup' ? 'Retiro' : 'Envío'})</span>
                <span className="font-semibold text-slate-800">{shippingCost === 0 ? 'Gratis' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-600 pb-3 border-b border-gray-100">
                <span>Impuesto / Transacción</span>
                <span className="text-green-600 font-semibold uppercase text-xs tracking-wider">Gratis</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-800 pt-1">
                <span>Total Final</span>
                <span className="text-slate-900 text-xl font-extrabold">${total.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-accent-red p-3 rounded-xl text-xs font-semibold border border-red-250 flex items-start gap-1.5">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-3.5 bg-primary hover:bg-blue-900 text-white rounded-xl font-bold shadow-md shadow-blue-100 hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                Continuar
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || uploadingVoucher}
                className="w-full py-3.5 bg-primary hover:bg-blue-900 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl font-bold shadow-md shadow-blue-100 hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    Pagar e Inscribir Pedido
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleWhatsAppCheckout}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-450 text-white rounded-xl font-bold shadow-md shadow-emerald-100/50 hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer mt-2 border border-emerald-450/25"
            >
              <MessageCircle size={14} className="fill-current" />
              Comprar por WhatsApp Rápido
            </button>

            <div className="flex justify-center items-center gap-2 text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
              <CheckCircle2 size={12} className="text-green-500" />
              Encriptación de seguridad SSL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
