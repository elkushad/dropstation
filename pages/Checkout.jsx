import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ChevronRight, Check, ShoppingBag } from 'lucide-react';
import CotizaEnviosWidget from '../components/widget/CotizaEnviosWidget';
import { useCart } from '../components/cart/CartContext';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'checkout_saved_info';
const COUNTRIES = ['Perú', 'Colombia', 'Chile', 'Argentina', 'México', 'Ecuador', 'Bolivia'];


export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [saveInfo, setSaveInfo] = useState(false);
  const [form, setForm] = useState({
    country: 'Perú',
    first_name: '',
    last_name: '',
    document: '',
    address: '',
    address2: '',
    city: '',
    postal_code: '',
    phone: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setForm(f => ({ ...f, ...parsed }));
      setSaveInfo(true);
    }
  }, []);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const finalTotal = total;

  const handleSubmit = () => {
    if (!form.first_name || !form.last_name || !form.address || !form.city || !form.phone) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    if (saveInfo) {
      const toSave = { country: form.country, first_name: form.first_name, last_name: form.last_name, address: form.address, city: form.city, postal_code: form.postal_code, phone: form.phone };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    toast.success('¡Pedido recibido! Te contactaremos pronto.');
    clearCart();
    navigate('/');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <ShoppingBag className="w-12 h-12 text-zinc-700" />
        <p className="text-zinc-400 font-medium">Tu carrito está vacío</p>
        <Link to="/Catalog">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6">Explorar catálogo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Link to="/" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">← Volver</Link>
          <h1 className="text-2xl font-black text-white mt-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-violet-400" /> Finalizar compra
          </h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10">

          {/* Left — form */}
          <div className="space-y-8">

            {/* Entrega */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-white border-b border-zinc-800 pb-2">Entrega</h2>

              <div>
                <Label className="text-zinc-400 text-xs mb-1 block">País/región</Label>
                <select
                  value={form.country}
                  onChange={set('country')}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                >
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400 text-xs mb-1 block">Nombre *</Label>
                  <Input value={form.first_name} onChange={set('first_name')} placeholder="Juan" className="bg-zinc-900 border-zinc-700 text-white" />
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs mb-1 block">Apellidos *</Label>
                  <Input value={form.last_name} onChange={set('last_name')} placeholder="Pérez" className="bg-zinc-900 border-zinc-700 text-white" />
                </div>
              </div>

              <div>
                <Label className="text-zinc-400 text-xs mb-1 block">DNI, CE o Pasaporte</Label>
                <Input value={form.document} onChange={set('document')} placeholder="12345678" className="bg-zinc-900 border-zinc-700 text-white" />
              </div>

              <div>
                <Label className="text-zinc-400 text-xs mb-1 block">Dirección *</Label>
                <Input value={form.address} onChange={set('address')} placeholder="Av. Ejemplo 123" className="bg-zinc-900 border-zinc-700 text-white" />
              </div>

              <div>
                <Label className="text-zinc-400 text-xs mb-1 block">Casa, apartamento, etc. (opcional)</Label>
                <Input value={form.address2} onChange={set('address2')} placeholder="Apto 4B" className="bg-zinc-900 border-zinc-700 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400 text-xs mb-1 block">Ciudad *</Label>
                  <Input value={form.city} onChange={set('city')} placeholder="Lima" className="bg-zinc-900 border-zinc-700 text-white" />
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs mb-1 block">Código postal (opcional)</Label>
                  <Input value={form.postal_code} onChange={set('postal_code')} placeholder="15001" className="bg-zinc-900 border-zinc-700 text-white" />
                </div>
              </div>

              <div>
                <Label className="text-zinc-400 text-xs mb-1 block">Teléfono *</Label>
                <Input value={form.phone} onChange={set('phone')} placeholder="+51 999 999 999" className="bg-zinc-900 border-zinc-700 text-white" />
              </div>
            </section>

            {/* Widget de envío */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-white border-b border-zinc-800 pb-2">Coordinar envío</h2>
              <CotizaEnviosWidget />
            </section>

            {/* Guardar info */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <button
                type="button"
                onClick={() => setSaveInfo(!saveInfo)}
                className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors mt-0.5 ${
                  saveInfo ? 'bg-violet-600 border-violet-600' : 'border-zinc-600 bg-transparent group-hover:border-violet-500'
                }`}
              >
                {saveInfo && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className="text-zinc-400 text-sm leading-snug">Guardar información para comprar más rápido la próxima vez.</span>
            </label>
          </div>

          {/* Right — order summary */}
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 sticky top-6">
              <h2 className="text-base font-bold text-white">Resumen del pedido</h2>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map(item => (
                  <div key={item.key} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-zinc-800" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{item.name}</p>
                      <p className="text-zinc-500 text-xs">{item.brand_name}{item.size && item.size !== 'Unica' ? ` · ${item.size}` : ''}</p>
                      <p className="text-zinc-400 text-xs">x{item.quantity}</p>
                    </div>
                    <span className="text-white text-sm font-semibold flex-shrink-0">S/ {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-800 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white">S/ {total.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-zinc-800">
                  <span>Total</span>
                  <span>S/ {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-full h-12 font-semibold flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Confirmar pedido
                <ChevronRight className="w-4 h-4" />
              </Button>
              <p className="text-center text-zinc-600 text-xs flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Pago 100% seguro y encriptado
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}