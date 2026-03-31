import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Zap, Flame, Crown, AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PLAN_META = {
  rookie:  { label: 'The Rookie',  icon: Zap,    color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',   max: 10 },
  hustler: { label: 'The Hustler', icon: Flame,  color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', max: 20 },
  boss:    { label: 'Street Boss', icon: Crown,  color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', max: 50 },
};

export default function SubscriptionBanner({ brandId, productCount }) {
  const { data: subs = [] } = useQuery({
    queryKey: ['my-subscription', brandId],
    queryFn: () => base44.entities.Subscription.filter({ brand_id: brandId, status: 'active' }),
    enabled: !!brandId,
  });
  const sub = subs?.[0];
  const meta = sub ? PLAN_META[sub.plan] : null;
  const Icon = meta?.icon || AlertTriangle;

  if (!sub) {
    return (
      <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
        <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Sin plan activo</p>
          <p className="text-zinc-400 text-xs mt-0.5">
            Necesitas un plan para publicar prendas y llegar a compradores.
          </p>
        </div>
        <Link to="/Pricing">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-full text-sm h-9 flex-shrink-0">
            Ver planes
          </Button>
        </Link>
      </div>
    );
  }

  const used = productCount || 0;
  const pct = Math.round((used / sub.max_products) * 100);
  const nearLimit = pct >= 80;

  return (
    <div className={`rounded-xl border ${meta.bg} p-4 flex flex-col md:flex-row items-start md:items-center gap-4 mb-8`}>
      <div className={`w-9 h-9 rounded-lg bg-black/30 flex items-center justify-center flex-shrink-0 ${meta.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white font-semibold text-sm">{meta.label}</span>
          <Badge className={`text-[10px] border ${meta.bg} ${meta.color}`}>Activo</Badge>
          {nearLimit && (
            <Badge className="text-[10px] bg-orange-500/20 text-orange-400 border-orange-500/30">
              Casi al límite
            </Badge>
          )}
        </div>
        {/* Progress bar */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-1.5 rounded-full bg-black/30 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${nearLimit ? 'bg-orange-400' : 'bg-current'} ${meta.color}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span className="text-xs text-zinc-400 flex-shrink-0 flex items-center gap-1">
            <Package className="w-3 h-3" />
            {used}/{sub.max_products} prendas
          </span>
        </div>
      </div>
      <Link to="/Pricing">
        <Button variant="outline" className="border-zinc-700 text-zinc-300 rounded-full text-xs h-8 flex-shrink-0">
          Cambiar plan
        </Button>
      </Link>
    </div>
  );
}