import ShippingWidget from '@/components/widget/ShippingWidget';
import CheckoutSheet from './CheckoutSheet';
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag, Tag, X } from 'lucide-react';
import { useCart } from './CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-3 py-4 border-b border-zinc-800">
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0">
        {item.image
          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-zinc-800" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-violet-400 uppercase tracking-wider">{item.brand_name}</p>
        <p className="text-sm font-semibold text-white truncate">{item.name}</p>
        {item.size && item.size !== 'Unica' && (
          <p className="text-xs text-zinc-500">Talla: {item.size}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          {/* Quantity controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.key, item.quantity - 1)}
              className="w-6 h-6 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-sm font-medium text-white w-4 text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.key, item.quantity + 1)}
              className="w-6 h-6 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">${(item.price * item.quantity).toLocaleString()}</span>
            <button
              onClick={() => removeItem(item.key)}
              className="text-zinc-600 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { items, total, itemCount, isOpen, setIsOpen, clearCart } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const discount = appliedCoupon
    ? appliedCoupon.discount_type === 'percent'
      ? Math.round(total * appliedCoupon.discount_value / 100)
      : Math.min(appliedCoupon.discount_value, total)
    : 0;
  const finalTotal = total - discount;



  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCheckingCoupon(true);
    setCouponError('');
    const results = await base44.entities.DiscountCode.filter({ code, active: true });
    const coupon = results?.[0];
    if (!coupon) {
      setCouponError('Código no válido o inactivo');
      setCheckingCoupon(false);
      return;
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      setCouponError('Este código ha vencido');
      setCheckingCoupon(false);
      return;
    }
    if (coupon.max_uses && coupon.times_used >= coupon.max_uses) {
      setCouponError('Este código ya alcanzó su límite de usos');
      setCheckingCoupon(false);
      return;
    }
    if (coupon.min_order && total < coupon.min_order) {
      setCouponError(`Pedido mínimo S/ ${coupon.min_order} para usar este código`);
      setCheckingCoupon(false);
      return;
    }
    // Check brand match — coupon only applies to items from that brand
    const brandItems = items.filter(i => i.brand_name === coupon.brand_name || !coupon.brand_id);
    if (brandItems.length === 0) {
      setCouponError(`Este código es solo para productos de ${coupon.brand_name}`);
      setCheckingCoupon(false);
      return;
    }
    setAppliedCoupon(coupon);
    setCheckingCoupon(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  return (
    <>
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="bg-zinc-950 border-zinc-800 w-full max-w-sm flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-zinc-800">
          <SheetTitle className="text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-violet-400" />
            Carrito
            {itemCount > 0 && (
              <span className="ml-1 text-sm font-normal text-zinc-400">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
            <ShoppingBag className="w-12 h-12 text-zinc-700 mb-4" />
            <p className="text-zinc-400 font-medium">Tu carrito está vacío</p>
            <p className="text-zinc-600 text-sm mt-1">Agrega productos desde el catálogo</p>
            <Link to="/Catalog" onClick={() => setIsOpen(false)}>
              <Button className="mt-6 bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6">
                Explorar catálogo
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              {items.map(item => <CartItem key={item.key} item={item} />)}
            </div>

            <div className="px-5 py-5 border-t border-zinc-800 space-y-4">
              {/* Coupon input */}
              {appliedCoupon ? (
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-3 py-2.5">
                  <Tag className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-green-400 text-xs font-bold">{appliedCoupon.code}</p>
                    <p className="text-green-300 text-xs">
                      {appliedCoupon.discount_type === 'percent'
                        ? `${appliedCoupon.discount_value}% de descuento`
                        : `S/ ${appliedCoupon.discount_value} de descuento`}
                    </p>
                  </div>
                  <button onClick={removeCoupon} className="text-zinc-500 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Código de descuento"
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 font-mono uppercase"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={checkingCoupon || !couponInput.trim()}
                      variant="outline"
                      className="border-zinc-700 text-zinc-300 rounded-full h-9 text-xs px-4 flex-shrink-0"
                    >
                      {checkingCoupon ? '...' : 'Aplicar'}
                    </Button>
                  </div>
                  {couponError && <p className="text-red-400 text-xs pl-1">{couponError}</p>}
                </div>
              )}

              {/* Totals */}
              <div className="space-y-1">
                {[...new Set(items.map(i => i.brand_name))].map(brand => {
                  const brandTotal = items
                    .filter(i => i.brand_name === brand)
                    .reduce((s, i) => s + i.price * i.quantity, 0);
                  return (
                    <div key={brand} className="flex justify-between text-xs text-zinc-500">
                      <span>{brand}</span>
                      <span>S/ {brandTotal.toLocaleString()}</span>
                    </div>
                  );
                })}
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-green-400">
                    <span>Descuento ({appliedCoupon.code})</span>
                    <span>- S/ {discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-zinc-300 font-semibold">Total</span>
                <div className="text-right">
                  {discount > 0 && (
                    <p className="text-xs text-zinc-500 line-through">S/ {total.toLocaleString()}</p>
                  )}
                  <span className="text-2xl font-black text-white">S/ {finalTotal.toLocaleString()}</span>
                </div>
              </div>
              <ShippingWidget />
              <Button onClick={() => { setIsOpen(false); navigate('/finalizar_compra'); }} className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-full h-12 font-semibold text-base">
                Finalizar compra
              </Button>
              <button
                onClick={clearCart}
                className="w-full text-xs text-zinc-600 hover:text-red-400 transition-colors py-1"
              >
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
    <CheckoutSheet open={checkoutOpen} onOpenChange={setCheckoutOpen} total={finalTotal} items={items} />
    </>
  );
}