import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Brands() {
  const { data: brands, isLoading } = useQuery({
    queryKey: ['all-brands'],
    queryFn: () => base44.entities.Brand.filter({ status: 'active' }),
    initialData: [],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-white">Marcas</h1>
        <p className="text-zinc-500 mt-1 text-sm">Descubre las marcas emergentes de streetwear</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl bg-zinc-800" />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-lg">Aún no hay marcas registradas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/BrandProfile?id=${brand.id}`}
                className="group block relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all"
              >
                {/* Cover */}
                <div className="h-28 bg-gradient-to-br from-violet-900/50 to-fuchsia-900/50 overflow-hidden">
                  {brand.cover_url && (
                    <img src={brand.cover_url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Content */}
                <div className="px-5 pb-5 -mt-8">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-4 border-zinc-950">
                    {brand.logo_url ? (
                      <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-black text-zinc-500 bg-zinc-800">
                        {brand.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                    {brand.name}
                  </h3>
                  {brand.city && (
                    <p className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                      <MapPin className="w-3 h-3" /> {brand.city}
                    </p>
                  )}
                  {brand.description && (
                    <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{brand.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    {brand.instagram && (
                      <span className="text-xs text-zinc-500">@{brand.instagram}</span>
                    )}
                    {brand.website && (
                      <ExternalLink className="w-3 h-3 text-zinc-600" />
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}