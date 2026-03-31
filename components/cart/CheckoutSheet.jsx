import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ChevronRight, Check, Truck } from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'checkout_saved_info';

const COUNTRIES = ['Perú', 'Colombia', 'Chile', 'Argentina', 'México', 'Ecuador', 'Bolivia'];

const SHIPPING_METHODS = [
  { id: 'standard', label: 'Envío estándar', description: '5-7 días hábiles', price: 15 },
  { id: 'express', label: 'Envío express', description: '2-3 días hábiles', price: 25 },
  { id: 'pickup', label: 'Recojo en tienda', description: 'Coordinar con la marca', price: 0 },
];

export default function CheckoutSheet({ open, onOpenChange, total, items }) {
  const [saveInfo, setSaveInfo] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('');
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
    if (open) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm(f => ({ ...f, ...parsed }));
        setSaveInfo(true);
      }
    }
  }, [open]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const selectedShipping = SHIPPING_METHODS.find(m => m.id === shippingMethod);
  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  const finalTotal = total + shippingCost;

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.address || !form.city || !form.phone) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }
    if (!shippingMethod) {
      toast.error('Selecciona un método de envío');
      return;
    }

    if (saveInfo) {
      const toSave = { country: form.country, first_name: form.first_name, last_name: form.last_name, address: form.address, city: form.city, postal_code: form.postal_code, phone: form.phone };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    toast.success('¡Pedido recibido! Te contactaremos pronto.');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-zinc-950 border-zinc-800 w-full max-w-sm flex flex-col p-0 overflow-hidden">
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-zinc-800 flex-shrink-0">
          <SheetTitle className="text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-violet-400" />
            Finalizar compra
          </SheetTitle>
          <p className="text-zinc-500 text-sm">Subtotal: <span className="text-white font-bold">S/ {total.toLocaleString()}</span></p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Entrega */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Entrega</h3>

            {/* País */}
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

            {/* Nombre + Apellidos */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-zinc-400 text-xs mb-1 block">Nombre *</Label>
                <Input value={form.first_name} onChange={set('first_name')} placeholder="Juan" className="bg-zinc-900 border-zinc-700 text-white" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs mb-1 block">Apellidos *</Label>
                <Input value={form.last_name} onChange={set('last_name')} placeholder="Pérez" className="bg-zinc-900 border-zinc-700 text-white" />
              </div>
            </div>

            {/* DNI */}
            <div>
              <Label className="text-zinc-400 text-xs mb-1 block">DNI, CE o Pasaporte</Label>
              <Input value={form.document} onChange={set('document')} placeholder="12345678" className="bg-zinc-900 border-zinc-700 text-white" />
            </div>

            {/* Dirección */}
            <div>
              <Label className="text-zinc-400 text-xs mb-1 block">Dirección *</Label>
              <Input value={form.address} onChange={set('address')} placeholder="Av. Ejemplo 123" className="bg-zinc-900 border-zinc-700 text-white" />
            </div>

            {/* Dpto opcional */}
            <div>
              <Label className="text-zinc-400 text-xs mb-1 block">Casa, apartamento, etc. (opcional)</Label>
              <Input value={form.address2} onChange={set('address2')} placeholder="Apto 4B" className="bg-zinc-900 border-zinc-700 text-white" />
            </div>

            {/* Ciudad + Postal */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-zinc-400 text-xs mb-1 block">Ciudad *</Label>
                <Input value={form.city} onChange={set('city')} placeholder="Lima" className="bg-zinc-900 border-zinc-700 text-white" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs mb-1 block">Código postal (opcional)</Label>
                <Input value={form.postal_code} onChange={set('postal_code')} placeholder="15001" className="bg-zinc-900 border-zinc-700 text-white" />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <Label className="text-zinc-400 text-xs mb-1 block">Teléfono *</Label>
              <Input value={form.phone} onChange={set('phone')} placeholder="+51 999 999 999" className="bg-zinc-900 border-zinc-700 text-white" />
            </div>
          </div>

          {/* Métodos de envío */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-violet-400" />
              Métodos de envío
            </h3>
            {shippingMethod === '' && (
              <p className="text-zinc-500 text-xs italic">Selecciona un método de envío</p>
            )}
            <div className="space-y-2">
              {SHIPPING_METHODS.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setShippingMethod(m.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                    shippingMethod === m.id
                      ? 'border-violet-500 bg-violet-600/10'
                      : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      shippingMethod === m.id ? 'border-violet-500 bg-violet-500' : 'border-zinc-600'
                    }`}>
                      {shippingMethod === m.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{m.label}</p>
                      <p className="text-zinc-500 text-xs">{m.description}</p>
                    </div>
                  </div>
                  <span className="text-white text-sm font-semibold flex-shrink-0">
                    {m.price === 0 ? 'Gratis' : `S/ ${m.price}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

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

        {/* Footer */}
        <div className="px-5 py-5 border-t border-zinc-800 flex-shrink-0 space-y-3">
          {selectedShipping && (
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Envío ({selectedShipping.label})</span>
              <span className="text-white">{selectedShipping.price === 0 ? 'Gratis' : `S/ ${selectedShipping.price}`}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-white">
            <span>Total</span>
            <span>S/ {finalTotal.toLocaleString()}</span>
          </div>
          <Button onClick={handleSubmit} className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-full h-12 font-semibold text-base flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Confirmar pedido
            <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-center text-zinc-600 text-xs flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Pago 100% seguro y encriptado
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}