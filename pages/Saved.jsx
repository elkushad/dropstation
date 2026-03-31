import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function SavedPage() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: savedItems = [], isLoading } = useQuery({
    queryKey: ['saved', user?.email],
    queryFn: () => base44.entities.Saved.filter({ created_by: user.email }, '-created_date'),
    enabled: !!user?.email,
    initialData: [],
  });

  const handleRemove = async (id) => {
    await base44.entities.Saved.delete(id);
    queryClient.invalidateQueries({ queryKey: ['saved'] });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-6 h-6 text-red-400 fill-current" />
        <h1 className="text-3xl font-black text-white">Mis favoritos</h1>
        {savedItems.length > 0 && (
          <span className="text-zinc-500 text-sm">({savedItems.length} prendas)</span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] rounded-2xl bg-zinc-800" />
              <Skeleton className="h-3 w-16 bg-zinc-800" />
              <Skeleton className="h-4 w-32 bg-zinc-800" />
            </div>
          ))}
        </div>
      ) : savedItems.length === 0 ? (
        <div className="text-center py-24">
          <Heart className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 text-lg font-semibold">Aún no tienes favoritos</p>
          <p className="text-zinc-600 text-sm mt-2">
            Toca el corazón en cualquier producto para guardarlo aquí
          </p>
          <Link to="/Catalog">
            <Button className="mt-6 bg-violet-600 hover:bg-violet-700 text-white rounded-full px-8">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Explorar catálogo
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {savedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative"
            >
              <Link to={`/ProductDetail?id=${item.product_id}`} className="block">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900">
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-10 h-10 text-zinc-700" />
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); handleRemove(item.id); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-[11px] font-medium text-violet-400 uppercase tracking-wider">
                    {item.brand_name || 'Marca'}
                  </p>
                  <h3 className="text-sm font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                    {item.product_name}
                  </h3>
                  {item.product_price && (
                    <span className="text-base font-bold text-white">
                      ${item.product_price?.toLocaleString()}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}