import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { MapPin, ExternalLink, Instagram, ArrowLeft, BadgeCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import ProductGrid from '../components/products/ProductGrid';
import ChatWidget from '../components/chat/ChatWidget';
import DropCountdownCard from '../components/drops/DropCountdownCard';

export default function BrandProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const brandId = urlParams.get('id');
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: brand, isLoading: loadingBrand } = useQuery({
    queryKey: ['brand', brandId],
    queryFn: () => base44.entities.Brand.filter({ id: brandId }),
    select: (data) => data?.[0],
    enabled: !!brandId,
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['brand-products', brandId],
    queryFn: () => base44.entities.Product.filter({ brand_id: brandId, status: 'active' }),
    enabled: !!brandId,
    initialData: [],
  });

  const { data: drops = [] } = useQuery({
    queryKey: ['brand-drops', brandId],
    queryFn: () => base44.entities.Drop.filter({ brand_id: brandId, active: true }, '-drop_date'),
    enabled: !!brandId,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['drop-notifications', user?.email],
    queryFn: () => base44.entities.DropNotification.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const handleToggleNotification = async (drop, hasNotif) => {
    if (hasNotif) {
      const existing = notifications.find(n => n.drop_id === drop.id);
      if (existing) {
        await base44.entities.DropNotification.delete(existing.id);
        toast.success('Notificación cancelada');
      }
    } else {
      await base44.entities.DropNotification.create({
        drop_id: drop.id,
        drop_title: drop.title,
        brand_name: drop.brand_name,
        brand_id: drop.brand_id,
        drop_date: drop.drop_date,
        user_email: user.email,
      });
      toast.success('¡Te avisaremos por email cuando salga este drop! 🔔');
    }
    queryClient.invalidateQueries({ queryKey: ['drop-notifications'] });
  };

  // Group products by drop_id
  const productsWithDrop = drops.map(drop => ({
    drop,
    products: products.filter(p => p.drop_id === drop.id),
  }));

  // Upcoming drops with no products yet — show countdown only
  const upcomingEmptyDrops = productsWithDrop.filter(
    g => g.products.length === 0 && new Date(g.drop.drop_date) > new Date()
  );

  const productsWithoutDrop = products.filter(p => !p.drop_id);

  if (loadingBrand) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-48 w-full rounded-2xl bg-zinc-800" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-8 w-48 bg-zinc-800" />
          <Skeleton className="h-4 w-96 bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-zinc-500 text-lg">Marca no encontrada</p>
        <Link to="/Brands">
          <Button variant="outline" className="mt-4 border-zinc-700 text-zinc-300 rounded-full">
            Volver a marcas
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Cover */}
      <div className="relative h-48 md:h-64 bg-zinc-900">
        {brand.cover_url && (
          <img src={brand.cover_url} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative">
        <Link to="/Brands" className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Marcas
        </Link>

        {/* Brand info */}
        <div className="flex flex-col md:flex-row items-start gap-6 mb-10">
          <div className="w-24 h-24 rounded-2xl bg-zinc-800 overflow-hidden border-4 border-zinc-950 flex-shrink-0">
            {brand.logo_url ? (
              <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-black text-zinc-500">
                {brand.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-black text-white">{brand.name}</h1>
              {brand.status === 'active' && (
                <div className="flex items-center gap-1 bg-violet-500/20 border border-violet-500/40 rounded-full px-2.5 py-1">
                  <BadgeCheck className="w-4 h-4 text-violet-400 fill-violet-400/20" />
                  <span className="text-xs font-semibold text-violet-300">Verificada</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {brand.city && (
                <span className="flex items-center gap-1 text-sm text-zinc-400">
                  <MapPin className="w-4 h-4" /> {brand.city}
                </span>
              )}
              {brand.instagram && (
                <a href={`https://instagram.com/${brand.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-zinc-400 hover:text-violet-400 transition-colors">
                  <Instagram className="w-4 h-4" /> @{brand.instagram}
                </a>
              )}
              {brand.website && (
                <a href={brand.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-zinc-400 hover:text-violet-400 transition-colors">
                  <ExternalLink className="w-4 h-4" /> Sitio web
                </a>
              )}
            </div>
            {brand.description && (
              <p className="text-zinc-400 mt-4 max-w-2xl leading-relaxed">{brand.description}</p>
            )}
            <div className="mt-4">
              <ChatWidget brand={brand} />
            </div>
          </div>
        </div>

        {/* Products grouped by drops */}
        <div className="space-y-10">
          {/* Upcoming drops without products yet */}
          {upcomingEmptyDrops.map(({ drop }) => (
            <DropCountdownCard key={drop.id} drop={drop} userEmail={user?.email} notifications={notifications} onToggleNotification={handleToggleNotification} />
          ))}

          {productsWithDrop.filter(g => g.products.length > 0).map(({ drop, products: dropProducts }) => {
            const isPast = new Date(drop.drop_date) < new Date();
            return (
              <div key={drop.id}>
                {/* Countdown card for upcoming drops */}
                {!isPast && (
                  <div className="mb-5">
                    <DropCountdownCard drop={drop} userEmail={user?.email} notifications={notifications} onToggleNotification={handleToggleNotification} />
                  </div>
                )}
                {isPast && (
                  <div className="flex items-center gap-3 mb-5">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-xl font-bold text-white">{drop.title}</h2>
                    <Badge className="text-xs bg-violet-500/20 text-violet-300 border-violet-500/30">¡En vivo!</Badge>
                    <span className="text-xs text-zinc-500">
                      {new Date(drop.drop_date).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                )}
                <ProductGrid products={dropProducts} isLoading={loadingProducts} />
              </div>
            );
          })}
          
          {productsWithoutDrop.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-5">
                {productsWithDrop.length > 0 ? 'Otros productos' : `Productos (${productsWithoutDrop.length})`}
              </h2>
              <ProductGrid products={productsWithoutDrop} isLoading={loadingProducts} />
            </div>
          )}

          {!loadingProducts && products.length === 0 && (
            <p className="text-zinc-500 text-center py-12">Esta marca aún no tiene productos publicados.</p>
          )}
        </div>
      </div>
    </div>
  );
}