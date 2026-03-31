import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Flame, Crown, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import BrandReviewsCarousel from '../components/pricing/BrandReviewsCarousel';

const PLANS = [
  {
    id: 'rookie',
    name: 'The Rookie',
    introPrice: 9.90,
    price: 19.90,
    maxProducts: 10,
    maxDropImages: 1,
    icon: Zap,
    color: 'from-blue-600/20 to-blue-800/10',
    border: 'border-blue-500/30',
    accent: 'text-blue-400',
    badge: null,
    description: 'Ideal para marcas que están lanzando su primer drop.',
    perks: [
      'Hasta 5 prendas activas',
      'Perfil de marca público',
      'Lanza DROPS con cuenta regresiva',
      'Hasta 4 prendas programadas por drop',
      '3 imágenes teaser en drops',
      'Mensajes de compradores',
    ],
  },
  {
    id: 'hustler',
    name: 'The Hustler',
    introPrice: 19.90,
    price: 29.90,
    maxProducts: 20,
    maxDropImages: 3,
    icon: Flame,
    color: 'from-violet-600/30 to-violet-900/20',
    border: 'border-violet-500/60',
    accent: 'text-violet-400',
    badge: 'Recomendado',
    description: 'El punto dulce donde la marca ya tiene un catálogo variado.',
    perks: [
      'Hasta 20 prendas activas',
      'Lanza DROPS con cuenta regresiva',
      'Hasta 8 prendas programadas por drop',
      '3 imágenes teaser en drops',
      'Boton de "Notificarme" para compradores',
      'Sello de marca verificada',
      'Posición prioritaria en catálogo',
      'Mensajes de compradores',
    ],
  },
  {
    id: 'boss',
    name: 'Street Boss',
    introPrice: 39.90,
    price: 49.90,
    maxProducts: 50,
    maxDropImages: 5,
    icon: Crown,
    color: 'from-yellow-600/20 to-yellow-900/10',
    border: 'border-yellow-500/40',
    accent: 'text-yellow-400',
    badge: 'Pro',
    description: 'Para marcas con inventario constante y colecciones grandes.',
    perks: [
      'Hasta 40 prendas activas',
      'Lanza de DROPS con cuenta regresiva',
      'Hasta 15 prendas programadas por drop',
      '7 imágenes teaser en drops',
      'Boton de "Notificarme" para compradores',
      'Sello de marca verificada',
      'Posición prioritaria en catálogo',
      'Mensajes de compradores',
    ],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selecting, setSelecting] = useState(null);
  const [showFreePlan, setShowFreePlan] = useState(false);
  const [count, setCount] = useState(113);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 5) - 2);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['my-brand', user?.email],
    queryFn: () => base44.entities.Brand.filter({ created_by: user.email }),
    enabled: !!user?.email,
  });
  const brand = brands?.[0];

  const { data: subs = [] } = useQuery({
    queryKey: ['my-subscription', brand?.id],
    queryFn: () => base44.entities.Subscription.filter({ brand_id: brand.id, status: 'active' }),
    enabled: !!brand?.id,
  });
  const activeSub = subs?.[0];

  const handleSelect = async (plan) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    if (!brand) {
      toast.error('Primero debes crear tu marca');
      navigate('/BrandDashboard');
      return;
    }
    setSelecting(plan.id);

    // Cancel existing subscription if any
    if (activeSub?.id) {
      await base44.entities.Subscription.update(activeSub.id, { status: 'cancelled' });
    }

    // Calculate expiry (30 days from now)
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    await base44.entities.Subscription.create({
      brand_id: brand.id,
      brand_name: brand.name,
      plan: plan.id,
      status: 'active',
      max_products: plan.maxProducts,
      price_soles: plan.introPrice,
      expires_at: expires.toISOString().split('T')[0],
    });

    queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
    toast.success(`¡Plan ${plan.name} activado! 🔥`);
    setSelecting(null);
    navigate('/BrandDashboard');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="hidden md:block mb-4">
          <Badge className="bg-violet-600/20 text-violet-400 border-violet-500/30 mb-4 text-xs px-3 py-1">
            Escalabilidad por Hype
          </Badge>
        </div>
        <div className="inline-flex items-center gap-2 mb-4 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-300 text-sm font-medium">
            <span className="font-bold text-green-200">{count}</span> personas conectadas buscando su próximo outfit
          </span>
        </div>
        <Badge className="md:hidden bg-violet-600/20 text-violet-400 border-violet-500/30 mb-4 text-xs px-3 py-1">
          Escalabilidad por Hype
        </Badge>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Elige tu nivel
        </h1>
        <p className="text-zinc-400 text-lg max-w-md mx-auto">
          Publica tus prendas y llega a miles de compradores de streetwear en todo el país.
        </p>
        
        {/* Free Plan Info */}
        <div className="mt-6">
          <p className="text-zinc-500 text-sm mb-2">Actualmente cuentas con el plan gratuito</p>
          <button
            onClick={() => setShowFreePlan(!showFreePlan)}
            className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-400 transition-colors text-sm"
          >
            Ver más
            <ChevronDown className={`w-4 h-4 transition-transform ${showFreePlan ? 'rotate-180' : ''}`} />
          </button>
          {showFreePlan && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-1 text-zinc-500 text-sm"
            >
              <p>✓ 1 prenda activa durante un mes</p>
              <p>✓ Mensajes de compradores</p>
              <p>❌ No puede programar drops</p>
            </motion.div>
          )}
        </div>
      </div>
      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan, i) => {
          const Icon = plan.icon;
          const isCurrent = activeSub?.plan === plan.id;
          const isLoading = selecting === plan.id;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border bg-gradient-to-b ${plan.color} ${plan.border} p-6 flex flex-col ${
                plan.badge === 'Recomendado' ? 'ring-2 ring-violet-500/50' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className={`text-xs font-bold px-3 py-1 ${
                    plan.badge === 'Recomendado'
                      ? 'bg-violet-600 text-white border-0'
                      : 'bg-yellow-500 text-black border-0'
                  }`}>
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <div className={`w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center mb-4 ${plan.accent}`}>
                <Icon className="w-5 h-5" />
              </div>

              <h2 className="text-xl font-black text-white">{plan.name}</h2>
              <p className="text-zinc-400 text-sm mt-1 mb-4">{plan.description}</p>

              <div className="mb-1">
                <span className="text-4xl font-black text-white">S/ {plan.introPrice.toFixed(2)}</span>
                <span className="text-zinc-500 text-sm"> primer mes</span>
              </div>
              <p className={`text-sm font-semibold ${plan.accent} mb-6`}>
                Luego S/ {plan.price.toFixed(2)}/mes
              </p>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.accent}`} />
                    {perk}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelect(plan)}
                disabled={isCurrent || !!selecting}
                className={`w-full rounded-full h-11 font-bold transition-all ${
                  isCurrent
                    ? 'bg-zinc-700 text-zinc-400 cursor-default'
                    : plan.id === 'hustler'
                    ? 'bg-violet-600 hover:bg-violet-700 text-white'
                    : plan.id === 'boss'
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCurrent ? (
                  '✓ Plan actual'
                ) : (
                  `Elegir ${plan.name}`
                )}
              </Button>
              {isCurrent && (
                <button
                  onClick={() => {
                    if (activeSub?.id) {
                      base44.entities.Subscription.update(activeSub.id, { status: 'cancelled' });
                      queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
                      toast.success('Suscripción cancelada');
                    }
                  }}
                  className="w-full text-xs text-zinc-500 hover:text-zinc-400 transition-colors mt-2"
                >
                  Anular suscripción
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-zinc-600 text-xs mt-8">
        Precio introductorio el primer mes. Los planes se renuevan mensualmente al precio regular. Puedes cambiar o cancelar en cualquier momento.
      </p>

      <BrandReviewsCarousel />
    </div>
  );
}